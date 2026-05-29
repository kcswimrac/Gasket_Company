import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { sendEmail, paymentLinkEmail } from "@/lib/email";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId required" }, { status: 400 });
    }

    // Fetch order + customer
    const orders = await sql`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.id
      WHERE o.id = ${orderId}
    `;
    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    const order = orders[0];

    // Fetch line items with part info
    const items = await sql`
      SELECT oli.*, pv.tier, pv.material, pv.process,
             p.name as part_name, p.application
      FROM order_line_items oli
      LEFT JOIN part_variants pv ON oli.variant_id = pv.id
      LEFT JOIN parts p ON pv.part_id = p.id
      WHERE oli.order_id = ${orderId}
    `;

    // Check all items have prices
    const unpricedItems = items.filter((i) => !i.unit_price || parseFloat(i.unit_price as string) <= 0);
    if (unpricedItems.length > 0) {
      return NextResponse.json({
        success: false,
        error: `${unpricedItems.length} item(s) still need pricing before confirming.`,
      }, { status: 400 });
    }

    // Recalculate order total from line items
    const orderTotal = items.reduce((sum, i) => {
      const qty = (i.quantity as number) || 1;
      const unit = parseFloat(i.unit_price as string) || 0;
      return sum + (unit * qty);
    }, 0);

    await sql`UPDATE orders SET total_price = ${orderTotal.toFixed(2)}, updated_at = NOW() WHERE id = ${orderId}`;

    // Generate Stripe Checkout Session
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      // No Stripe — just mark as quoted and return the total
      await sql`UPDATE orders SET status = 'quoted', updated_at = NOW() WHERE id = ${orderId}`;
      return NextResponse.json({
        success: true,
        status: "quoted",
        total: orderTotal.toFixed(2),
        paymentUrl: null,
        message: "Pricing confirmed. Stripe not configured — send invoice manually.",
      });
    }

    const stripe = new Stripe(stripeKey);
    const origin = request.headers.get("origin") || "https://backyardrestorations.com";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: (item.part_name as string) || "Part",
          description: [
            item.tier && (item.tier as string).toUpperCase(),
            item.material,
            item.process,
          ].filter(Boolean).join(" · ") || undefined,
        },
        unit_amount: Math.round(parseFloat(item.unit_price as string) * 100),
      },
      quantity: (item.quantity as number) || 1,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: order.customer_email as string || undefined,
      line_items: lineItems,
      shipping_address_collection: { allowed_countries: ["US", "CA"] },
      metadata: { order_id: orderId, customer_id: order.customer_id as string || "" },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/catalog`,
    });

    // Update order status and store payment link
    await sql`
      UPDATE orders SET
        status = 'quoted',
        notes = COALESCE(notes, '') || ${`\nPayment link: ${session.url}\nStripe session: ${session.id}`},
        updated_at = NOW()
      WHERE id = ${orderId}
    `;

    // Send payment link email to customer
    let emailSent = false;
    let emailError: string | undefined;
    if (order.customer_email && session.url) {
      const { subject, html } = paymentLinkEmail({
        customerName: (order.customer_name as string) || "there",
        orderId,
        total: orderTotal.toFixed(2),
        paymentUrl: session.url,
      });
      const result = await sendEmail({ to: order.customer_email as string, subject, html });
      emailSent = result.sent;
      if (!result.sent) emailError = result.reason;
    }

    return NextResponse.json({
      success: true,
      status: "quoted",
      total: orderTotal.toFixed(2),
      paymentUrl: session.url,
      emailSent,
      emailError,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
