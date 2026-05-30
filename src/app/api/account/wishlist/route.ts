import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const sql = getSQL();

    // Find customer by email (works for both customer and admin sessions)
    const customers = await sql`SELECT id FROM customers WHERE email = ${session.user.email} AND deleted_at IS NULL LIMIT 1`;
    if (customers.length === 0) {
      return NextResponse.json({ success: true, items: [] });
    }
    const customerId = customers[0].id as string;

    const items = await sql`
      SELECT
        w.id,
        w.part_id,
        w.created_at,
        p.name AS part_name,
        p.make,
        p.model,
        p.segment,
        (
          SELECT pf.file_url
          FROM part_files pf
          WHERE pf.part_id = p.id
            AND pf.file_type LIKE 'photo_%'
            AND pf.show_in_catalog = true
          ORDER BY pf.display_order ASC
          LIMIT 1
        ) AS photo_url
      FROM wishlists w
      JOIN parts p ON p.id = w.part_id
      WHERE w.customer_id = ${customerId}
      ORDER BY w.created_at DESC
    `;

    return NextResponse.json({ success: true, items });
  } catch (e) {
    console.error("Wishlist GET error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { partId } = body;

    if (!partId) {
      return NextResponse.json({ success: false, error: "partId is required" }, { status: 400 });
    }

    const sql = getSQL();

    // Find or create customer by email
    let customers = await sql`SELECT id FROM customers WHERE email = ${session.user.email} AND deleted_at IS NULL LIMIT 1`;
    if (customers.length === 0) {
      customers = await sql`INSERT INTO customers (name, email) VALUES (${session.user.name || 'User'}, ${session.user.email}) RETURNING id`;
    }
    const customerId = customers[0].id as string;

    await sql`
      INSERT INTO wishlists (customer_id, part_id)
      VALUES (${customerId}, ${partId})
      ON CONFLICT (customer_id, part_id) DO NOTHING
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Wishlist POST error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to add to wishlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { partId } = body;

    if (!partId) {
      return NextResponse.json({ success: false, error: "partId is required" }, { status: 400 });
    }

    const sql = getSQL();
    const customers = await sql`SELECT id FROM customers WHERE email = ${session.user.email} AND deleted_at IS NULL LIMIT 1`;
    if (customers.length === 0) {
      return NextResponse.json({ success: true });
    }
    const customerId = customers[0].id as string;

    await sql`
      DELETE FROM wishlists
      WHERE customer_id = ${customerId}
        AND part_id = ${partId}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Wishlist DELETE error:", e);
    return NextResponse.json(
      { success: false, error: "Failed to remove from wishlist" },
      { status: 500 }
    );
  }
}
