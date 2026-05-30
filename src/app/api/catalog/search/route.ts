import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { partSlug } from "@/lib/slug";
import { rateLimit } from "@/lib/rate-limit";
import { logError } from "@/lib/logger";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() || "";

    if (q.length < 2) {
      return NextResponse.json(
        { success: false, error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Rate limit: 30 req/min per IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rl = rateLimit(`catalog-search:${ip}`, 30, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 }
      );
    }

    const sql = getSQL();
    const pattern = `%${q}%`;

    const rows = await sql`
      SELECT id, name, make, model, segment, application
      FROM parts
      WHERE active IS NOT false
        AND (
          name ILIKE ${pattern}
          OR make ILIKE ${pattern}
          OR model ILIKE ${pattern}
          OR application ILIKE ${pattern}
        )
      ORDER BY COALESCE(times_sold, 0) DESC, name
      LIMIT 8
    `;

    const suggestions = rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      make: (r.make as string | null) || null,
      model: (r.model as string | null) || null,
      segment: (r.segment as string | null) || null,
      slug: partSlug({
        id: r.id as string,
        name: r.name as string,
        make: r.make as string | null,
        model: r.model as string | null,
      }),
    }));

    return NextResponse.json(
      { success: true, suggestions },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=30, stale-while-revalidate=120",
        },
      }
    );
  } catch (e) {
    logError("api/catalog/search", e);
    return NextResponse.json(
      { success: false, error: "Search failed" },
      { status: 500 }
    );
  }
}
