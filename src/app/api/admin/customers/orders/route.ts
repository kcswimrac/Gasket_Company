import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/** GET — list orders for a specific customer */
export async function GET(request: NextRequest) {
  try {
    const sql = getSQL();
    const customerId = request.nextUrl.searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerId is required" },
        { status: 400 }
      );
    }

    const orders = await sql`
      SELECT id, status, total_price, notes, created_at
      FROM orders
      WHERE customer_id = ${customerId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, orders });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
