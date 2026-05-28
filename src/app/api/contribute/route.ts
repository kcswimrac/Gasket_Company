import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();

    const contentType = request.headers.get("content-type") || "";
    let form: Record<string, string>;
    let photoFiles: File[] = [];

    if (contentType.includes("multipart/form-data")) {
      const fd = await request.formData();
      form = JSON.parse(fd.get("data") as string);
      photoFiles = fd.getAll("photos").filter((f): f is File => f instanceof File);
    } else {
      form = await request.json();
    }

    const {
      partDescription, application, name, email, phone, company,
      segment, make, model, year, condition, partNumber,
    } = form;

    if (!partDescription || !application) {
      return NextResponse.json(
        { success: false, error: "Part description and application are required" },
        { status: 400 }
      );
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

    // Create scan queue entry
    const result = await sql`
      INSERT INTO scan_queue (
        contributor_id, part_description, application, segment,
        make, model, year_start, year_end,
        condition, part_number, photo_urls, status
      )
      VALUES (
        ${contributorId}, ${partDescription}, ${application},
        ${segment || null}, ${make || null}, ${model || null},
        ${yearStart}, ${yearEnd}, ${condition || null},
        ${partNumber || null}, ${photoUrls.length > 0 ? JSON.stringify(photoUrls) : null},
        ${"received"}
      )
      RETURNING id
    `;

    return NextResponse.json({ success: true, scanQueueId: result[0].id });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
