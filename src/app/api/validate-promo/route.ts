import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 10 per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`validate-promo:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ valid: false, message: "Too many requests. Please wait." }, { status: 429 });
    }

    const { code, subtotal } = await request.json();

    if (!code || subtotal == null) {
      return NextResponse.json({ valid: false, message: "Code and subtotal are required" }, { status: 400 });
    }

    const sql = getSQL();
    const rows = await sql`
      SELECT id, code, discount_type, discount_value, min_order_amount,
             max_uses, current_uses, active, expires_at
      FROM promo_codes
      WHERE code = ${code.toUpperCase().trim()}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, message: "Invalid promo code" });
    }

    const promo = rows[0];

    if (!promo.active) {
      return NextResponse.json({ valid: false, message: "This promo code is no longer active" });
    }

    if (promo.expires_at && new Date(promo.expires_at as string) < new Date()) {
      return NextResponse.json({ valid: false, message: "This promo code has expired" });
    }

    if (promo.max_uses && (promo.current_uses as number) >= (promo.max_uses as number)) {
      return NextResponse.json({ valid: false, message: "This promo code has reached its usage limit" });
    }

    const subtotalNum = parseFloat(subtotal);
    if (promo.min_order_amount && subtotalNum < parseFloat(promo.min_order_amount as string)) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of $${parseFloat(promo.min_order_amount as string).toFixed(2)} required`,
      });
    }

    let discount = 0;
    if (promo.discount_type === "percentage") {
      discount = subtotalNum * (parseFloat(promo.discount_value as string) / 100);
    } else {
      discount = parseFloat(promo.discount_value as string);
    }

    // Don't discount more than the subtotal
    discount = Math.min(discount, subtotalNum);
    discount = Math.round(discount * 100) / 100;

    const discountedTotal = Math.round((subtotalNum - discount) * 100) / 100;

    return NextResponse.json({
      valid: true,
      discount: discount.toFixed(2),
      discountedTotal: discountedTotal.toFixed(2),
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      message: promo.discount_type === "percentage"
        ? `${parseFloat(promo.discount_value as string)}% off applied`
        : `$${parseFloat(promo.discount_value as string).toFixed(2)} off applied`,
    });
  } catch (e) {
    console.error("Validate promo error:", e);
    return NextResponse.json({ valid: false, message: "Failed to validate promo code" }, { status: 500 });
  }
}
