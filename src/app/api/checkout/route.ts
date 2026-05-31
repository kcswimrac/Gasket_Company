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
    // Rate limiting: 5 requests per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`checkout:${ip}`, 5, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { items, customer, promoCode } = (await request.json()) as {
      items: CartItem[];
      customer: CustomerForm;
      promoCode?: string;
    };

    if (!items?.length || !customer?.name || !customer?.email) {
      return NextResponse.json({ success: false, error: "Items and customer info required" }, { status: 400 });
    }

    // Input validation
    customer.name = sanitize(maxLength(customer.name, 100));
    if (!isValidEmail(customer.email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }
    if (customer.phone) customer.phone = sanitize(maxLength(customer.phone, 20));
    if (customer.address) customer.address = sanitize(maxLength(customer.address, 200));

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
          company = ${customer.company || null},
          last_activity_at = NOW()
        WHERE id = ${customerId}
      `;
    } else {
      const created = await sql`
        INSERT INTO customers (name, email, phone, company, last_activity_at)
        VALUES (${customer.name}, ${customer.email}, ${customer.phone || null}, ${customer.company || null}, NOW())
        RETURNING id
      `;
      customerId = created[0].id as string;
    }

    // ── Promo code validation ──
    let discountAmount = 0;
    let promoId: string | null = null;
    let promoNote = "";

    if (promoCode) {
      const promoRows = await sql`
        SELECT id, code, discount_type, discount_value, min_order_amount,
               max_uses, current_uses, active, expires_at
        FROM promo_codes
        WHERE code = ${promoCode.toUpperCase().trim()}
        LIMIT 1
      `;

      if (promoRows.length === 0) {
        return NextResponse.json({ success: false, error: "Invalid promo code" }, { status: 400 });
      }

      const promo = promoRows[0];

      if (!promo.active) {
        return NextResponse.json({ success: false, error: "This promo code is no longer active" }, { status: 400 });
      }

      if (promo.expires_at && new Date(promo.expires_at as string) < new Date()) {
        return NextResponse.json({ success: false, error: "This promo code has expired" }, { status: 400 });
      }

      if (promo.max_uses && (promo.current_uses as number) >= (promo.max_uses as number)) {
        return NextResponse.json({ success: false, error: "This promo code has reached its usage limit" }, { status: 400 });
      }

      const rawTotal = items.reduce((s, i) => s + parseFloat(i.totalPrice || "0"), 0);
      if (promo.min_order_amount && rawTotal < parseFloat(promo.min_order_amount as string)) {
        return NextResponse.json({
          success: false,
          error: `Minimum order of $${parseFloat(promo.min_order_amount as string).toFixed(2)} required for this promo code`,
        }, { status: 400 });
      }

      if (promo.discount_type === "percentage") {
        discountAmount = rawTotal * (parseFloat(promo.discount_value as string) / 100);
      } else {
        discountAmount = parseFloat(promo.discount_value as string);
      }

      discountAmount = Math.min(discountAmount, rawTotal);
      discountAmount = Math.round(discountAmount * 100) / 100;
      promoId = promo.id as string;
      promoNote = `\nPromo: ${promo.code} (-$${discountAmount.toFixed(2)})`;
    }

    // Create order in our DB
    const rawTotalPrice = items.reduce((s, i) => s + parseFloat(i.totalPrice || "0"), 0);
    const totalPrice = Math.round((rawTotalPrice - discountAmount) * 100) / 100;
    const orderNotes = (customer.notes || "") + promoNote;
    const orderRows = await sql`
      INSERT INTO orders (customer_id, status, total_price, notes)
      VALUES (${customerId}, ${allPriced ? "quoted" : "pending_quote"}, ${totalPrice.toFixed(2)}, ${orderNotes || null})
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

      // Add discount line item if promo applied
      if (discountAmount > 0 && promoCode) {
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: `Discount (${promoCode.toUpperCase()})`,
              description: "Promo code discount",
            },
            unit_amount: -Math.round(discountAmount * 100),
          },
          quantity: 1,
        });
      }

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

      // Increment promo code usage
      if (promoId) {
        await sql`UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ${promoId}`;
      }

      return NextResponse.json({ success: true, url: session.url, orderId });
    }

    // Increment promo code usage for estimate orders too
    if (promoId) {
      await sql`UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ${promoId}`;
    }

    // Items have estimates — skip Stripe for now, mark as pending review
    return NextResponse.json({
      success: true,
      url: null,
      orderId,
      message: "Order submitted for review. We'll confirm pricing and send a payment link.",
    });
  } catch (e) {
    logError("api/checkout", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
