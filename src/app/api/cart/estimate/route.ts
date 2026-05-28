import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/cart/estimate — thin wrapper around /api/cart/quote for
 * backward compatibility. Translates { quote } → { estimate } shape.
 */
export async function POST(request: NextRequest) {
  try {
    const { partId, material, quantity = 1 } = await request.json();

    const quoteRes = await fetch(new URL("/api/cart/quote", request.url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partId, material, quantity }),
    });
    const data = await quoteRes.json();

    if (!data.success) {
      return NextResponse.json(data, { status: quoteRes.status });
    }

    const q = data.quote;
    return NextResponse.json({
      success: true,
      estimate: {
        unitPrice: q.unitPrice,
        totalPrice: q.totalPrice,
        leadTimeDays: q.leadTimeDays,
        material: material || "AL_6061",
        source: q.source,
        message: q.message,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
