import { NextRequest, NextResponse } from "next/server";
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
    const promos = await sql`
      SELECT id, code, discount_type, discount_value, min_order_amount,
             max_uses, current_uses, active, expires_at, created_at
      FROM promo_codes
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ success: true, promos });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Failed to fetch promos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt } = body;

    if (!code || !discountType || discountValue == null) {
      return NextResponse.json(
        { success: false, error: "Code, discount type, and value are required" },
        { status: 400 }
      );
    }

    const upperCode = code.toUpperCase().trim();
    if (!/^[A-Z0-9_-]+$/.test(upperCode)) {
      return NextResponse.json(
        { success: false, error: "Code must be alphanumeric (A-Z, 0-9, -, _)" },
        { status: 400 }
      );
    }

    const sql = getSQL();
    const result = await sql`
      INSERT INTO promo_codes (code, discount_type, discount_value, min_order_amount, max_uses, expires_at)
      VALUES (
        ${upperCode},
        ${discountType},
        ${parseFloat(discountValue)},
        ${minOrderAmount ? parseFloat(minOrderAmount) : null},
        ${maxUses ? parseInt(maxUses) : null},
        ${expiresAt || null}
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, promo: result[0] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to create promo";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ success: false, error: "A promo code with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Promo ID required" }, { status: 400 });
    }

    const sql = getSQL();

    if (typeof active === "boolean") {
      await sql`UPDATE promo_codes SET active = ${active} WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Failed to update promo" },
      { status: 500 }
    );
  }
}
