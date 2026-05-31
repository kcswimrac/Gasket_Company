import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "customer") {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { orderId } = await params;
    const customerId = session.user.id;
    const sql = getSQL();

    const rows = await sql`
      SELECT o.id
      FROM orders o
      WHERE o.id = ${orderId} AND o.customer_id = ${customerId}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Redirect to the invoice page which renders as printable HTML
    return NextResponse.redirect(new URL(`/account/orders/${orderId}/invoice`));
  } catch (e) {
    console.error("Invoice route error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
