import { NextResponse } from "next/server";
import { getMaterials } from "@/lib/autoquote/client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await getMaterials();
    return NextResponse.json({
      success: true,
      materials: data.materials.map((m) => ({
        code: m.code,
        name: m.display_name,
        processes: m.processes,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, materials: [], error: e instanceof Error ? e.message : "Unknown error" },
      { status: 502 }
    );
  }
}
