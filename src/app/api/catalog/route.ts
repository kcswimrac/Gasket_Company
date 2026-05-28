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

    let parts;
    if (segment && search) {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions, p.cad_file_url, p.last_estimate_price, p.last_estimate_at, p.last_estimate_material,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active IS NOT false AND p.segment = ${segment}
        AND (p.name ILIKE ${"%" + search + "%"} OR p.application ILIKE ${"%" + search + "%"} OR p.make ILIKE ${"%" + search + "%"} OR p.model ILIKE ${"%" + search + "%"})
        ORDER BY p.name
      `;
    } else if (segment) {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions, p.cad_file_url, p.last_estimate_price, p.last_estimate_at, p.last_estimate_material,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active IS NOT false AND p.segment = ${segment}
        ORDER BY p.name
      `;
    } else if (search) {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions, p.cad_file_url, p.last_estimate_price, p.last_estimate_at, p.last_estimate_material,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active IS NOT false
        AND (p.name ILIKE ${"%" + search + "%"} OR p.application ILIKE ${"%" + search + "%"} OR p.make ILIKE ${"%" + search + "%"} OR p.model ILIKE ${"%" + search + "%"})
        ORDER BY p.name
      `;
    } else {
      parts = await sql`
        SELECT p.id, p.name, p.segment, p.make, p.model, p.year_start, p.year_end,
               p.application, p.description, p.fitment_status, p.dimensions, p.cad_file_url, p.last_estimate_price, p.last_estimate_at, p.last_estimate_material,
               c.public_credit_name as contributor_name
        FROM parts p
        LEFT JOIN contributors c ON p.contributor_id = c.id
        WHERE p.active IS NOT false
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
               last_quote_expires_at, autoquote_material_code
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

    // Fetch catalog-visible files (photos) + STEP files (for 3D viewer + quoting)
    let partFilesData: Record<string, unknown>[] = [];
    if (partIds.length > 0) {
      partFilesData = await sql`
        SELECT id, part_id, file_type, file_name, file_url, thumbnail_url, is_step_file, show_in_catalog, tier
        FROM part_files
        WHERE part_id = ANY(${partIds}) AND (show_in_catalog = true OR is_step_file = true OR file_type = 'stl_preview')
        ORDER BY display_order
      `;
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

        // Resolve price through the fallback chain once, server-side
        const resolvedPrice = hasFreshQuote
          ? (v.last_quoted_price as string)
          : (v.base_price as string | null) || partEstimatePrice || null;

        let pricingStatus: PriceStatus;
        if (hasFreshQuote) pricingStatus = "firm";
        else if (resolvedPrice) pricingStatus = "estimate";
        else if (quotable) pricingStatus = "unavailable";
        else pricingStatus = "unavailable";

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
          price: p.last_estimate_price as string,
          material: p.last_estimate_material as string | null,
          isStale: estimateStale,
          quotedAt: p.last_estimate_at as string | null,
        } : null,
      };
    });

    return NextResponse.json({ success: true, parts: result });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
