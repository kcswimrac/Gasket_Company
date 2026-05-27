import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/**
 * POST /api/admin/scans/publish
 * Promote a completed scan queue item to a catalog part.
 * Copies all fields, links the CAD file, and sets part_id on the scan queue item.
 */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { scanQueueId } = await request.json();

    if (!scanQueueId) {
      return NextResponse.json({ success: false, error: "scanQueueId required" }, { status: 400 });
    }

    // Get the scan queue item
    const items = await sql`SELECT * FROM scan_queue WHERE id = ${scanQueueId}`;
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Scan queue item not found" }, { status: 404 });
    }

    const item = items[0];

    if (item.part_id) {
      return NextResponse.json({ success: false, error: "Already published to catalog" }, { status: 400 });
    }

    // Get the latest CAD file URL
    const cadFiles = await sql`
      SELECT file_url FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'cad_model'
      ORDER BY version DESC LIMIT 1
    `;

    // Get the latest STL preview URL
    const stlFiles = await sql`
      SELECT file_url FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'stl_preview'
      ORDER BY version DESC LIMIT 1
    `;

    // Create the part
    const part = await sql`
      INSERT INTO parts (
        name, segment, make, model, year_start, year_end, application,
        description, fitment_status, dimensions, part_number,
        contributor_id, cad_file_url, stl_preview_url,
        scan_date, notes, active
      ) VALUES (
        ${item.part_description},
        ${item.segment || "automotive"},
        ${item.make || null},
        ${item.model || null},
        ${item.year_start || null},
        ${item.year_end || null},
        ${item.application},
        ${item.notes || null},
        ${item.fitment_status || "scan_verified"},
        ${item.dimensions || null},
        ${item.part_number || null},
        ${item.contributor_id || null},
        ${cadFiles.length > 0 ? cadFiles[0].file_url : null},
        ${stlFiles.length > 0 ? stlFiles[0].file_url : null},
        NOW(),
        ${"Published from scan queue " + scanQueueId},
        true
      )
      RETURNING *
    `;

    // Link the scan queue item to the new part
    await sql`
      UPDATE scan_queue SET part_id = ${part[0].id}, status = 'complete',
        completed_at = CASE WHEN completed_at IS NULL THEN NOW() ELSE completed_at END
      WHERE id = ${scanQueueId}
    `;

    return NextResponse.json({ success: true, part: part[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
