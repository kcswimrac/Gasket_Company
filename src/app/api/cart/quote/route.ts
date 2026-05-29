import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {
  validateCachedQuote,
  quoteAndWait,
  fetchBlob,
  findCadUrl,
  buildQuoteResult,
  type QuoteResult,
} from "@/lib/autoquote/client";

export const runtime = "nodejs";
export const maxDuration = 60;

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function aqConfigured(): boolean {
  return !!(process.env.AUTOQUOTE_BASE_URL && process.env.AUTOQUOTE_BRIDGE_TOKEN);
}

function makeResult(
  overrides: Partial<QuoteResult> & { unitPrice: string | null; priceStatus: QuoteResult["priceStatus"] },
  quantity: number
): QuoteResult {
  return {
    variantId: overrides.variantId ?? null,
    quoteId: overrides.quoteId ?? null,
    unitPrice: overrides.unitPrice,
    totalPrice: overrides.unitPrice
      ? (parseFloat(overrides.unitPrice) * quantity).toFixed(2)
      : null,
    leadTimeDays: overrides.leadTimeDays ?? null,
    priceStatus: overrides.priceStatus,
    source: overrides.source ?? "base_price",
    message: overrides.message,
  };
}

/**
 * POST /api/cart/quote
 * Unified pricing endpoint. Accepts either:
 *   { variantId, quantity }   — quote a specific variant's material
 *   { partId, material?, quantity } — part-level estimate (no variants)
 */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const body = await request.json();
    const { variantId, partId, material, quantity = 1 } = body;

    if (!variantId && !partId) {
      return NextResponse.json({ success: false, error: "variantId or partId required" }, { status: 400 });
    }

    // ── Variant flow ──
    if (variantId) {
      const variants = await sql`
        SELECT pv.*, p.name as part_name, p.cad_file_url
        FROM part_variants pv
        JOIN parts p ON pv.part_id = p.id
        WHERE pv.id = ${variantId}
      `;
      if (variants.length === 0) {
        return NextResponse.json({ success: false, error: "Variant not found" }, { status: 404 });
      }
      const variant = variants[0];

      if (!aqConfigured()) {
        return ok(makeResult({
          variantId, unitPrice: variant.base_price as string | null,
          priceStatus: variant.base_price ? "estimate" : "unavailable",
          leadTimeDays: variant.lead_time_days as number | null,
          message: "AutoQuote not configured. Showing base price estimate.",
        }, quantity));
      }

      // Cheap cache validation
      if (variant.last_quote_id) {
        try {
          const cached = await validateCachedQuote(
            variant.last_quote_id as string,
            variant.autoquote_material_code as string,
            quantity
          );
          if (cached) {
            return ok({
              variantId,
              quoteId: cached.id,
              unitPrice: cached.unit_price_usd,
              totalPrice: cached.total_price_usd,
              leadTimeDays: cached.lead_time_days,
              priceStatus: "firm" as const,
              source: "autoquote_cached",
            });
          }
        } catch { /* fall through */ }
      }

      // Need CAD + material to get a fresh quote
      const cadUrl = await findCadUrl(sql, variant.part_id as string, variant.cad_file_url as string | null);
      if (!cadUrl) {
        return ok(makeResult({
          variantId, unitPrice: variant.base_price as string | null,
          priceStatus: variant.base_price ? "estimate" : "unavailable",
          leadTimeDays: variant.lead_time_days as number | null,
          message: "No CAD file attached. Contact us for a firm quote.",
        }, quantity));
      }
      if (!variant.autoquote_material_code) {
        return ok(makeResult({
          variantId, unitPrice: variant.base_price as string | null,
          priceStatus: variant.base_price ? "estimate" : "unavailable",
          leadTimeDays: variant.lead_time_days as number | null,
          message: "Material not mapped to AutoQuote.",
        }, quantity));
      }

      try {
        const cadBlob = await fetchBlob(cadUrl);
        const fileName = cadUrl.split("/").pop()?.split("?")[0] || "part.step";

        const quote = await quoteAndWait({
          file: cadBlob,
          fileName,
          material: variant.autoquote_material_code as string,
          quantity,
          process: (variant.autoquote_process as string) || undefined,
        });

        const result = buildQuoteResult(quote, {
          variantId,
          quantity,
          fallbackPrice: variant.base_price as string | null,
          fallbackLeadDays: variant.lead_time_days as number | null,
        });

        // Store on variant
        if (result.unitPrice) {
          const isFirm = result.priceStatus === "firm";
          await sql`
            UPDATE part_variants SET
              last_quoted_price = ${result.unitPrice},
              last_quoted_at = NOW(),
              last_quote_id = ${result.quoteId},
              last_quote_expires_at = ${quote.expires_at || null},
              last_quote_firm = ${isFirm}
            WHERE id = ${variantId}
          `;
        }

        // Cache in autoquote_cache
        await sql`
          INSERT INTO autoquote_cache (variant_id, quote_id, quote_status, unit_price, total_price, lead_time_days, confidence, buyable, dfm_issues, cost_breakdown, routing, material_code, quantity, expires_at, quote_url)
          VALUES (${variantId}, ${quote.id}, ${quote.status.toLowerCase()}, ${quote.unit_price_usd || null}, ${quote.total_price_usd || null}, ${quote.lead_time_days || null}, ${quote.confidence || null}, ${quote.buyable}, ${JSON.stringify(quote.dfm_issues || [])}, ${JSON.stringify(quote.cost_breakdown || {})}, ${JSON.stringify(quote.routing || [])}, ${variant.autoquote_material_code}, ${quantity}, ${quote.expires_at || null}, ${quote.quote_url || null})
        `;

        return ok(result);
      } catch (e) {
        return ok(makeResult({
          variantId, unitPrice: variant.base_price as string | null,
          priceStatus: variant.base_price ? "estimate" : "unavailable",
          leadTimeDays: variant.lead_time_days as number | null,
          source: "fallback",
          message: e instanceof Error ? `Pricing service unavailable: ${e.message}` : "Pricing service unavailable.",
        }, quantity));
      }
    }

    // ── Part-level estimate flow (no variant) ──
    const parts = await sql`SELECT id, name, cad_file_url FROM parts WHERE id = ${partId}`;
    if (parts.length === 0) {
      return NextResponse.json({ success: false, error: "Part not found" }, { status: 404 });
    }
    const part = parts[0];
    const materialCode = material || "AL_6061";

    const cadUrl = await findCadUrl(sql, partId, part.cad_file_url as string | null);
    if (!cadUrl) {
      return ok(makeResult({ unitPrice: null, priceStatus: "unavailable", message: "No CAD file attached. Contact us for pricing." }, quantity));
    }
    if (!aqConfigured()) {
      return ok(makeResult({ unitPrice: null, priceStatus: "unavailable", message: "Pricing service not configured. Contact us for a quote." }, quantity));
    }

    try {
      const cadBlob = await fetchBlob(cadUrl);
      const fileName = cadUrl.split("/").pop()?.split("?")[0] || "part.step";

      const quote = await quoteAndWait({
        file: cadBlob,
        fileName,
        material: materialCode,
        quantity,
      });

      const result = buildQuoteResult(quote, {
        variantId: null,
        quantity,
        fallbackPrice: null,
        fallbackLeadDays: null,
      });

      // Store on part for catalog caching
      if (result.unitPrice) {
        await sql`
          UPDATE parts SET
            last_estimate_price = ${result.unitPrice},
            last_estimate_at = NOW(),
            last_estimate_material = ${materialCode},
            updated_at = NOW()
          WHERE id = ${partId}
        `;
      }

      return ok(result);
    } catch (e) {
      return ok(makeResult({
        unitPrice: null, priceStatus: "unavailable", source: "error",
        message: `Pricing unavailable: ${e instanceof Error ? e.message : "unknown error"}`,
      }, quantity));
    }
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function ok(quote: QuoteResult) {
  return NextResponse.json({ success: true, quote });
}
