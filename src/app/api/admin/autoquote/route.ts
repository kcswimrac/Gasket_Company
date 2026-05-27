import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const baseUrl = process.env.AUTOQUOTE_BASE_URL;
  const token = process.env.AUTOQUOTE_BRIDGE_TOKEN;

  if (!baseUrl || !token) {
    return NextResponse.json({
      success: false,
      status: "not_configured",
      error: "AUTOQUOTE_BASE_URL and/or AUTOQUOTE_BRIDGE_TOKEN not set",
      baseUrl: baseUrl ? "set" : "missing",
      token: token ? "set" : "missing",
    });
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/bridge/materials`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        status: "error",
        httpStatus: res.status,
        error: body?.detail || res.statusText,
        baseUrl: baseUrl.substring(0, 40) + "...",
      });
    }

    return NextResponse.json({
      success: true,
      status: "connected",
      httpStatus: res.status,
      materials: body.materials?.length ?? 0,
      rateCardVersion: body.rate_card_version ?? null,
      updatedAt: body.updated_at ?? null,
      materialList: body.materials ?? [],
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      status: "unreachable",
      error: e instanceof Error ? e.message : "Unknown error",
      baseUrl: baseUrl.substring(0, 40) + "...",
    });
  }
}
