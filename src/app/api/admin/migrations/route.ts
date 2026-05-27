import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/** GET — list available migrations and their status */
export async function GET() {
  try {
    const sql = getSQL();

    // Check if migrations tracking table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = '_migrations'
      ) as exists
    `;

    let applied: string[] = [];
    if (tableCheck[0].exists) {
      const rows = await sql`SELECT name, applied_at FROM _migrations ORDER BY applied_at`;
      applied = rows.map((r) => r.name as string);
    }

    // Read migration files from drizzle directory
    const drizzleDir = path.join(process.cwd(), "drizzle");
    let available: string[] = [];
    try {
      const files = fs.readdirSync(drizzleDir);
      available = files
        .filter((f) => f.endsWith(".sql"))
        .sort();
    } catch {
      // drizzle dir may not exist in production build
    }

    // Check what tables exist
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;

    return NextResponse.json({
      success: true,
      tables: tables.map((t) => t.table_name as string),
      migrations: {
        available,
        applied,
        pending: available.filter((m: string) => !applied.includes(m)),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

/** POST — run a specific migration or all pending */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { migration, runAll } = body as { migration?: string; runAll?: boolean };

    const sql = getSQL();

    // Create tracking table if needed
    await sql`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Get already applied
    const appliedRows = await sql`SELECT name FROM _migrations`;
    const applied = new Set(appliedRows.map((r) => r.name as string));

    // Determine which migrations to run
    const drizzleDir = path.join(process.cwd(), "drizzle");
    let toRun: string[] = [];

    if (runAll) {
      const files = fs.readdirSync(drizzleDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();
      toRun = files.filter((f) => !applied.has(f));
    } else if (migration) {
      if (applied.has(migration)) {
        return NextResponse.json(
          { success: false, error: `Migration ${migration} already applied` },
          { status: 400 }
        );
      }
      toRun = [migration];
    } else {
      return NextResponse.json(
        { success: false, error: "Specify migration name or runAll: true" },
        { status: 400 }
      );
    }

    if (toRun.length === 0) {
      return NextResponse.json({ success: true, message: "No pending migrations", applied: [] });
    }

    const results: Array<{ name: string; status: string; error?: string }> = [];

    for (const file of toRun) {
      try {
        const filePath = path.join(drizzleDir, file);
        const sqlContent = fs.readFileSync(filePath, "utf-8");

        // Split on the drizzle statement breakpoint marker
        const statements = sqlContent
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const stmt of statements) {
          await sql.query(stmt);
        }

        // Record as applied
        await sql`INSERT INTO _migrations (name) VALUES (${file})`;
        results.push({ name: file, status: "applied" });
      } catch (e) {
        results.push({
          name: file,
          status: "failed",
          error: e instanceof Error ? e.message : "Unknown error",
        });
        break; // Stop on first failure
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
