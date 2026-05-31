import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    const customerId = session.user.id;
    const sql = getSQL();

    // Verify order belongs to the logged-in customer
    const orderRows = await sql`
      SELECT id FROM orders
      WHERE id = ${orderId} AND customer_id = ${customerId}
      LIMIT 1
    `;

    if (orderRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch line items with part and variant details
    const lineItems = await sql`
      SELECT
        li.id,
        li.variant_id,
        li.quantity,
        li.unit_price,
        li.total_price,
        li.status,
        li.notes,
        pv.tier,
        pv.material,
        pv.process,
        pv.lead_time_days,
        pv.base_price,
        pv.last_quoted_price,
        pv.last_quote_firm,
        p.id as part_id,
        p.name as part_name
      FROM order_line_items li
      LEFT JOIN part_variants pv ON pv.id = li.variant_id
      LEFT JOIN parts p ON p.id = pv.part_id
      WHERE li.order_id = ${orderId}
    `;

    return NextResponse.json({ success: true, lineItems });
  } catch (e) {
    console.error("Order detail error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
