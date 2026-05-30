import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function POST(request: NextRequest) {
  try {
    const { customerId } = await request.json();
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerId is required" },
        { status: 400 }
      );
    }

    const sql = getSQL();

    // Check that customer exists and isn't already deleted
    const existing = await sql`
      SELECT id, deleted_at FROM customers WHERE id = ${customerId} LIMIT 1
    `;
    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }
    if (existing[0].deleted_at) {
      return NextResponse.json(
        { success: false, error: "Customer data has already been deleted" },
        { status: 400 }
      );
    }

    // Anonymize customer data instead of hard delete (preserves order history integrity)
    const anonymizedEmail = `deleted-${randomUUID()}@deleted.local`;
    await sql`
      UPDATE customers SET
        name = ${"Deleted Customer"},
        email = ${anonymizedEmail},
        phone = ${null},
        company = ${null},
        notes = ${null},
        deleted_at = NOW()
      WHERE id = ${customerId}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    logError("api/admin/customers/delete", e);
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
