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
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search");

    // Main orders query with customer info and line item count
    const orders = search
      ? await sql`
          SELECT
            o.*,
            c.name as customer_name,
            c.email as customer_email,
            c.company as customer_company,
            COALESCE(li.item_count, 0) as item_count,
            COALESCE(li.total_quantity, 0) as total_quantity
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          LEFT JOIN LATERAL (
            SELECT
              COUNT(*)::int as item_count,
              COALESCE(SUM(quantity), 0)::int as total_quantity
            FROM order_line_items
            WHERE order_id = o.id
          ) li ON true
          WHERE (
            c.name ILIKE ${"%" + search + "%"}
            OR c.email ILIKE ${"%" + search + "%"}
            OR c.company ILIKE ${"%" + search + "%"}
            OR o.id::text ILIKE ${"%" + search + "%"}
          )
          ${status && status !== "all" ? sql`AND o.status = ${status}` : sql``}
          ORDER BY o.created_at DESC
        `
      : status && status !== "all"
        ? await sql`
            SELECT
              o.*,
              c.name as customer_name,
              c.email as customer_email,
              c.company as customer_company,
              COALESCE(li.item_count, 0) as item_count,
              COALESCE(li.total_quantity, 0) as total_quantity
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN LATERAL (
              SELECT
                COUNT(*)::int as item_count,
                COALESCE(SUM(quantity), 0)::int as total_quantity
              FROM order_line_items
              WHERE order_id = o.id
            ) li ON true
            WHERE o.status = ${status}
            ORDER BY o.created_at DESC
          `
        : await sql`
            SELECT
              o.*,
              c.name as customer_name,
              c.email as customer_email,
              c.company as customer_company,
              COALESCE(li.item_count, 0) as item_count,
              COALESCE(li.total_quantity, 0) as total_quantity
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN LATERAL (
              SELECT
                COUNT(*)::int as item_count,
                COALESCE(SUM(quantity), 0)::int as total_quantity
              FROM order_line_items
              WHERE order_id = o.id
            ) li ON true
            ORDER BY o.created_at DESC
          `;

    // Summary stats
    const stats = await sql`
      SELECT
        COUNT(*)::int as total_orders,
        COUNT(*) FILTER (WHERE status IN ('pending_quote', 'quoted'))::int as pending_count,
        COUNT(*) FILTER (WHERE status IN ('paid', 'queued', 'in_progress', 'qc'))::int as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'shipped')::int as shipped_count,
        COUNT(*) FILTER (WHERE status = 'delivered')::int as delivered_count,
        COALESCE(SUM(total_price) FILTER (WHERE status NOT IN ('cancelled', 'pending_quote')), 0) as total_revenue
      FROM orders
    `;

    return NextResponse.json({
      success: true,
      orders,
      stats: stats[0],
    });
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
    const { id, status, trackingNumber, notes, shippingMethod } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "id is required" },
        { status: 400 }
      );
    }

    // Build the update - set shipped_at when status changes to shipped
    const result = await sql`
      UPDATE orders SET
        status = COALESCE(${status || null}, status),
        tracking_number = COALESCE(${trackingNumber ?? null}, tracking_number),
        notes = COALESCE(${notes ?? null}, notes),
        shipping_method = COALESCE(${shippingMethod ?? null}, shipping_method),
        shipped_at = CASE
          WHEN ${status || null} = 'shipped' AND shipped_at IS NULL THEN NOW()
          ELSE shipped_at
        END,
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order: result[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
