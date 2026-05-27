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
 *
 * Two modes:
 * 1. New part: scan queue item has no part_id → creates a new catalog part
 * 2. Revision: scan queue item has part_id → updates the existing part with new files
 *    (old files get archived flag, not deleted)
 */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { scanQueueId } = await request.json();

    if (!scanQueueId) {
      return NextResponse.json({ success: false, error: "scanQueueId required" }, { status: 400 });
    }

    const items = await sql`SELECT * FROM scan_queue WHERE id = ${scanQueueId}`;
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Scan queue item not found" }, { status: 404 });
    }

    const item = items[0];
    const isRevision = !!item.part_id;

    // Get the latest CAD and STL files from this scan queue entry
    const cadFiles = await sql`
      SELECT file_url FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'cad_model'
      ORDER BY version DESC LIMIT 1
    `;
    const stlFiles = await sql`
      SELECT file_url FROM scan_artifacts
      WHERE scan_queue_id = ${scanQueueId} AND artifact_type = 'stl_preview'
      ORDER BY version DESC LIMIT 1
    `;

    let partId: string;

    if (isRevision) {
      // ── REVISION: update existing part ──
      partId = item.part_id as string;

      // Archive old files on the part (mark them not shown in catalog but keep them)
      const newCadUrl = cadFiles.length > 0 ? cadFiles[0].file_url : null;
      const newStlUrl = stlFiles.length > 0 ? stlFiles[0].file_url : null;

      // Update the part's primary CAD/STL URLs
      if (newCadUrl) {
        await sql`UPDATE parts SET cad_file_url = ${newCadUrl}, updated_at = NOW() WHERE id = ${partId}`;
      }
      if (newStlUrl) {
        await sql`UPDATE parts SET stl_preview_url = ${newStlUrl}, updated_at = NOW() WHERE id = ${partId}`;
      }

      // Also update any fields that may have been refined during the rescan
      if (item.fitment_status) {
        await sql`UPDATE parts SET fitment_status = ${item.fitment_status}, updated_at = NOW() WHERE id = ${partId}`;
      }

    } else {
      // ── NEW PART: create from scratch ──
      const part = await sql`
        INSERT INTO parts (
          name, segment, make, model, year_start, year_end, application,
          description, fitment_status, dimensions, part_number,
          contributor_id, scan_queue_id, cad_file_url, stl_preview_url,
          scan_date, notes, active
        ) VALUES (
          ${item.part_description},
          ${item.segment || "automotive"},
          ${item.make || null},
          ${item.model || null},
          ${item.year_start || null},
          ${item.year_end || null},
          ${item.application},
          ${null},
          ${item.fitment_status || "scan_verified"},
          ${item.dimensions || null},
          ${item.part_number || null},
          ${item.contributor_id || null},
          ${scanQueueId},
          ${cadFiles.length > 0 ? cadFiles[0].file_url : null},
          ${stlFiles.length > 0 ? stlFiles[0].file_url : null},
          NOW(),
          ${item.notes || null},
          true
        )
        RETURNING id
      `;
      partId = part[0].id as string;
    }

    // Mark scan queue as complete and link to part
    await sql`
      UPDATE scan_queue SET
        part_id = ${partId},
        status = 'complete',
        completed_at = CASE WHEN completed_at IS NULL THEN NOW() ELSE completed_at END
      WHERE id = ${scanQueueId}
    `;

    // Copy scan artifacts → part_files
    // For revisions: archive existing files of same type first
    const allArtifacts = await sql`
      SELECT * FROM scan_artifacts WHERE scan_queue_id = ${scanQueueId} AND superseded_by IS NULL
      ORDER BY artifact_type, version DESC
    `;

    const typeMap: Record<string, string> = {
      scan_raw: "scan_raw",
      scan_processed: "scan_raw",
      cad_model: "cad_step",
      stl_preview: "stl_preview",
      drawing_pdf: "drawing_pdf",
      photo: "photo_donor",
    };

    if (isRevision) {
      // Archive old files: hide from catalog but keep in DB
      for (const artifact of allArtifacts) {
        const partFileType = typeMap[artifact.artifact_type as string] || "other";
        await sql`
          UPDATE part_files SET show_in_catalog = false, notes = COALESCE(notes, '') || ' [archived by revision]'
          WHERE part_id = ${partId} AND file_type = ${partFileType} AND show_in_catalog = true
        `;
      }
    }

    for (const artifact of allArtifacts) {
      const partFileType = typeMap[artifact.artifact_type as string] || "other";
      const isStep = partFileType === "cad_step";
      const showInCatalog = partFileType === "photo_donor" || partFileType === "photo_finished";
      await sql`
        INSERT INTO part_files (part_id, file_type, file_name, file_url, file_size, show_in_catalog, is_step_file, notes)
        VALUES (${partId}, ${partFileType}, ${artifact.file_name}, ${artifact.file_url}, ${artifact.file_size || null}, ${showInCatalog}, ${isStep}, ${"Scan queue v" + artifact.version + (isRevision ? " (revision)" : "")})
      `;
    }

    return NextResponse.json({
      success: true,
      partId,
      mode: isRevision ? "revision" : "new",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
