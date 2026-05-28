import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET(request: NextRequest) {
  try {
    const sql = getSQL();
    const orderId = request.nextUrl.searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const items = await sql`
      SELECT
        oli.*,
        pv.tier,
        pv.material,
        pv.process,
        p.name as part_name,
        p.part_number,
        p.application
      FROM order_line_items oli
      LEFT JOIN part_variants pv ON oli.variant_id = pv.id
      LEFT JOIN parts p ON pv.part_id = p.id
      WHERE oli.order_id = ${orderId}
      ORDER BY p.name ASC NULLS LAST
    `;

    return NextResponse.json({ success: true, items });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
