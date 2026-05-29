import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

export async function GET(request: NextRequest) {
  try {
    const sql = getSQL();
    const segment = request.nextUrl.searchParams.get("segment");
    const make = request.nextUrl.searchParams.get("make");

    // Get available makes for a segment (or all segments)
    const makesQuery = segment
      ? sql`
        SELECT DISTINCT make, COUNT(*)::int as part_count
        FROM parts WHERE active IS NOT false AND make IS NOT NULL AND segment = ${segment}
        GROUP BY make ORDER BY make
      `
      : sql`
        SELECT DISTINCT make, COUNT(*)::int as part_count
        FROM parts WHERE active IS NOT false AND make IS NOT NULL
        GROUP BY make ORDER BY make
      `;

    // Get available models for a make (optionally within a segment)
    const modelsQuery = make
      ? segment
        ? sql`
          SELECT DISTINCT model, COUNT(*)::int as part_count
          FROM parts WHERE active IS NOT false AND model IS NOT NULL AND make = ${make} AND segment = ${segment}
          GROUP BY model ORDER BY model
        `
        : sql`
          SELECT DISTINCT model, COUNT(*)::int as part_count
          FROM parts WHERE active IS NOT false AND model IS NOT NULL AND make = ${make}
          GROUP BY model ORDER BY model
        `
      : Promise.resolve([]);

    // Get available year ranges for the current filter
    const yearsQuery = make
      ? segment
        ? sql`
          SELECT DISTINCT year_start, year_end
          FROM parts WHERE active IS NOT false AND year_start IS NOT NULL AND make = ${make}
          ${make && segment ? sql`AND segment = ${segment}` : sql``}
          ORDER BY year_start
        `
        : sql`
          SELECT DISTINCT year_start, year_end
          FROM parts WHERE active IS NOT false AND year_start IS NOT NULL AND make = ${make}
          ORDER BY year_start
        `
      : Promise.resolve([]);

    const [makes, models, years] = await Promise.all([makesQuery, modelsQuery, yearsQuery]);

    // Build year ranges — dedupe overlapping spans into readable labels
    const yearRanges: Array<{ start: number; end: number | null; label: string }> = [];
    const seenRanges = new Set<string>();
    for (const y of years) {
      const s = y.year_start as number;
      const e = (y.year_end as number | null) || s;
      const key = `${s}-${e}`;
      if (seenRanges.has(key)) continue;
      seenRanges.add(key);
      yearRanges.push({
        start: s,
        end: e,
        label: s === e ? String(s) : `${s}–${e}`,
      });
    }

    return NextResponse.json({
      success: true,
      makes: makes.map((m) => ({ name: m.make as string, count: m.part_count as number })),
      models: models.map((m) => ({ name: m.model as string, count: m.part_count as number })),
      years: yearRanges,
    }, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600" },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
