import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  try {
    const sql = getSQL();
    const bounties = await sql`
      SELECT b.*, c.name as claimed_by_name, p.name as part_name
      FROM bounty_board b
      LEFT JOIN contributors c ON b.claimed_by = c.id
      LEFT JOIN parts p ON b.part_id = p.id
      ORDER BY
        CASE b.priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 WHEN 'low' THEN 2 END,
        b.created_at DESC
    `;
    return NextResponse.json({ success: true, bounties });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { title, description, segment, make, model, yearStart, yearEnd, reward, priority } = await request.json();
    if (!title) return NextResponse.json({ success: false, error: "Title required" }, { status: 400 });

    const result = await sql`
      INSERT INTO bounty_board (title, description, segment, make, model, year_start, year_end, reward, priority)
      VALUES (${title}, ${description || null}, ${segment || null}, ${make || null}, ${model || null}, ${yearStart || null}, ${yearEnd || null}, ${reward || null}, ${priority || "normal"})
      RETURNING *
    `;

    await logAudit({
      action: "create_bounty",
      entityType: "bounty",
      entityId: result[0].id as string,
      details: { title },
      ip: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ success: true, bounty: result[0] });
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
      UPDATE bounty_board SET
        title = COALESCE(${fields.title || null}, title),
        description = ${fields.description ?? null},
        segment = ${fields.segment ?? null},
        make = ${fields.make ?? null},
        model = ${fields.model ?? null},
        year_start = ${fields.yearStart ?? null},
        year_end = ${fields.yearEnd ?? null},
        reward = ${fields.reward ?? null},
        priority = COALESCE(${fields.priority || null}, priority),
        status = COALESCE(${fields.status || null}, status),
        updated_at = NOW()
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
    await sql`DELETE FROM bounty_board WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
