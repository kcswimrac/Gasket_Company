import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET(request: NextRequest) {
  try {
    const sql = getSQL();
    const segment = request.nextUrl.searchParams.get("segment");
    const search = request.nextUrl.searchParams.get("search");

    let parts;
    if (segment && search) {
      parts = await sql`
        SELECT p.*, c.name as contributor_name, c.public_credit_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.segment = ${segment}
        AND (p.name ILIKE ${"%" + search + "%"} OR p.application ILIKE ${"%" + search + "%"} OR p.make ILIKE ${"%" + search + "%"} OR p.model ILIKE ${"%" + search + "%"})
        ORDER BY p.created_at DESC
      `;
    } else if (segment) {
      parts = await sql`
        SELECT p.*, c.name as contributor_name, c.public_credit_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.segment = ${segment}
        ORDER BY p.created_at DESC
      `;
    } else if (search) {
      parts = await sql`
        SELECT p.*, c.name as contributor_name, c.public_credit_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.name ILIKE ${"%" + search + "%"} OR p.application ILIKE ${"%" + search + "%"} OR p.make ILIKE ${"%" + search + "%"} OR p.model ILIKE ${"%" + search + "%"}
        ORDER BY p.created_at DESC
      `;
    } else {
      parts = await sql`
        SELECT p.*, c.name as contributor_name, c.public_credit_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        ORDER BY p.created_at DESC
      `;
    }

    // Fetch variants for each part
    const partIds = parts.map((p) => p.id);
    let variants: Record<string, unknown>[] = [];
    if (partIds.length > 0) {
      variants = await sql`SELECT * FROM part_variants WHERE part_id = ANY(${partIds}) ORDER BY tier`;
    }

    const variantsByPart: Record<string, typeof variants> = {};
    for (const v of variants) {
      const pid = v.part_id as string;
      if (!variantsByPart[pid]) variantsByPart[pid] = [];
      variantsByPart[pid].push(v);
    }

    const result = parts.map((p) => ({
      ...p,
      variants: variantsByPart[p.id as string] || [],
    }));

    return NextResponse.json({ success: true, parts: result });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const body = await request.json();

    const {
      name, segment, make, model, yearStart, yearEnd, application,
      description, fitmentStatus, safetyClass, dimensions, partNumber,
      notes,
    } = body;

    if (!name || !segment || !application) {
      return NextResponse.json(
        { success: false, error: "name, segment, and application are required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO parts (name, segment, make, model, year_start, year_end, application, description, fitment_status, safety_class, dimensions, part_number, notes)
      VALUES (${name}, ${segment}, ${make || null}, ${model || null}, ${yearStart || null}, ${yearEnd || null}, ${application}, ${description || null}, ${fitmentStatus || "reference"}, ${safetyClass || "cosmetic"}, ${dimensions || null}, ${partNumber || null}, ${notes || null})
      RETURNING *
    `;

    // Create variants if provided
    if (body.variants && Array.isArray(body.variants)) {
      for (const v of body.variants) {
        await sql`
          INSERT INTO part_variants (part_id, tier, material, process, base_price, lead_time_days, available, autoquote_material_code, autoquote_process)
          VALUES (${result[0].id}, ${v.tier}, ${v.material}, ${v.process}, ${v.basePrice || null}, ${v.leadTimeDays || null}, ${v.available ?? false}, ${v.autoquoteMaterialCode || null}, ${v.autoquoteProcess || null})
        `;
      }
    }

    await logAudit({
      action: "create_part",
      entityType: "part",
      entityId: result[0].id as string,
      details: { name, segment, application },
      ip: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ success: true, part: result[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getSQL();
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const result = await sql`
      UPDATE parts SET
        name = COALESCE(${fields.name || null}, name),
        segment = COALESCE(${fields.segment || null}, segment),
        make = ${fields.make ?? null},
        model = ${fields.model ?? null},
        year_start = ${fields.yearStart ?? null},
        year_end = ${fields.yearEnd ?? null},
        application = COALESCE(${fields.application || null}, application),
        description = ${fields.description ?? null},
        fitment_status = COALESCE(${fields.fitmentStatus || null}, fitment_status),
        safety_class = COALESCE(${fields.safetyClass || null}, safety_class),
        dimensions = ${fields.dimensions ?? null},
        part_number = ${fields.partNumber ?? null},
        notes = ${fields.notes ?? null},
        scan_queue_id = COALESCE(${fields.scanQueueId ?? null}, scan_queue_id),
        active = COALESCE(${fields.active ?? null}, active),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Part not found" }, { status: 404 });
    }

    await logAudit({
      action: "update_part",
      entityType: "part",
      entityId: id,
      details: fields,
      ip: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ success: true, part: result[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getSQL();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    // Clear references that don't cascade
    await sql`UPDATE scan_queue SET part_id = NULL WHERE part_id = ${id}`;
    await sql`DELETE FROM autoquote_cache WHERE variant_id IN (SELECT id FROM part_variants WHERE part_id = ${id})`;
    // part_variants and part_files cascade automatically
    await sql`DELETE FROM parts WHERE id = ${id}`;

    await logAudit({
      action: "delete_part",
      entityType: "part",
      entityId: id,
      ip: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
