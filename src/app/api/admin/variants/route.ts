import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { partId, tier, material, process, basePrice, leadTimeDays, autoquoteMaterialCode, autoquoteProcess, available } = await request.json();

    if (!partId || !tier || !material || !process) {
      return NextResponse.json({ success: false, error: "partId, tier, material, and process are required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO part_variants (part_id, tier, material, process, base_price, lead_time_days, autoquote_material_code, autoquote_process, available)
      VALUES (${partId}, ${tier}, ${material}, ${process}, ${basePrice || null}, ${leadTimeDays || null}, ${autoquoteMaterialCode || null}, ${autoquoteProcess || null}, ${available ?? false})
      RETURNING *
    `;

    return NextResponse.json({ success: true, variant: result[0] });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getSQL();
    const { id, ...fields } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    await sql`
      UPDATE part_variants SET
        tier = COALESCE(${fields.tier || null}, tier),
        material = COALESCE(${fields.material || null}, material),
        process = COALESCE(${fields.process || null}, process),
        base_price = ${fields.basePrice ?? null},
        lead_time_days = ${fields.leadTimeDays ?? null},
        autoquote_material_code = ${fields.autoquoteMaterialCode ?? null},
        autoquote_process = ${fields.autoquoteProcess ?? null},
        available = COALESCE(${fields.available ?? null}, available)
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sql = getSQL();
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    await sql`DELETE FROM autoquote_cache WHERE variant_id = ${id}`;
    await sql`DELETE FROM part_variants WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
