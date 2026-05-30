import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function GET() {
  try {
    // Auth is handled by middleware (owner role or bootstrap)
    const sql = getSQL();
    const rows = await sql`
      SELECT id, name, email, role, active, last_login_at, created_at
      FROM admin_users
      ORDER BY created_at ASC
    `;

    return NextResponse.json({ success: true, users: rows });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "name, email, and password are required" },
        { status: 400 }
      );
    }

    const validRoles = ["owner", "operator", "viewer"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role. Must be owner, operator, or viewer" },
        { status: 400 }
      );
    }

    const passwordHash = await sha256(password + "_backyard_salt");
    const userRole = role || "operator";

    const sql = getSQL();

    // Check for existing user
    const existing = await sql`SELECT id FROM admin_users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const rows = await sql`
      INSERT INTO admin_users (name, email, password_hash, role)
      VALUES (${name}, ${email}, ${passwordHash}, ${userRole})
      RETURNING id, name, email, role, active, created_at
    `;

    return NextResponse.json({ success: true, user: rows[0] }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, email, role, active, password } = await request.json();
    if (!id) return NextResponse.json({ success: false, error: "User id is required" }, { status: 400 });

    if (role !== undefined) {
      const validRoles = ["owner", "operator", "viewer"];
      if (!validRoles.includes(role)) return NextResponse.json({ success: false, error: "Invalid role" }, { status: 400 });
    }

    const sql = getSQL();
    const passwordHash = password ? await sha256(password + "_backyard_salt") : null;

    await sql`
      UPDATE admin_users SET
        name = COALESCE(${name || null}, name),
        email = COALESCE(${email || null}, email),
        role = COALESCE(${role || null}, role),
        active = COALESCE(${active ?? null}, active),
        password_hash = COALESCE(${passwordHash}, password_hash)
      WHERE id = ${id}
    `;

    const rows = await sql`SELECT id, name, email, role, active, last_login_at, created_at FROM admin_users WHERE id = ${id}`;
    if (rows.length === 0) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (e) {
    return NextResponse.json({ success: false, error: e instanceof Error ? e.message : "Unknown error" }, { status: 500 });
  }
}
