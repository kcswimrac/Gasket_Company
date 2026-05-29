import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { fetchBlob } from "@/lib/autoquote/client";

export const runtime = "nodejs";
export const maxDuration = 300;

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function getAutoQuoteConfig() {
  const baseUrl = process.env.AUTOQUOTE_BASE_URL;
  const token = process.env.AUTOQUOTE_BRIDGE_TOKEN;
  if (!baseUrl || !token) throw new Error("AUTOQUOTE_BASE_URL and AUTOQUOTE_BRIDGE_TOKEN must be set");
  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

interface DetectedFeature {
  kind: string;
  parameters: Record<string, unknown>;
  n_points: number;
  fit_error_mm: number;
  confidence: number;
}

interface FlaggedRegion {
  n_points: number;
  bbox_min_mm: number[];
  bbox_max_mm: number[];
  reason: string;
}

interface ScanToCadResult {
  job_id: string;
  status: "processing" | "completed" | "review_needed" | "failed";
  confidence?: number;
  detected_features?: DetectedFeature[];
  flagged_regions?: FlaggedRegion[];
  processing_time_seconds?: number;
  error_type?: string;
  error_message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { scanQueueId, partTypeHint, targetToleranceMm } = await request.json();

    if (!scanQueueId) {
      return NextResponse.json({ success: false, error: "scanQueueId is required" }, { status: 400 });
    }

    const items = await sql`SELECT * FROM scan_queue WHERE id = ${scanQueueId}`;
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Scan queue item not found" }, { status: 404 });
    }

    // Find mesh file (scan_processed preferred, then scan_raw)
    const meshFiles = await sql`
      SELECT * FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId}
        AND artifact_type IN ('scan_processed', 'scan_raw')
        AND superseded_by IS NULL
      ORDER BY CASE artifact_type WHEN 'scan_processed' THEN 0 ELSE 1 END, version DESC
      LIMIT 1
    `;
    if (meshFiles.length === 0) {
      return NextResponse.json({ success: false, error: "No mesh file found. Upload a scan file first." }, { status: 400 });
    }

    const meshUrl = meshFiles[0].file_url as string;
    const meshFileName = meshFiles[0].file_name as string;

    let meshBlob: Blob;
    try {
      meshBlob = await fetchBlob(meshUrl);
    } catch (e) {
      return NextResponse.json({ success: false, error: `Failed to fetch mesh: ${e instanceof Error ? e.message : "Unknown"}` }, { status: 500 });
    }

    // Update status
    await sql`UPDATE scan_queue SET status = 'cad_generating' WHERE id = ${scanQueueId}`;

    let aqConfig: { baseUrl: string; token: string };
    try {
      aqConfig = getAutoQuoteConfig();
    } catch (e) {
      await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
      return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "AutoQuote not configured" }, { status: 500 });
    }

    // Submit to AutoQuote
    const formData = new FormData();
    formData.append("file", meshBlob, meshFileName);
    if (partTypeHint && partTypeHint !== "auto") formData.append("part_type_hint", partTypeHint);
    if (targetToleranceMm) formData.append("target_tolerance_mm", String(targetToleranceMm));

    let jobId: string;
    try {
      const submitRes = await fetch(`${aqConfig.baseUrl}/bridge/scan-to-cad`, {
        method: "POST",
        headers: { Authorization: `Bearer ${aqConfig.token}` },
        body: formData,
      });

      if (submitRes.status === 404) {
        await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
        return NextResponse.json({ success: false, error: "Scan-to-CAD engine not yet deployed on AutoQuote." }, { status: 404 });
      }
      if (submitRes.status === 422) {
        await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
        const errBody = await submitRes.json().catch(() => ({}));
        return NextResponse.json({ success: false, error: `AutoQuote rejected request: ${errBody.detail || "Check that SCAN_TO_CAD policy is set to AUTO_EXECUTE"}` }, { status: 422 });
      }
      if (!submitRes.ok) {
        await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
        const errBody = await submitRes.json().catch(() => ({ detail: submitRes.statusText }));
        return NextResponse.json({ success: false, error: `AutoQuote error ${submitRes.status}: ${errBody.detail}` }, { status: 502 });
      }

      const submitData = await submitRes.json();
      jobId = submitData.job_id;
    } catch (e) {
      await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED")) {
        return NextResponse.json({ success: false, error: "Scan-to-CAD engine not reachable." }, { status: 503 });
      }
      return NextResponse.json({ success: false, error: `Submit failed: ${msg}` }, { status: 502 });
    }

    // Poll every 5s for up to 4.5 minutes
    const deadline = Date.now() + 270_000;
    let result: ScanToCadResult | null = null;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      try {
        const pollRes = await fetch(`${aqConfig.baseUrl}/bridge/scan-to-cad/${jobId}`, {
          headers: { Authorization: `Bearer ${aqConfig.token}` },
        });
        if (!pollRes.ok) continue;
        const data: ScanToCadResult = await pollRes.json();

        if (data.status === "completed" || data.status === "review_needed") {
          result = data;
          break;
        }
        if (data.status === "failed") {
          await sql`UPDATE scan_queue SET status = 'scanned', notes = COALESCE(notes, '') || ${`\nCAD generation failed: ${data.error_message || data.error_type || "Unknown"}`} WHERE id = ${scanQueueId}`;
          return NextResponse.json({
            success: false,
            error: data.error_message || "CAD generation failed",
            errorType: data.error_type,
          });
        }
      } catch { continue; }
    }

    if (!result) {
      await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
      return NextResponse.json({ success: false, error: "CAD generation timed out. Job may still be processing." }, { status: 504 });
    }

    // Process result
    const confidence = result.confidence ?? 0;
    const features = result.detected_features ?? [];
    const flaggedRegions = result.flagged_regions ?? [];
    const processingTime = result.processing_time_seconds ?? 0;

    // Store the full detection report as a scan artifact
    const reportData = JSON.stringify({
      job_id: jobId,
      confidence,
      detected_features: features,
      flagged_regions: flaggedRegions,
      processing_time_seconds: processingTime,
      part_type_hint: partTypeHint || "auto",
      status: result.status,
    });

    const confidenceLabel = confidence >= 0.85 ? "high" : confidence >= 0.5 ? "medium" : "low";
    const reportNotes = [
      `Auto-detection — confidence: ${(confidence * 100).toFixed(1)}% (${confidenceLabel})`,
      `${features.length} features detected`,
      flaggedRegions.length > 0 ? `${flaggedRegions.length} flagged regions` : null,
      `Processed in ${processingTime.toFixed(1)}s`,
    ].filter(Boolean).join("; ");

    // Get next version for report artifacts
    const verResult = await sql`
      SELECT COALESCE(MAX(version), 0) as max_ver FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'other'
    `;
    const reportVersion = ((verResult[0].max_ver as number) || 0) + 1;

    await sql`
      INSERT INTO scan_artifacts (scan_queue_id, artifact_type, version, file_name, file_url, notes)
      VALUES (${scanQueueId}, 'other', ${reportVersion}, ${'scan_report_' + jobId + '.json'}, ${`data:application/json,${encodeURIComponent(reportData)}`}, ${reportNotes})
    `;

    // Update scan queue status based on confidence
    let newStatus: string;
    let statusNote: string;
    if (confidence >= 0.85) {
      newStatus = "cad_ready";
      statusNote = `Auto-detection complete — high confidence (${(confidence * 100).toFixed(0)}%). Ready for review.`;
    } else if (confidence >= 0.5) {
      newStatus = "cad_ready";
      statusNote = `Auto-detection complete — needs review (${(confidence * 100).toFixed(0)}% confidence). Check flagged regions.`;
    } else {
      newStatus = "scanned";
      statusNote = `Auto-detection low confidence (${(confidence * 100).toFixed(0)}%). Manual modeling recommended.`;
    }

    await sql`
      UPDATE scan_queue SET
        status = ${newStatus},
        notes = COALESCE(notes, '') || ${'\n' + statusNote}
      WHERE id = ${scanQueueId}
    `;

    return NextResponse.json({
      success: true,
      confidence,
      confidenceLabel,
      features: features.map((f) => ({ kind: f.kind, confidence: f.confidence, fitErrorMm: f.fit_error_mm })),
      flaggedRegions: flaggedRegions.map((r) => ({ reason: r.reason, nPoints: r.n_points })),
      processingTimeSeconds: processingTime,
      status: result.status,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
