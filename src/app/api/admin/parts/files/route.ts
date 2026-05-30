import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import sharp from "sharp";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/** GET — list files for a part */
export async function GET(request: NextRequest) {
  try {
    const sql = getSQL();
    const partId = request.nextUrl.searchParams.get("partId");
    if (!partId) return NextResponse.json({ success: false, error: "partId required" }, { status: 400 });

    const files = await sql`
      SELECT * FROM part_files WHERE part_id = ${partId} ORDER BY file_type, display_order, uploaded_at DESC
    `;

    return NextResponse.json({ success: true, files });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

/** POST — upload a file to a part */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const partId = formData.get("partId") as string;
    const fileType = formData.get("fileType") as string;
    const showInCatalog = formData.get("showInCatalog") === "true";
    const notes = formData.get("notes") as string | null;

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, error: "No file" }, { status: 400 });
    }
    if (!partId || !fileType) {
      return NextResponse.json({ success: false, error: "partId and fileType required" }, { status: 400 });
    }

    // File upload validation: 100MB max per file
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "File exceeds 100MB limit" }, { status: 400 });
    }

    // Validate file type matches the fileType field
    const isPhotoType = fileType.startsWith("photo");
    const isCadType = fileType.startsWith("cad") || fileType === "stl_preview";
    const cadExtensions = [".step", ".stp", ".stl", ".iges", ".igs", ".f3d", ".sldprt", ".dxf", ".dwg", ".3mf", ".obj"];
    const actualFileName = file instanceof File ? file.name : "upload";
    const ext = "." + (actualFileName.split(".").pop()?.toLowerCase() || "");

    if (isPhotoType) {
      const fileType_ = file instanceof File ? file.type : "";
      if (fileType_ && !fileType_.startsWith("image/")) {
        return NextResponse.json({ success: false, error: "Photo files must be images" }, { status: 400 });
      }
    }
    if (isCadType && !cadExtensions.includes(ext) && ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      // Allow common image extensions for STL preview renders, but validate CAD extensions for actual CAD
      if (fileType !== "stl_preview") {
        return NextResponse.json({ success: false, error: `Unsupported CAD file extension: ${ext}` }, { status: 400 });
      }
    }

    const sql = getSQL();
    const fileName = file instanceof File ? file.name : "upload";
    const isStep = fileType === "cad_step" || fileName.toLowerCase().endsWith(".step") || fileName.toLowerCase().endsWith(".stp");

    // Upload original to Vercel Blob
    const blob = await put(`parts/${partId}/${fileType}_${Date.now()}_${fileName}`, file, {
      access: "private",
    });

    // Generate thumbnail for photo files
    let thumbnailUrl: string | null = null;
    const isPhoto = fileType.startsWith("photo");
    if (isPhoto) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const thumb = await sharp(buffer)
          .resize(400, 400, { fit: "cover", withoutEnlargement: true })
          .jpeg({ quality: 70 })
          .toBuffer();
        const thumbBlob = await put(
          `parts/${partId}/thumb_${Date.now()}_${fileName.replace(/\.[^.]+$/, ".jpg")}`,
          thumb,
          { access: "private", contentType: "image/jpeg" }
        );
        thumbnailUrl = thumbBlob.url;
      } catch {
        // Thumbnail generation failed — not critical, proceed without
      }
    }

    // Get next display order
    const orderResult = await sql`
      SELECT COALESCE(MAX(display_order), -1) + 1 as next_order
      FROM part_files WHERE part_id = ${partId} AND file_type = ${fileType}
    `;

    const result = await sql`
      INSERT INTO part_files (part_id, file_type, file_name, file_url, file_size, display_order, show_in_catalog, is_step_file, thumbnail_url, notes)
      VALUES (${partId}, ${fileType}, ${fileName}, ${blob.url}, ${file.size}, ${orderResult[0].next_order}, ${showInCatalog}, ${isStep}, ${thumbnailUrl}, ${notes || null})
      RETURNING *
    `;

    // If this is a STEP file, update the part's cad_file_url for AutoQuote
    if (isStep) {
      await sql`UPDATE parts SET cad_file_url = ${blob.url}, updated_at = NOW() WHERE id = ${partId}`;
    }

    // If this is an STL, update stl_preview_url
    if (fileType === "stl_preview") {
      await sql`UPDATE parts SET stl_preview_url = ${blob.url}, updated_at = NOW() WHERE id = ${partId}`;
    }

    return NextResponse.json({ success: true, file: result[0] });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

/** PATCH — toggle file properties */
export async function PATCH(request: NextRequest) {
  try {
    const sql = getSQL();
    const { fileId, showInCatalog, displayOrder, tier } = await request.json();
    if (!fileId) return NextResponse.json({ success: false, error: "fileId required" }, { status: 400 });

    if (showInCatalog !== undefined) {
      await sql`UPDATE part_files SET show_in_catalog = ${showInCatalog} WHERE id = ${fileId}`;
    }
    if (displayOrder !== undefined) {
      await sql`UPDATE part_files SET display_order = ${displayOrder} WHERE id = ${fileId}`;
    }
    if (tier !== undefined) {
      await sql`UPDATE part_files SET tier = ${tier || null} WHERE id = ${fileId}`;
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

/** DELETE — remove a file */
export async function DELETE(request: NextRequest) {
  try {
    const sql = getSQL();
    const { fileId } = await request.json();
    if (!fileId) return NextResponse.json({ success: false, error: "fileId required" }, { status: 400 });

    await sql`DELETE FROM part_files WHERE id = ${fileId}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
