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

    const items = await sql`
      SELECT sq.*, c.name as contributor_name
      FROM scan_queue sq
      LEFT JOIN contributors c ON sq.contributor_id = c.id
      ORDER BY sq.received_at DESC
    `;

    const counts = await sql`
      SELECT status, COUNT(*)::int as count
      FROM scan_queue
      GROUP BY status
    `;

    const pipeline: Record<string, number> = { received: 0, scanning: 0, modeling: 0, complete: 0 };
    for (const row of counts) {
      pipeline[row.status as string] = row.count as number;
    }

    return NextResponse.json({ success: true, items, pipeline });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const body = await request.json();

    const { partDescription, application, condition, contributorName, contributorEmail, notes } = body;

    if (!partDescription || !application) {
      return NextResponse.json(
        { success: false, error: "partDescription and application are required" },
        { status: 400 }
      );
    }

    // Create or find contributor if info provided
    let contributorId = null;
    if (contributorName) {
      const existing = await sql`SELECT id FROM contributors WHERE name = ${contributorName} LIMIT 1`;
      if (existing.length > 0) {
        contributorId = existing[0].id;
      } else {
        const created = await sql`
          INSERT INTO contributors (name, email)
          VALUES (${contributorName}, ${contributorEmail || null})
          RETURNING id
        `;
        contributorId = created[0].id;
      }
    }

    const result = await sql`
      INSERT INTO scan_queue (contributor_id, part_description, application, condition, notes)
      VALUES (${contributorId}, ${partDescription}, ${application}, ${condition || null}, ${notes || null})
      RETURNING *
    `;

    return NextResponse.json({ success: true, item: result[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getSQL();
    const { id, status, notes } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ success: false, error: "id and status required" }, { status: 400 });
    }

    const timestampField = status === "scanning" ? "scanned_at" : status === "complete" ? "completed_at" : null;

    let result;
    if (timestampField === "scanned_at") {
      result = await sql`UPDATE scan_queue SET status = ${status}, scanned_at = NOW(), notes = COALESCE(${notes || null}, notes) WHERE id = ${id} RETURNING *`;
    } else if (timestampField === "completed_at") {
      result = await sql`UPDATE scan_queue SET status = ${status}, completed_at = NOW(), notes = COALESCE(${notes || null}, notes) WHERE id = ${id} RETURNING *`;
    } else {
      result = await sql`UPDATE scan_queue SET status = ${status}, notes = COALESCE(${notes || null}, notes) WHERE id = ${id} RETURNING *`;
    }

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: result[0] });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
