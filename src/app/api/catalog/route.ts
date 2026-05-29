import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isCachedPriceStale, type PriceStatus } from "@/lib/autoquote/client";

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
    const sort = request.nextUrl.searchParams.get("sort");
    const make = request.nextUrl.searchParams.get("make");
    const model = request.nextUrl.searchParams.get("model");
    const year = request.nextUrl.searchParams.get("year");

    // Fetch estimate markup setting
    let markupPct = 0;
    const applyMarkup = (price: string) => {
      if (markupPct <= 0) return price;
      return (parseFloat(price) * (1 + markupPct / 100)).toFixed(2);
    };

    const orderClause = sort === "popular" ? sql`ORDER BY COALESCE(p.times_sold, 0) DESC, p.name` : sql`ORDER BY p.name`;
    const yearNum = year ? parseInt(year) : null;

    // Single query with conditional filters
    const partsQuery = sql`
      SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
             p.application, p.description, p.fitment_status, p.dimensions, p.cad_file_url, p.last_estimate_price, p.last_estimate_at, p.last_estimate_material,
             COALESCE(p.times_sold, 0) as times_sold,
             COALESCE(p.custom_quotes, '[]'::jsonb) as custom_quotes,
             c.public_credit_name as contributor_name
      FROM parts p
      LEFT JOIN contributors c ON p.contributor_id = c.id
      WHERE p.active IS NOT false
      ${segment ? sql`AND p.segment = ${segment}` : sql``}
      ${make ? sql`AND EXISTS (SELECT 1 FROM unnest(string_to_array(p.make, ',')) m WHERE trim(m) = ${make})` : sql``}
      ${model ? sql`AND p.model = ${model}` : sql``}
      ${yearNum ? sql`AND p.year_start <= ${yearNum} AND COALESCE(p.year_end, p.year_start) >= ${yearNum}` : sql``}
      ${search ? sql`AND (p.name ILIKE ${"%" + search + "%"} OR p.application ILIKE ${"%" + search + "%"} OR p.make ILIKE ${"%" + search + "%"} OR p.model ILIKE ${"%" + search + "%"})` : sql``}
      ${orderClause}
    `;

    const settingsQuery = sql`SELECT value FROM settings WHERE key = 'estimate_markup_pct'`.catch(() => []);

    const [parts, settingsRows] = await Promise.all([partsQuery, settingsQuery]);
    if (settingsRows.length > 0) markupPct = parseFloat(settingsRows[0].value as string) || 0;

    // Phase 2: variants + files in parallel (need partIds from phase 1)
    const partIds = parts.map((p) => p.id);
    let variants: Record<string, unknown>[] = [];
    let partFilesData: Record<string, unknown>[] = [];
    // customQuotesData removed — custom quotes now stored as jsonb on parts table

    if (partIds.length > 0) {
      [variants, partFilesData] = await Promise.all([
        sql`
          SELECT id, part_id, tier, material, process, base_price,
                 lead_time_days, available, last_quoted_price, last_quoted_at,
                 last_quote_expires_at, last_quote_firm, autoquote_material_code
          FROM part_variants
          WHERE part_id = ANY(${partIds})
          ORDER BY
            CASE tier
              WHEN 'fitment_check' THEN 0
              WHEN 'oem' THEN 1
              WHEN 'improved' THEN 2
              WHEN 'custom' THEN 3
            END
        `,
        sql`
          SELECT id, part_id, file_type, file_name, file_url, thumbnail_url, is_step_file, show_in_catalog, tier
          FROM part_files
          WHERE part_id = ANY(${partIds}) AND (show_in_catalog = true OR is_step_file = true OR file_type = 'stl_preview')
          ORDER BY display_order
        `,
      ]);

    }

    const variantsByPart: Record<string, typeof variants> = {};
    for (const v of variants) {
      const pid = v.part_id as string;
      if (!variantsByPart[pid]) variantsByPart[pid] = [];
      variantsByPart[pid].push(v);
    }

    const filesByPart: Record<string, typeof partFilesData> = {};
    for (const f of partFilesData) {
      const pid = f.part_id as string;
      if (!filesByPart[pid]) filesByPart[pid] = [];
      filesByPart[pid].push(f);
    }

    // Helper to proxy private blob URLs
    const proxyUrl = (url: string | null) =>
      url ? `/api/files?url=${encodeURIComponent(url)}` : null;

    const result = parts.map((p) => {
      const partEstimatePrice = p.last_estimate_price as string | null;

      const pvariants = (variantsByPart[p.id as string] || []).map((v) => {
        const lastQuotedAt = v.last_quoted_at ? new Date(v.last_quoted_at as string) : null;
        const expiresAt = v.last_quote_expires_at ? new Date(v.last_quote_expires_at as string) : null;
        const isStale = isCachedPriceStale(lastQuotedAt);
        const isExpired = expiresAt ? expiresAt <= new Date() : false;
        const hasFreshQuote = !isStale && !isExpired && !!v.last_quoted_price;
        const quotable = !!v.autoquote_material_code;

        const rawPrice = hasFreshQuote
          ? (v.last_quoted_price as string)
          : (v.base_price as string | null) || null;

        // A fresh AutoQuote price (not stale, not expired) is shown as-is.
        // Only base_price fallbacks get the markup buffer.
        const isFromAutoQuote = hasFreshQuote;

        let pricingStatus: PriceStatus;
        if (isFromAutoQuote) pricingStatus = v.last_quote_firm ? "firm" : "estimate";
        else if (rawPrice) pricingStatus = "estimate";
        else if (quotable) pricingStatus = "unavailable";
        else pricingStatus = "unavailable";

        // Markup only on base_price fallbacks, never on actual AutoQuote prices
        const resolvedPrice = rawPrice && !isFromAutoQuote
          ? applyMarkup(rawPrice) : rawPrice;

        const { autoquote_material_code, ...vPublic } = v;
        return {
          ...vPublic,
          resolvedPrice,
          pricingStatus,
          quotable: quotable || undefined,
        };
      });

      // Check for STEP before filtering out CAD URLs
      const hasStep = (filesByPart[p.id as string] || []).some(
        (f) => f.is_step_file || (f.file_type as string) === "cad_step"
      ) || !!(p.cad_file_url);

      const pfiles = (filesByPart[p.id as string] || []).map((f) => {
        // Never expose CAD file URLs to the client — only serve rendered images
        const isCadFile = f.is_step_file || (f.file_type as string).startsWith("cad") || f.file_type === "stl_preview";
        const url = isCadFile ? null : proxyUrl(f.file_url as string | null);
        const thumbUrl = f.thumbnail_url ? proxyUrl(f.thumbnail_url as string) : null;
        return { id: f.id, file_type: f.file_type, file_name: f.file_name, file_url: url, thumbnail_url: thumbUrl, is_step_file: f.is_step_file, show_in_catalog: f.show_in_catalog, tier: f.tier || null };
      }).filter((f) => f.file_url !== null);

      const estimateStale = isCachedPriceStale(
        p.last_estimate_at ? new Date(p.last_estimate_at as string) : null
      );

      return {
        ...p,
        cad_file_url: null,
        variants: pvariants,
        files: pfiles,
        hasStepFile: hasStep,
        estimate: p.last_estimate_price ? {
          price: applyMarkup(p.last_estimate_price as string),
          material: p.last_estimate_material as string | null,
          isStale: estimateStale,
          quotedAt: p.last_estimate_at as string | null,
        } : null,
        customQuotes: (() => {
          const raw = p.custom_quotes;
          if (Array.isArray(raw)) return raw as Array<{ material: string; unitPrice: string; leadTimeDays: number | null; quotedAt: string }>;
          if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
          return [];
        })(),
      };
    });

    return NextResponse.json({ success: true, parts: result }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
