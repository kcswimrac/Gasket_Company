import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { rateLimit } from "@/lib/rate-limit";
import { sanitize, isValidEmail, maxLength } from "@/lib/sanitize";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  try {
    const sql = getSQL();
    const bounties = await sql`
      SELECT id, title, description, segment, make, model, year_start, year_end,
             reward, priority, status, created_at
      FROM bounty_board
      WHERE status = 'open'
      ORDER BY
        CASE priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 WHEN 'low' THEN 2 END,
        created_at DESC
    `;
    return NextResponse.json({ success: true, bounties }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    return NextResponse.json({ success: false, bounties: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`bounties:${ip}`, 10, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const sql = getSQL();
    let { bountyId, name, email, notes } = await request.json();
    if (!bountyId || !name || !email) {
      return NextResponse.json({ success: false, error: "bountyId, name, and email required" }, { status: 400 });
    }

    // Input validation
    name = sanitize(maxLength(name, 100));
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }
    if (notes) notes = sanitize(notes);

    const existing = await sql`SELECT id FROM contributors WHERE name = ${name} LIMIT 1`;
    let contributorId: string;
    if (existing.length > 0) {
      contributorId = existing[0].id as string;
    } else {
      const created = await sql`
        INSERT INTO contributors (name, email, public_credit_name) VALUES (${name}, ${email}, ${name}) RETURNING id
      `;
      contributorId = created[0].id as string;
    }

    await sql`
      UPDATE bounty_board SET
        status = 'claimed', claimed_by = ${contributorId}, claimed_at = NOW(), updated_at = NOW()
      WHERE id = ${bountyId} AND status = 'open'
    `;

    // Create customer record
    const existingCust = await sql`SELECT id FROM customers WHERE email = ${email} LIMIT 1`;
    if (existingCust.length === 0) {
      await sql`INSERT INTO customers (name, email, notes) VALUES (${name}, ${email}, ${"Bounty claim"})`;
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
