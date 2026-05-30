import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const customerId = session.user.id;
    const sql = getSQL();

    const orders = await sql`
      SELECT
        o.id,
        o.status,
        o.total_price,
        o.rush_order,
        o.shipping_method,
        o.tracking_number,
        o.notes,
        o.created_at,
        o.updated_at,
        o.shipped_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', li.id,
              'quantity', li.quantity,
              'unit_price', li.unit_price,
              'total_price', li.total_price,
              'status', li.status,
              'notes', li.notes,
              'variant_id', li.variant_id
            )
          ) FILTER (WHERE li.id IS NOT NULL),
          '[]'::json
        ) as line_items
      FROM orders o
      LEFT JOIN order_line_items li ON li.order_id = o.id
      WHERE o.customer_id = ${customerId}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return NextResponse.json({ success: true, orders });
  } catch (e) {
    console.error("Customer orders error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
