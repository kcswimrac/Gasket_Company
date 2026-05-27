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
    const search = request.nextUrl.searchParams.get("search");

    let parts;
    if (segment && search) {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active = true AND p.segment = ${segment}
        AND (p.name ILIKE ${"%" + search + "%"} OR p.application ILIKE ${"%" + search + "%"} OR p.make ILIKE ${"%" + search + "%"} OR p.model ILIKE ${"%" + search + "%"})
        ORDER BY p.name
      `;
    } else if (segment) {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active = true AND p.segment = ${segment}
        ORDER BY p.name
      `;
    } else if (search) {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active = true
        AND (p.name ILIKE ${"%" + search + "%"} OR p.application ILIKE ${"%" + search + "%"} OR p.make ILIKE ${"%" + search + "%"} OR p.model ILIKE ${"%" + search + "%"})
        ORDER BY p.name
      `;
    } else {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active = true
        ORDER BY p.name
      `;
    }

    // Fetch variants
    const partIds = parts.map((p) => p.id);
    let variants: Record<string, unknown>[] = [];
    if (partIds.length > 0) {
      variants = await sql`
        SELECT id, part_id, tier, material, process, base_price,
               lead_time_days, available, last_quoted_price, last_quoted_at,
               last_quote_expires_at
        FROM part_variants
        WHERE part_id = ANY(${partIds})
        ORDER BY
          CASE tier
            WHEN 'fitment_check' THEN 0
            WHEN 'oem' THEN 1
            WHEN 'improved' THEN 2
            WHEN 'custom' THEN 3
          END
      `;
    }

    const variantsByPart: Record<string, typeof variants> = {};
    for (const v of variants) {
      const pid = v.part_id as string;
      if (!variantsByPart[pid]) variantsByPart[pid] = [];
      variantsByPart[pid].push(v);
    }

    const result = parts.map((p) => {
      const pvariants = (variantsByPart[p.id as string] || []).map((v) => {
        const lastQuotedAt = v.last_quoted_at ? new Date(v.last_quoted_at as string) : null;
        const expiresAt = v.last_quote_expires_at ? new Date(v.last_quote_expires_at as string) : null;
        const isStale = !lastQuotedAt || (Date.now() - lastQuotedAt.getTime() > 30 * 24 * 60 * 60 * 1000);
        const isExpired = expiresAt ? expiresAt <= new Date() : true;

        return {
          ...v,
          displayPrice: (!isStale && !isExpired && v.last_quoted_price)
            ? v.last_quoted_price
            : v.base_price || null,
          priceIsEstimate: isStale || isExpired || !v.last_quoted_price,
        };
      });

      return { ...p, variants: pvariants };
    });

    return NextResponse.json({ success: true, parts: result });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
