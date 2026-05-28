import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 400 }
    );
  }

  const sql = getSQL();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;

      if (!orderId) break;

      await sql`
        UPDATE orders SET
          status = 'paid',
          updated_at = NOW()
        WHERE id = ${orderId}
      `;

      await sql`
        UPDATE order_line_items SET status = 'paid'
        WHERE order_id = ${orderId}
      `;

      // Store payment details
      const paymentIntent = session.payment_intent as string | null;
      const amountTotal = session.amount_total ? (session.amount_total / 100).toFixed(2) : null;
      if (amountTotal) {
        await sql`UPDATE orders SET total_price = ${amountTotal} WHERE id = ${orderId}`;
      }

      // Store shipping address if collected
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shipping = (session as any).shipping_details as { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string } } | null;
      if (shipping?.address) {
        const addr = [
          shipping.address.line1,
          shipping.address.line2,
          shipping.address.city,
          shipping.address.state,
          shipping.address.postal_code,
        ].filter(Boolean).join(", ");
        await sql`
          UPDATE orders SET
            shipping_method = ${`Stripe — ${addr}`},
            notes = COALESCE(notes, '') || ${`\nPayment: ${paymentIntent || session.id}\nShip to: ${shipping.name || ""} ${addr}`}
          WHERE id = ${orderId}
        `;
      }
      break;
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await sql`UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ${orderId} AND status = 'pending_quote'`;
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
