import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { logAudit } from "@/lib/audit";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET() {
  try {
    const sql = getSQL();
    const rows = await sql`SELECT key, value FROM settings`;
    const settings: Record<string, string> = {};
    for (const r of rows) settings[r.key as string] = r.value as string;
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ success: true, settings: {} });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sql = getSQL();
    const { key, value } = await request.json();
    if (!key) return NextResponse.json({ success: false, error: "key required" }, { status: 400 });

    await sql`
      INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${String(value)}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${String(value)}, updated_at = NOW()
    `;

    await logAudit({
      action: "update_setting",
      entityType: "setting",
      entityId: key,
      details: { value: String(value) },
      ip: request.headers.get("x-forwarded-for") || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
