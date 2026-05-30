import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";
import { rateLimit } from "@/lib/rate-limit";
import { sanitize, isValidEmail, maxLength } from "@/lib/sanitize";
import { logError } from "@/lib/logger";
import { scanFile } from "@/lib/virus-scan";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif", "image/tiff", "image/bmp"];
const ALLOWED_CAD_EXTENSIONS = [".step", ".stp", ".stl", ".iges", ".igs", ".f3d", ".sldprt", ".dxf", ".dwg", ".3mf", ".obj"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB per file
const MAX_TOTAL_SIZE = 200 * 1024 * 1024; // 200MB total

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function containsXSS(input: string): boolean {
  const lower = input.toLowerCase();
  return lower.includes("<script") || lower.includes("javascript:");
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`contribute:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const sql = getSQL();

    const contentType = request.headers.get("content-type") || "";
    let form: Record<string, string>;
    let photoFiles: File[] = [];
    let cadFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const fd = await request.formData();
      form = JSON.parse(fd.get("data") as string);
      photoFiles = fd.getAll("photos").filter((f): f is File => f instanceof File);
      cadFiles = fd.getAll("cadFiles").filter((f): f is File => f instanceof File);
    } else {
      form = await request.json();
    }

    // Input validation + XSS sanitization
    for (const key of Object.keys(form)) {
      if (typeof form[key] === "string" && containsXSS(form[key])) {
        return NextResponse.json(
          { success: false, error: "Invalid input detected" },
          { status: 400 }
        );
      }
    }

    let {
      partDescription, application, name, email, phone, company,
      segment, make, model, year, condition, partNumber,
    } = form;

    if (!partDescription || !application) {
      return NextResponse.json(
        { success: false, error: "Part description and application are required" },
        { status: 400 }
      );
    }

    // Validate and sanitize field lengths
    partDescription = sanitize(maxLength(partDescription, 500));
    application = sanitize(application);
    if (name) name = sanitize(maxLength(name, 100));
    if (email) {
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { success: false, error: "Invalid email format" },
          { status: 400 }
        );
      }
    }

    // File upload validation
    let totalSize = 0;
    for (const file of photoFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `Photo "${file.name}" exceeds 50MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: `Photo "${file.name}" has invalid file type: ${file.type}` },
          { status: 400 }
        );
      }
      totalSize += file.size;
    }
    for (const file of cadFiles) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `CAD file "${file.name}" exceeds 50MB limit` },
          { status: 400 }
        );
      }
      const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
      if (!ALLOWED_CAD_EXTENSIONS.includes(ext)) {
        return NextResponse.json(
          { success: false, error: `CAD file "${file.name}" has unsupported extension: ${ext}` },
          { status: 400 }
        );
      }
      totalSize += file.size;
    }
    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { success: false, error: "Total upload size exceeds 200MB limit" },
        { status: 400 }
      );
    }

    // Scan all files for malware before storing
    const allFiles: File[] = [...photoFiles, ...cadFiles];
    for (const file of allFiles) {
      const scanResult = await scanFile(file, file.name);
      if (scanResult.skipped) {
        console.log(`[virus-scan] Skipped "${file.name}": ${scanResult.reason}`);
      } else if (!scanResult.safe) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" was flagged as potentially malicious and has been rejected.` },
          { status: 400 }
        );
      }
    }

    // Upload photos to blob storage
    const photoUrls: string[] = [];
    for (const file of photoFiles) {
      const blob = await put(
        `contributions/${Date.now()}_${file.name}`,
        file,
        { access: "private" }
      );
      photoUrls.push(blob.url);
    }

    // Parse year range
    let yearStart: number | null = null;
    let yearEnd: number | null = null;
    if (year) {
      const parts = year.split(/[-–]/);
      yearStart = parseInt(parts[0]) || null;
      yearEnd = parts[1] ? (parseInt(parts[1]) || null) : yearStart;
    }

    // Create or find contributor
    let contributorId = null;
    if (name) {
      const existing = await sql`SELECT id FROM contributors WHERE name = ${name} LIMIT 1`;
      if (existing.length > 0) {
        contributorId = existing[0].id;
        await sql`
          UPDATE contributors SET
            email = COALESCE(${email || null}, email),
            phone = COALESCE(${phone || null}, phone),
            location = COALESCE(${company || null}, location)
          WHERE id = ${contributorId}
        `;
      } else {
        const created = await sql`
          INSERT INTO contributors (name, email, phone, location, public_credit_name)
          VALUES (${name}, ${email || null}, ${phone || null}, ${company || null}, ${name})
          RETURNING id
        `;
        contributorId = created[0].id;
      }
    }

    // Create or update customer record
    if (name && email) {
      const existingCustomer = await sql`SELECT id FROM customers WHERE email = ${email} LIMIT 1`;
      if (existingCustomer.length === 0) {
        await sql`
          INSERT INTO customers (name, email, phone, company, notes)
          VALUES (${name}, ${email}, ${phone || null}, ${company || null}, ${"Contributor submission"})
        `;
      } else {
        await sql`
          UPDATE customers SET
            name = ${name},
            phone = COALESCE(${phone || null}, phone),
            company = COALESCE(${company || null}, company)
          WHERE id = ${existingCustomer[0].id}
        `;
      }
    }

    // Create scan queue entry — if contributor provides CAD, skip scanning stage
    const hasContributorCad = cadFiles.length > 0;
    const result = await sql`
      INSERT INTO scan_queue (
        contributor_id, part_description, application, segment,
        make, model, year_start, year_end,
        condition, part_number, photo_urls, status, notes
      )
      VALUES (
        ${contributorId}, ${partDescription}, ${application},
        ${segment || null}, ${make || null}, ${model || null},
        ${yearStart}, ${yearEnd}, ${condition || null},
        ${partNumber || null}, ${photoUrls.length > 0 ? JSON.stringify(photoUrls) : null},
        ${hasContributorCad ? "cad_ready" : "received"},
        ${hasContributorCad ? "Contributor provided CAD files" : null}
      )
      RETURNING id
    `;
    const scanQueueId = result[0].id as string;

    // Upload CAD files as scan artifacts
    for (const file of cadFiles) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isStep = ext === "step" || ext === "stp";
      const blob = await put(
        `contributions/${scanQueueId}/cad_${Date.now()}_${file.name}`,
        file,
        { access: "private" }
      );
      await sql`
        INSERT INTO scan_artifacts (scan_queue_id, artifact_type, version, file_name, file_url, file_size, notes)
        VALUES (${scanQueueId}, ${"cad_model"}, ${1}, ${file.name}, ${blob.url}, ${file.size}, ${isStep ? "STEP file — ready for AutoQuote" : `Contributor CAD (${ext})`})
      `;
    }

    // Upload photos as scan artifacts too
    for (let i = 0; i < photoFiles.length; i++) {
      await sql`
        INSERT INTO scan_artifacts (scan_queue_id, artifact_type, version, file_name, file_url, file_size)
        VALUES (${scanQueueId}, ${"photo"}, ${1}, ${photoFiles[i].name}, ${photoUrls[i]}, ${photoFiles[i].size})
      `;
    }

    return NextResponse.json({ success: true, scanQueueId });
  } catch (e) {
    logError("api/contribute", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
