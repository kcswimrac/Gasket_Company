import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  try {
    const sql = getSQL();

    const [
      monthlyRevenue,
      topParts,
      ordersByStatus,
      totals,
      monthTotals,
    ] = await Promise.all([
      // Monthly revenue for the last 12 months
      sql`
        SELECT
          date_trunc('month', o.created_at) as month,
          COALESCE(SUM(CAST(o.total_price AS numeric)), 0) as revenue,
          COUNT(*)::int as order_count
        FROM orders o
        WHERE o.status NOT IN ('cancelled', 'pending_quote')
          AND o.created_at >= NOW() - INTERVAL '12 months'
        GROUP BY date_trunc('month', o.created_at)
        ORDER BY month ASC
      `,
      // Top 10 selling parts
      sql`
        SELECT
          p.id,
          p.name,
          COALESCE(p.times_sold, 0) as times_sold,
          COALESCE(p.last_estimate_price, '0') as unit_price,
          p.segment
        FROM parts p
        WHERE p.active IS NOT false
        ORDER BY COALESCE(p.times_sold, 0) DESC
        LIMIT 10
      `,
      // Orders by status
      sql`
        SELECT status, COUNT(*)::int as count
        FROM orders
        GROUP BY status
        ORDER BY count DESC
      `,
      // All-time totals
      sql`
        SELECT
          COALESCE(SUM(CAST(total_price AS numeric)), 0) as total_revenue,
          COUNT(*)::int as total_orders
        FROM orders
        WHERE status NOT IN ('cancelled', 'pending_quote')
      `,
      // This month totals
      sql`
        SELECT
          COALESCE(SUM(CAST(total_price AS numeric)), 0) as month_revenue,
          COUNT(*)::int as month_orders
        FROM orders
        WHERE status NOT IN ('cancelled', 'pending_quote')
          AND created_at >= date_trunc('month', NOW())
      `,
    ]);

    // Recent 10 orders
    const recentOrders = await sql`
      SELECT
        o.id,
        o.status,
        o.total_price,
        o.created_at,
        c.name as customer_name,
        c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      success: true,
      monthlyRevenue,
      topParts,
      ordersByStatus,
      totalRevenue: totals[0]?.total_revenue ?? 0,
      totalOrders: totals[0]?.total_orders ?? 0,
      monthRevenue: monthTotals[0]?.month_revenue ?? 0,
      monthOrders: monthTotals[0]?.month_orders ?? 0,
      recentOrders,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
