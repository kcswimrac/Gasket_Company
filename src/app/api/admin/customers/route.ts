import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/** GET — list customers with order count and total spent */
export async function GET(request: NextRequest) {
  try {
    const sql = getSQL();
    const search = request.nextUrl.searchParams.get("search");

    let customers;
    if (search) {
      const pattern = "%" + search + "%";
      customers = await sql`
        SELECT
          c.*,
          COALESCE(agg.order_count, 0)::int AS order_count,
          COALESCE(agg.total_spent, 0)::numeric AS total_spent
        FROM customers c
        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*)::int AS order_count,
            SUM(COALESCE(total_price, 0)) AS total_spent
          FROM orders
          GROUP BY customer_id
        ) agg ON agg.customer_id = c.id
        WHERE c.name ILIKE ${pattern}
          OR c.email ILIKE ${pattern}
          OR c.company ILIKE ${pattern}
        ORDER BY c.created_at DESC
      `;
    } else {
      customers = await sql`
        SELECT
          c.*,
          COALESCE(agg.order_count, 0)::int AS order_count,
          COALESCE(agg.total_spent, 0)::numeric AS total_spent
        FROM customers c
        LEFT JOIN (
          SELECT
            customer_id,
            COUNT(*)::int AS order_count,
            SUM(COALESCE(total_price, 0)) AS total_spent
          FROM orders
          GROUP BY customer_id
        ) agg ON agg.customer_id = c.id
        ORDER BY c.created_at DESC
      `;
    }

    return NextResponse.json({ success: true, customers });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** POST — create a new customer */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const body = await request.json();
    const { name, email, phone, company, is_shop_account, notes } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO customers (name, email, phone, company, is_shop_account, notes)
      VALUES (${name}, ${email}, ${phone || null}, ${company || null}, ${!!is_shop_account}, ${notes || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, customer: rows[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** PUT — update an existing customer */
export async function PUT(request: NextRequest) {
  try {
    const sql = getSQL();
    const body = await request.json();
    const { id, name, email, phone, company, is_shop_account, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Customer id is required" },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE customers
      SET
        name = COALESCE(${name ?? null}, name),
        email = COALESCE(${email ?? null}, email),
        phone = ${phone ?? null},
        company = ${company ?? null},
        is_shop_account = COALESCE(${is_shop_account ?? null}, is_shop_account),
        notes = ${notes ?? null}
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, customer: rows[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
