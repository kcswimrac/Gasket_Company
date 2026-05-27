import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";
export const maxDuration = 60;

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return neon(url);
}

/**
 * POST /api/cart/estimate
 * Get an estimate for a part that has a STEP file but no variants yet.
 * Submits the STEP file to AutoQuote with a default material.
 * Stores the result on the part for future display.
 */
export async function POST(request: NextRequest) {
  try {
    const sql = getSQL();
    const { partId, material, quantity = 1 } = await request.json();

    if (!partId) {
      return NextResponse.json({ success: false, error: "partId required" }, { status: 400 });
    }

    const parts = await sql`SELECT id, name, cad_file_url FROM parts WHERE id = ${partId}`;
    if (parts.length === 0) {
      return NextResponse.json({ success: false, error: "Part not found" }, { status: 404 });
    }

    const part = parts[0];

    // Find CAD file URL — check parts.cad_file_url first, then part_files
    let cadUrl = part.cad_file_url as string | null;
    if (!cadUrl) {
      const cadFiles = await sql`
        SELECT file_url FROM part_files
        WHERE part_id = ${partId} AND (is_step_file = true OR file_type = 'cad_step')
        ORDER BY uploaded_at DESC LIMIT 1
      `;
      if (cadFiles.length > 0) cadUrl = cadFiles[0].file_url as string;
    }

    if (!cadUrl) {
      return NextResponse.json({
        success: true,
        estimate: { unitPrice: null, message: "No CAD file attached. Contact us for pricing." },
      });
    }

    const baseUrl = process.env.AUTOQUOTE_BASE_URL?.replace(/\/$/, "");
    const token = process.env.AUTOQUOTE_BRIDGE_TOKEN;

    if (!baseUrl || !token) {
      return NextResponse.json({
        success: true,
        estimate: { unitPrice: null, message: "Pricing service not configured. Contact us for a quote." },
      });
    }

    // Use AL_6061 as default material if none specified
    const materialCode = material || "AL_6061";

    try {
      // Fetch the CAD file
      const cadRes = await fetch(cadUrl);
      if (!cadRes.ok) throw new Error("Failed to fetch CAD file");
      const cadBlob = await cadRes.blob();
      const fileName = (cadUrl).split("/").pop() || "part.step";

      const formData = new FormData();
      formData.append("file", cadBlob, fileName);
      formData.append("material", materialCode);
      formData.append("quantity", String(quantity));

      const submitRes = await fetch(`${baseUrl}/bridge/quote-from-file`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({ detail: submitRes.statusText }));
        throw new Error(err.detail);
      }

      const { quote_id } = await submitRes.json();

      // Poll
      const deadline = Date.now() + 60_000;
      const terminal = new Set(["OFFERED", "REJECTED", "NEEDS_REVIEW", "EXPIRED"]);

      while (Date.now() < deadline) {
        const pollRes = await fetch(`${baseUrl}/bridge/quote/${quote_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!pollRes.ok) throw new Error("Poll failed");
        const quote = await pollRes.json();

        if (terminal.has(quote.status)) {
          if (quote.status === "OFFERED" && quote.buyable && quote.unit_price_usd) {
            return NextResponse.json({
              success: true,
              estimate: {
                unitPrice: quote.unit_price_usd,
                totalPrice: quote.total_price_usd,
                leadTimeDays: quote.lead_time_days,
                material: materialCode,
                source: "autoquote",
              },
            });
          }

          return NextResponse.json({
            success: true,
            estimate: {
              unitPrice: null,
              message: quote.status === "NEEDS_REVIEW"
                ? "This part needs manual review. We'll follow up within 24 hours."
                : "Unable to auto-quote. Contact us for pricing.",
              source: "needs_review",
            },
          });
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      return NextResponse.json({
        success: true,
        estimate: { unitPrice: null, message: "Quote is processing. We'll email you when ready.", source: "timeout" },
      });
    } catch (e) {
      return NextResponse.json({
        success: true,
        estimate: {
          unitPrice: null,
          message: `Pricing unavailable: ${e instanceof Error ? e.message : "unknown error"}`,
          source: "error",
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
