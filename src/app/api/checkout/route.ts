import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { neon } from "@neondatabase/serverless";
import { rateLimit } from "@/lib/rate-limit";
import { sanitize, isValidEmail, maxLength } from "@/lib/sanitize";
import { logError } from "@/lib/logger";

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

    // ── Price trust validation: verify client prices against DB ──
    for (const item of items) {
      if (!item.unitPrice || parseFloat(item.unitPrice) <= 0) continue;

      const clientPrice = parseFloat(item.unitPrice);
      let dbPrice: number | null = null;

      if (item.variantId) {
        // Look up variant price: prefer last_quoted_price, fall back to base_price
        const rows = await sql`
          SELECT last_quoted_price, base_price
          FROM part_variants
          WHERE id = ${item.variantId}
          LIMIT 1
        `;
        if (rows.length > 0) {
          const row = rows[0];
          const quoted = row.last_quoted_price != null ? parseFloat(row.last_quoted_price as string) : null;
          const base = row.base_price != null ? parseFloat(row.base_price as string) : null;
          dbPrice = quoted ?? base;
        }
      } else if (item.partId) {
        // Look up part-level estimate price
        const rows = await sql`
          SELECT last_estimate_price
          FROM parts
          WHERE id = ${item.partId}
          LIMIT 1
        `;
        if (rows.length > 0 && rows[0].last_estimate_price != null) {
          dbPrice = parseFloat(rows[0].last_estimate_price as string);
        }
      }

      // If we found a DB price and the client price is below it, reject the order
      if (dbPrice !== null && dbPrice > 0) {
        if (clientPrice < dbPrice) {
          return NextResponse.json(
            {
              success: false,
              error: `Price mismatch for "${item.partName}": submitted price $${clientPrice.toFixed(2)} is below the actual price $${dbPrice.toFixed(2)}. Please refresh your cart.`,
            },
            { status: 400 }
          );
        }
        // Allow prices up to 5% above DB price (markup buffer) but no higher
        const maxAllowed = dbPrice * 1.05;
        if (clientPrice > maxAllowed) {
          return NextResponse.json(
            {
              success: false,
              error: `Price mismatch for "${item.partName}": submitted price $${clientPrice.toFixed(2)} exceeds expected range. Please refresh your cart.`,
            },
            { status: 400 }
          );
        }
      }
    }

    const hasEstimates = items.some((i) => i.isEstimate);
    const allPriced = !hasEstimates && items.every((i) => i.unitPrice && parseFloat(i.unitPrice) > 0);

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
      VALUES (${customerId}, ${allPriced ? "quoted" : "pending_quote"}, ${totalPrice.toFixed(2)}, ${customer.notes || null})
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
          ${item.isEstimate ? "pending_quote" : "quoted"},
          ${`${item.partName} — ${item.material} (${item.process})`}
        )
      `;
    }

    // If all items have firm prices, create Stripe Checkout Session
    if (allPriced) {
      const stripe = getStripe();
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
