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
    const [partsRow, ordersRow, scanRow, contribRow] = await Promise.all([
      sql`SELECT
        COUNT(*) FILTER (WHERE active IS NOT false)::int as total,
        COUNT(*) FILTER (WHERE active IS NOT false AND created_at > NOW() - INTERVAL '30 days')::int as recent
      FROM parts`,
      sql`SELECT
        COUNT(*) FILTER (WHERE status NOT IN ('delivered', 'cancelled'))::int as open,
        COUNT(*) FILTER (WHERE status = 'pending_quote')::int as pending
      FROM orders`,
      sql`SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status IN ('received', 'cad_ready'))::int as awaiting
      FROM scan_queue WHERE completed_at IS NULL`,
      sql`SELECT COUNT(*)::int as total FROM contributors`,
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        activeParts: partsRow[0].total as number,
        recentParts: partsRow[0].recent as number,
        openOrders: ordersRow[0].open as number,
        pendingOrders: ordersRow[0].pending as number,
        scanQueue: scanRow[0].total as number,
        awaitingScan: scanRow[0].awaiting as number,
        contributors: contribRow[0].total as number,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
