import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { logError } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`track:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const orderId = request.nextUrl.searchParams.get("orderId");
    const email = request.nextUrl.searchParams.get("email");

    if (!orderId || !email) {
      return NextResponse.json(
        { success: false, error: "Order ID and email are required" },
        { status: 400 }
      );
    }

    const sql = getSQL();

    // Support both full UUID and 8-char short ID
    const isShortId = orderId.length <= 8;
    const orderQuery = isShortId
      ? sql`
          SELECT o.id, o.status, o.total_price, o.tracking_number, o.created_at, o.shipped_at,
                 c.email as customer_email
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          WHERE CAST(o.id AS text) LIKE ${orderId + "%"}
          LIMIT 1
        `
      : sql`
          SELECT o.id, o.status, o.total_price, o.tracking_number, o.created_at, o.shipped_at,
                 c.email as customer_email
          FROM orders o
          LEFT JOIN customers c ON o.customer_id = c.id
          WHERE o.id = ${orderId}
          LIMIT 1
        `;

    const orders = await orderQuery;

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = orders[0];

    // Verify email matches
    if (
      !order.customer_email ||
      (order.customer_email as string).toLowerCase() !== email.toLowerCase()
    ) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Fetch line items with part names
    const items = await sql`
      SELECT
        oli.quantity,
        oli.unit_price,
        oli.total_price,
        COALESCE(oli.notes, '') as notes,
        p.name as part_name
      FROM order_line_items oli
      LEFT JOIN part_variants pv ON oli.variant_id = pv.id
      LEFT JOIN parts p ON pv.part_id = p.id
      WHERE oli.order_id = ${order.id}
    `;

    // Build line items for response - extract part name from notes if join didn't get it
    const lineItems = items.map((item) => {
      let partName = item.part_name as string | null;
      if (!partName && item.notes) {
        // Notes format: "Part Name — Material (Process)"
        const notesStr = item.notes as string;
        const dashIdx = notesStr.indexOf(" — ");
        if (dashIdx > 0) {
          partName = notesStr.substring(0, dashIdx);
        } else {
          partName = notesStr;
        }
      }
      return {
        partName: partName || "Item",
        quantity: item.quantity as number,
        unitPrice: item.unit_price as string | null,
        totalPrice: item.total_price as string | null,
      };
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id as string,
        shortId: (order.id as string).slice(0, 8),
        status: order.status as string,
        totalPrice: order.total_price as string | null,
        trackingNumber: order.tracking_number as string | null,
        createdAt: order.created_at as string,
        shippedAt: order.shipped_at as string | null,
        items: lineItems,
      },
    });
  } catch (e) {
    logError("api/track", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
