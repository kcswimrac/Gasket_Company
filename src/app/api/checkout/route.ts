import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  return new Stripe(key);
}

interface CartItem {
  partId: string;
  partName: string;
  variantId: string | null;
  tier: string | null;
  material: string;
  process: string;
  quantity: number;
  unitPrice: string | null;
  totalPrice: string | null;
  leadTimeDays: number | null;
  isEstimate: boolean;
  quoteId: string | null;
  quoteSource: string;
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
}

export async function POST(request: NextRequest) {
  try {
    const { items, customer } = (await request.json()) as {
      items: CartItem[];
      customer: CustomerForm;
    };

    if (!items?.length || !customer?.name || !customer?.email) {
      return NextResponse.json({ success: false, error: "Items and customer info required" }, { status: 400 });
    }

    const sql = getSQL();
    const stripe = getStripe();
    const hasEstimates = items.some((i) => i.isEstimate);
    const allPriced = items.every((i) => i.unitPrice && parseFloat(i.unitPrice) > 0);

    // Find or create customer in our DB
    const existing = await sql`SELECT id FROM customers WHERE email = ${customer.email} LIMIT 1`;
    let customerId: string;
    if (existing.length > 0) {
      customerId = existing[0].id as string;
      await sql`
        UPDATE customers SET
          name = ${customer.name},
          phone = ${customer.phone || null},
          company = ${customer.company || null}
        WHERE id = ${customerId}
      `;
    } else {
      const created = await sql`
        INSERT INTO customers (name, email, phone, company)
        VALUES (${customer.name}, ${customer.email}, ${customer.phone || null}, ${customer.company || null})
        RETURNING id
      `;
      customerId = created[0].id as string;
    }

    // Create order in our DB
    const totalPrice = items.reduce((s, i) => s + parseFloat(i.totalPrice || "0"), 0);
    const orderRows = await sql`
      INSERT INTO orders (customer_id, status, total_price, notes)
      VALUES (${customerId}, ${hasEstimates ? "pending_quote" : "pending_quote"}, ${totalPrice.toFixed(2)}, ${customer.notes || null})
      RETURNING id
    `;
    const orderId = orderRows[0].id as string;

    // Create line items
    for (const item of items) {
      await sql`
        INSERT INTO order_line_items (order_id, variant_id, quantity, unit_price, total_price, autoquote_quote_id, status, notes)
        VALUES (
          ${orderId},
          ${item.variantId || null},
          ${item.quantity},
          ${item.unitPrice || null},
          ${item.totalPrice || null},
          ${item.quoteId || null},
          ${item.isEstimate ? "pending_quote" : "pending_quote"},
          ${`${item.partName} — ${item.material} (${item.process})`}
        )
      `;
    }

    // If all items have firm prices, create Stripe Checkout Session
    if (allPriced) {
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.partName,
            description: [
              item.tier && item.tier.toUpperCase(),
              item.material,
              item.process,
              item.isEstimate && "(estimate)",
            ].filter(Boolean).join(" · "),
          },
          unit_amount: Math.round(parseFloat(item.unitPrice!) * 100),
        },
        quantity: item.quantity,
      }));

      const origin = request.headers.get("origin") || "https://backyardrestorations.com";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: customer.email,
        line_items: lineItems,
        shipping_address_collection: { allowed_countries: ["US", "CA"] },
        metadata: {
          order_id: orderId,
          customer_id: customerId,
        },
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?cancelled=true`,
      });

      // Store Stripe session ID on the order
      await sql`UPDATE orders SET notes = COALESCE(notes, '') || ${`\nStripe: ${session.id}`} WHERE id = ${orderId}`;

      return NextResponse.json({ success: true, url: session.url, orderId });
    }

    // Items have estimates — skip Stripe for now, mark as pending review
    return NextResponse.json({
      success: true,
      url: null,
      orderId,
      message: "Order submitted for review. We'll confirm pricing and send a payment link.",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
