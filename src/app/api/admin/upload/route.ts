import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/**
 * POST /api/admin/upload
 * Upload a file to Vercel Blob and create a scan_artifacts record.
 *
 * Form fields:
 *   file: the file
 *   scanQueueId: uuid
 *   artifactType: scan_raw | scan_processed | cad_model | stl_preview | drawing_pdf | photo | other
 *   notes: optional
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const scanQueueId = formData.get("scanQueueId") as string;
    const artifactType = formData.get("artifactType") as string;
    const notes = formData.get("notes") as string | null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }
    if (!scanQueueId || !artifactType) {
      return NextResponse.json({ success: false, error: "scanQueueId and artifactType required" }, { status: 400 });
    }

    // File upload validation: 200MB max per file
    const MAX_FILE_SIZE = 200 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 200MB limit" }, { status: 400 });
    }

    const sql = getSQL();
    const fileName = file instanceof File ? file.name : "upload";

    // Determine version number — find max existing version for this type
    const existing = await sql`
      SELECT COALESCE(MAX(version), 0) as max_ver
      FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId} AND artifact_type = ${artifactType}
    `;
    const newVersion = (existing[0].max_ver as number) + 1;

    // Upload to Vercel Blob
    const blob = await put(`scans/${scanQueueId}/${artifactType}_v${newVersion}_${fileName}`, file, {
      access: "private",
    });

    // Mark previous version as superseded
    if (newVersion > 1) {
      await sql`
        UPDATE scan_artifacts SET superseded_by = gen_random_uuid()
        WHERE scan_queue_id = ${scanQueueId} AND artifact_type = ${artifactType} AND version = ${newVersion - 1} AND superseded_by IS NULL
      `;
    }

    // Create artifact record
    const result = await sql`
      INSERT INTO scan_artifacts (scan_queue_id, artifact_type, version, file_name, file_url, file_size, notes)
      VALUES (${scanQueueId}, ${artifactType}, ${newVersion}, ${fileName}, ${blob.url}, ${file.size}, ${notes || null})
      RETURNING *
    `;

    // Update scan_queue version trackers + auto-advance status based on what exists
    const isScanType = artifactType === "scan_raw" || artifactType === "scan_processed";
    const isCadType = artifactType === "cad_model";
    const isStlType = artifactType === "stl_preview";

    if (isScanType) {
      const cadExists = await sql`
        SELECT COUNT(*)::int as count FROM scan_artifacts
        WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'cad_model'
      `;
      const needsCadUpdate = (cadExists[0].count as number) > 0;

      await sql`
        UPDATE scan_queue SET
          current_scan_version = ${newVersion},
          needs_cad_update = ${needsCadUpdate},
          status = CASE
            WHEN status = 'received' THEN 'scanning'
            ELSE status
          END,
          scanned_at = CASE WHEN scanned_at IS NULL THEN NOW() ELSE scanned_at END
        WHERE id = ${scanQueueId}
      `;
    }

    if (isCadType) {
      // CAD upload — jump to at least "modeling" regardless of current status
      await sql`
        UPDATE scan_queue SET
          current_cad_version = ${newVersion},
          needs_cad_update = false,
          status = CASE
            WHEN status IN ('received', 'scanning') THEN 'modeling'
            ELSE status
          END
        WHERE id = ${scanQueueId}
      `;
    }

    if (isStlType) {
      // STL preview uploaded — if we have both scan and CAD, can mark complete
      const hasCad = await sql`
        SELECT COUNT(*)::int as count FROM scan_artifacts
        WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'cad_model'
      `;
      if ((hasCad[0].count as number) > 0) {
        await sql`
          UPDATE scan_queue SET
            status = CASE
              WHEN status IN ('received', 'scanning', 'modeling') THEN 'complete'
              ELSE status
            END,
            completed_at = CASE WHEN completed_at IS NULL THEN NOW() ELSE completed_at END
          WHERE id = ${scanQueueId}
        `;
      }
    }

    return NextResponse.json({
      success: true,
      artifact: result[0],
      version: newVersion,
      blobUrl: blob.url,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
