import { NextRequest, NextResponse } from "next/server";
import { parseDxf } from "@/lib/dxf/parse";
import { calculateQuote } from "@/lib/pricing/engine";
import { quoteParamsSchema, MAX_DXF_SIZE } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract file
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No DXF file provided" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_DXF_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate params
    const rawParams = {
      material: formData.get("material"),
      thickness: formData.get("thickness"),
      quantity: formData.get("quantity"),
      rush: formData.get("rush"),
    };

    const parseResult = quoteParamsSchema.safeParse(rawParams);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const params = parseResult.data;

    // Read DXF content
    const dxfContent = await file.text();

    // Parse geometry
    let geometry;
    try {
      geometry = parseDxf(dxfContent);
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to parse DXF file",
          details: e instanceof Error ? e.message : "Unknown parse error",
        },
        { status: 400 }
      );
    }

    // Validate geometry has usable paths
    if (geometry.closedPathCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No closed paths found in DXF. The file must contain at least one closed shape (polyline, circle, or connected segments).",
        },
        { status: 400 }
      );
    }

    // Calculate quote
    const quote = calculateQuote(
      geometry,
      params.material,
      params.thickness,
      params.quantity,
      params.rush
    );

    return NextResponse.json({ success: true, quote });
  } catch (e) {
    console.error("Quote API error:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: e instanceof Error ? e.message : undefined,
      },
      { status: 500 }
    );
  }
}
