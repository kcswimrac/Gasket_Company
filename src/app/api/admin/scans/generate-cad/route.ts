import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
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
  if (!baseUrl || !token) {
    throw new Error("AUTOQUOTE_BASE_URL and AUTOQUOTE_BRIDGE_TOKEN must be set");
  }
  return { baseUrl: baseUrl.replace(/\/$/, ""), token };
}

function aqHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

interface ScanToCadSubmitResponse {
  job_id: string;
  status: string;
}

interface ScanToCadStatusResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  confidence?: number;
  features?: string[];
  flagged_regions?: Array<{ region: string; reason: string }>;
  step_file_url?: string;
  error?: string;
}

/**
 * POST /api/admin/scans/generate-cad
 *
 * Accepts: { scanQueueId: string, partTypeHint?: string }
 *
 * 1. Finds the mesh file from scan_artifacts for this scan queue item
 * 2. Fetches the mesh from blob storage
 * 3. Submits to AutoQuote: POST /bridge/scan-to-cad
 * 4. Polls GET /bridge/scan-to-cad/{job_id} until complete
 * 5. On success:
 *    - Downloads the generated STEP file, stores in Vercel Blob
 *    - Creates a scan_artifact with artifact_type="cad_model" and notes including confidence
 *    - Updates scan queue status to "cad_ready"
 *    - If confidence > 0.85, adds note "Auto-generated — high confidence"
 * 6. Returns: { success, confidence, features, flaggedRegions }
 */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { scanQueueId, partTypeHint } = await request.json();

    if (!scanQueueId) {
      return NextResponse.json(
        { success: false, error: "scanQueueId is required" },
        { status: 400 }
      );
    }

    // 1. Find the scan queue item
    const items = await sql`SELECT * FROM scan_queue WHERE id = ${scanQueueId}`;
    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Scan queue item not found" },
        { status: 404 }
      );
    }

    // 2. Find a mesh file (scan_processed preferred, then scan_raw)
    const meshFiles = await sql`
      SELECT * FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId}
        AND artifact_type IN ('scan_processed', 'scan_raw')
        AND superseded_by IS NULL
      ORDER BY
        CASE artifact_type WHEN 'scan_processed' THEN 0 ELSE 1 END,
        version DESC
      LIMIT 1
    `;

    if (meshFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No mesh file found. Upload a scan file first." },
        { status: 400 }
      );
    }

    const meshArtifact = meshFiles[0];
    const meshUrl = meshArtifact.file_url as string;
    const meshFileName = meshArtifact.file_name as string;

    // 3. Fetch the mesh from blob storage
    let meshBlob: Blob;
    try {
      meshBlob = await fetchBlob(meshUrl);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch mesh file: ${e instanceof Error ? e.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    // 4. Update status to cad_generating
    await sql`
      UPDATE scan_queue SET status = 'cad_generating' WHERE id = ${scanQueueId}
    `;

    // 5. Submit to AutoQuote scan-to-cad
    let aqConfig: { baseUrl: string; token: string };
    try {
      aqConfig = getAutoQuoteConfig();
    } catch (e) {
      // Reset status
      await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
      return NextResponse.json(
        { success: false, error: e instanceof Error ? e.message : "AutoQuote not configured" },
        { status: 500 }
      );
    }

    const formData = new FormData();
    formData.append("file", meshBlob, meshFileName);
    if (partTypeHint && partTypeHint !== "auto") {
      formData.append("part_type_hint", partTypeHint);
    }

    let jobId: string;
    try {
      const submitRes = await fetch(`${aqConfig.baseUrl}/bridge/scan-to-cad`, {
        method: "POST",
        headers: aqHeaders(aqConfig.token),
        body: formData,
      });

      if (submitRes.status === 404) {
        await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
        return NextResponse.json(
          { success: false, error: "Scan-to-CAD engine not yet deployed on AutoQuote." },
          { status: 404 }
        );
      }

      if (!submitRes.ok) {
        const errBody = await submitRes.json().catch(() => ({ detail: submitRes.statusText }));
        await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
        return NextResponse.json(
          { success: false, error: `AutoQuote error ${submitRes.status}: ${errBody.detail || submitRes.statusText}` },
          { status: 502 }
        );
      }

      const submitData: ScanToCadSubmitResponse = await submitRes.json();
      jobId = submitData.job_id;
    } catch (e) {
      await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;

      // Handle network errors / not deployed gracefully
      const msg = e instanceof Error ? e.message : "Unknown error";
      if (msg.includes("fetch failed") || msg.includes("ECONNREFUSED") || msg.includes("ENOTFOUND")) {
        return NextResponse.json(
          { success: false, error: "Scan-to-CAD engine not yet deployed on AutoQuote." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Failed to submit to AutoQuote: ${msg}` },
        { status: 502 }
      );
    }

    // 6. Poll until complete (max ~4.5 minutes with 5s intervals)
    const maxPollMs = 270_000;
    const pollInterval = 5_000;
    const deadline = Date.now() + maxPollMs;
    let result: ScanToCadStatusResponse | null = null;

    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, pollInterval));

      try {
        const pollRes = await fetch(`${aqConfig.baseUrl}/bridge/scan-to-cad/${jobId}`, {
          headers: aqHeaders(aqConfig.token),
        });

        if (pollRes.status === 404) {
          await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
          return NextResponse.json(
            { success: false, error: "Scan-to-CAD engine not yet deployed on AutoQuote." },
            { status: 404 }
          );
        }

        if (!pollRes.ok) continue;

        const data: ScanToCadStatusResponse = await pollRes.json();

        if (data.status === "completed") {
          result = data;
          break;
        }

        if (data.status === "failed") {
          await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
          return NextResponse.json(
            { success: false, error: `CAD generation failed: ${data.error || "Unknown reason"}` },
            { status: 500 }
          );
        }
      } catch {
        // Network hiccup during poll, keep trying
        continue;
      }
    }

    if (!result) {
      await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
      return NextResponse.json(
        { success: false, error: "CAD generation timed out. The job may still be processing on AutoQuote." },
        { status: 504 }
      );
    }

    // 7. Download the generated STEP file and store in Vercel Blob
    const confidence = result.confidence ?? 0;
    const features = result.features ?? [];
    const flaggedRegions = result.flagged_regions ?? [];

    let cadBlobUrl: string;
    try {
      const stepRes = await fetch(result.step_file_url!, {
        headers: aqHeaders(aqConfig.token),
      });
      if (!stepRes.ok) {
        throw new Error(`Failed to download STEP file: ${stepRes.status}`);
      }
      const stepBlob = await stepRes.blob();

      // Determine version
      const existingCad = await sql`
        SELECT COALESCE(MAX(version), 0) as max_ver
        FROM scan_artifacts
        WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'cad_model'
      `;
      const newVersion = (existingCad[0].max_ver as number) + 1;

      const stepFileName = `${(items[0].part_description as string).replace(/[^a-zA-Z0-9_-]/g, "_")}_auto.step`;

      // Mark previous version as superseded
      if (newVersion > 1) {
        await sql`
          UPDATE scan_artifacts SET superseded_by = gen_random_uuid()
          WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'cad_model'
            AND version = ${newVersion - 1} AND superseded_by IS NULL
        `;
      }

      // Upload to Vercel Blob
      const uploaded = await put(
        `scans/${scanQueueId}/cad_model_v${newVersion}_${stepFileName}`,
        stepBlob,
        { access: "private" }
      );
      cadBlobUrl = uploaded.url;

      // Build notes
      const confidenceLabel = confidence > 0.85 ? "high" : confidence >= 0.5 ? "medium" : "low";
      const autoNotes = [
        `Auto-generated${confidence > 0.85 ? " — high confidence" : ""}`,
        `Confidence: ${(confidence * 100).toFixed(1)}% (${confidenceLabel})`,
        `Features: ${features.length}`,
        flaggedRegions.length > 0 ? `Flagged regions: ${flaggedRegions.length}` : null,
        partTypeHint && partTypeHint !== "auto" ? `Part type hint: ${partTypeHint}` : null,
      ].filter(Boolean).join("; ");

      // Create scan_artifact record
      await sql`
        INSERT INTO scan_artifacts (scan_queue_id, artifact_type, version, file_name, file_url, file_size, notes)
        VALUES (${scanQueueId}, 'cad_model', ${newVersion}, ${stepFileName}, ${cadBlobUrl}, ${stepBlob.size}, ${autoNotes})
      `;

      // Update scan queue: set status to cad_ready, update cad version
      await sql`
        UPDATE scan_queue SET
          status = 'cad_ready',
          current_cad_version = ${newVersion},
          needs_cad_update = false
        WHERE id = ${scanQueueId}
      `;

    } catch (e) {
      await sql`UPDATE scan_queue SET status = 'scanned' WHERE id = ${scanQueueId}`;
      return NextResponse.json(
        { success: false, error: `Failed to store CAD file: ${e instanceof Error ? e.message : "Unknown error"}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      confidence,
      features,
      flaggedRegions,
      cadUrl: cadBlobUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
