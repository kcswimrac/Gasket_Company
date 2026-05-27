import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/**
 * POST /api/contribute
 * Public-facing: creates a contributor + scan queue entry + customer record
 */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { partDescription, application, name, email } = await request.json();

    if (!partDescription || !application) {
      return NextResponse.json(
        { success: false, error: "Part description and application are required" },
        { status: 400 }
      );
    }

    // Create or find contributor
    let contributorId = null;
    if (name) {
      const existing = await sql`SELECT id FROM contributors WHERE name = ${name} LIMIT 1`;
      if (existing.length > 0) {
        contributorId = existing[0].id;
        if (email) {
          await sql`UPDATE contributors SET email = ${email} WHERE id = ${contributorId} AND email IS NULL`;
        }
      } else {
        const created = await sql`
          INSERT INTO contributors (name, email, public_credit_name)
          VALUES (${name}, ${email || null}, ${name})
          RETURNING id
        `;
        contributorId = created[0].id;
      }
    }

    // Create or find customer record (for CRM)
    if (name && email) {
      const existingCustomer = await sql`SELECT id FROM customers WHERE email = ${email} LIMIT 1`;
      if (existingCustomer.length === 0) {
        await sql`
          INSERT INTO customers (name, email, notes)
          VALUES (${name}, ${email}, ${"Contributor submission from website"})
        `;
      }
    }

    // Create scan queue entry
    const result = await sql`
      INSERT INTO scan_queue (contributor_id, part_description, application, status)
      VALUES (${contributorId}, ${partDescription}, ${application}, ${"received"})
      RETURNING id
    `;

    return NextResponse.json({ success: true, scanQueueId: result[0].id });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
