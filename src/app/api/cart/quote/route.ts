import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const maxDuration = 60;

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

function getAQConfig() {
  return {
    baseUrl: process.env.AUTOQUOTE_BASE_URL?.replace(/\/$/, ""),
    token: process.env.AUTOQUOTE_BRIDGE_TOKEN,
  };
}

/**
 * POST /api/cart/quote
 * Body: { variantId: string, quantity: number }
 *
 * 1. Look up variant + part from DB
 * 2. Check if cached quote is still valid (GET cheap check)
 * 3. If miss, submit fresh quote to AutoQuote (POST + poll)
 * 4. Cache result on part_variants
 * 5. Return price to client
 */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { variantId, quantity = 1 } = await request.json();

    if (!variantId) {
      return NextResponse.json({ success: false, error: "variantId required" }, { status: 400 });
    }

    // Look up variant
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
    const { baseUrl, token } = getAQConfig();

    // If AutoQuote not configured, return base price with estimate flag
    if (!baseUrl || !token) {
      return NextResponse.json({
        success: true,
        quote: {
          variantId,
          unitPrice: variant.base_price || null,
          totalPrice: variant.base_price ? (parseFloat(variant.base_price as string) * quantity).toFixed(2) : null,
          leadTimeDays: variant.lead_time_days || null,
          isEstimate: true,
          source: "base_price",
          message: "AutoQuote not configured. Showing base price estimate.",
        },
      });
    }

    // Try to validate cached quote first (cheap GET)
    if (variant.last_quote_id) {
      try {
        const cacheRes = await fetch(`${baseUrl}/bridge/quote/${variant.last_quote_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cacheRes.ok) {
          const cached = await cacheRes.json();
          const expiresAt = cached.expires_at ? new Date(cached.expires_at) : null;
          const isValid = cached.status === "OFFERED" && cached.buyable && (!expiresAt || expiresAt > new Date());

          if (isValid) {
            return NextResponse.json({
              success: true,
              quote: {
                variantId,
                quoteId: cached.id,
                unitPrice: cached.unit_price_usd,
                totalPrice: cached.total_price_usd,
                leadTimeDays: cached.lead_time_days,
                confidence: cached.confidence,
                isEstimate: false,
                source: "autoquote_cached",
                expiresAt: cached.expires_at,
              },
            });
          }
        }
      } catch {
        // Cache check failed, fall through to fresh quote
      }
    }

    // No valid cache — try fresh quote if we have a CAD file
    if (!variant.cad_file_url) {
      return NextResponse.json({
        success: true,
        quote: {
          variantId,
          unitPrice: variant.base_price || null,
          totalPrice: variant.base_price ? (parseFloat(variant.base_price as string) * quantity).toFixed(2) : null,
          leadTimeDays: variant.lead_time_days || null,
          isEstimate: true,
          source: "base_price",
          message: "No CAD file attached. Showing base price estimate. Contact us for a firm quote.",
        },
      });
    }

    // Submit fresh quote to AutoQuote
    if (!variant.autoquote_material_code) {
      return NextResponse.json({
        success: true,
        quote: {
          variantId,
          unitPrice: variant.base_price || null,
          totalPrice: variant.base_price ? (parseFloat(variant.base_price as string) * quantity).toFixed(2) : null,
          leadTimeDays: variant.lead_time_days || null,
          isEstimate: true,
          source: "base_price",
          message: "Material not mapped to AutoQuote. Showing base price estimate.",
        },
      });
    }

    try {
      // Fetch the CAD file
      const cadRes = await fetch(variant.cad_file_url as string);
      if (!cadRes.ok) throw new Error("Failed to fetch CAD file");
      const cadBlob = await cadRes.blob();
      const fileName = (variant.cad_file_url as string).split("/").pop() || "part.step";

      // Submit to AutoQuote
      const formData = new FormData();
      formData.append("file", cadBlob, fileName);
      formData.append("material", variant.autoquote_material_code as string);
      formData.append("quantity", String(quantity));
      if (variant.autoquote_process) {
        formData.append("process", variant.autoquote_process as string);
      }

      const submitRes = await fetch(`${baseUrl}/bridge/quote-from-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({ detail: submitRes.statusText }));
        throw new Error(`AutoQuote submit: ${err.detail}`);
      }

      const { quote_id } = await submitRes.json();

      // Poll until terminal
      const deadline = Date.now() + 60_000;
      const terminalStatuses = new Set(["OFFERED", "REJECTED", "NEEDS_REVIEW", "EXPIRED"]);

      while (Date.now() < deadline) {
        const pollRes = await fetch(`${baseUrl}/bridge/quote/${quote_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!pollRes.ok) throw new Error("Poll failed");
        const quote = await pollRes.json();

        if (terminalStatuses.has(quote.status)) {
          // Cache the result
          if (quote.status === "OFFERED" && quote.buyable && quote.unit_price_usd) {
            await sql`
              UPDATE part_variants SET
                last_quoted_price = ${quote.unit_price_usd},
                last_quoted_at = NOW(),
                last_quote_id = ${quote.id},
                last_quote_expires_at = ${quote.expires_at || null}
              WHERE id = ${variantId}
            `;
          }

          // Cache in autoquote_cache table
          await sql`
            INSERT INTO autoquote_cache (variant_id, quote_id, quote_status, unit_price, total_price, lead_time_days, confidence, buyable, dfm_issues, cost_breakdown, routing, material_code, quantity, expires_at, quote_url)
            VALUES (${variantId}, ${quote.id}, ${quote.status.toLowerCase()}, ${quote.unit_price_usd || null}, ${quote.total_price_usd || null}, ${quote.lead_time_days || null}, ${quote.confidence || null}, ${quote.buyable}, ${JSON.stringify(quote.dfm_issues || [])}, ${JSON.stringify(quote.cost_breakdown || {})}, ${JSON.stringify(quote.routing || [])}, ${variant.autoquote_material_code}, ${quantity}, ${quote.expires_at || null}, ${quote.quote_url || null})
          `;

          if (quote.status === "OFFERED" && quote.buyable) {
            return NextResponse.json({
              success: true,
              quote: {
                variantId,
                quoteId: quote.id,
                unitPrice: quote.unit_price_usd,
                totalPrice: quote.total_price_usd,
                leadTimeDays: quote.lead_time_days,
                confidence: quote.confidence,
                isEstimate: false,
                source: "autoquote_live",
                expiresAt: quote.expires_at,
              },
            });
          }

          if (quote.status === "NEEDS_REVIEW" || !quote.buyable) {
            return NextResponse.json({
              success: true,
              quote: {
                variantId,
                unitPrice: variant.base_price || null,
                totalPrice: variant.base_price ? (parseFloat(variant.base_price as string) * quantity).toFixed(2) : null,
                leadTimeDays: null,
                isEstimate: true,
                source: "needs_review",
                message: "This part needs manual review. We'll get back to you within 24 hours with a firm quote.",
              },
            });
          }

          // REJECTED or EXPIRED
          return NextResponse.json({
            success: true,
            quote: {
              variantId,
              unitPrice: null,
              totalPrice: null,
              leadTimeDays: null,
              isEstimate: true,
              source: "rejected",
              message: "Unable to auto-quote this part. Contact us directly for pricing.",
            },
          });
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      // Timeout
      return NextResponse.json({
        success: true,
        quote: {
          variantId,
          unitPrice: variant.base_price || null,
          totalPrice: variant.base_price ? (parseFloat(variant.base_price as string) * quantity).toFixed(2) : null,
          leadTimeDays: variant.lead_time_days || null,
          isEstimate: true,
          source: "timeout",
          message: "Quote is being processed. We'll email you when it's ready.",
        },
      });
    } catch (e) {
      // AutoQuote unreachable — fall back to base price
      return NextResponse.json({
        success: true,
        quote: {
          variantId,
          unitPrice: variant.base_price || null,
          totalPrice: variant.base_price ? (parseFloat(variant.base_price as string) * quantity).toFixed(2) : null,
          leadTimeDays: variant.lead_time_days || null,
          isEstimate: true,
          source: "fallback",
          message: e instanceof Error ? `Pricing service unavailable: ${e.message}` : "Pricing service unavailable. Showing estimate.",
        },
      });
    }
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
