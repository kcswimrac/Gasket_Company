import { NextRequest, NextResponse } from "next/server";
import { processPhoto } from "@/lib/image/pipeline";
import { parseDxf } from "@/lib/dxf/parse";
import { calculateQuote } from "@/lib/pricing/engine";
import { quoteParamsSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for image processing

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract file
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Image exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Validate image type
    const fileName = file instanceof File ? file.name : "upload";
    const ext = fileName.toLowerCase().split(".").pop();
    if (!["jpg", "jpeg", "png", "webp"].includes(ext || "")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported image format. Use JPG, PNG, or WebP.",
        },
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

    // Read image as buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Run photo-to-DXF pipeline
    let pipelineResult;
    try {
      pipelineResult = await processPhoto(imageBuffer);
    } catch (e) {
      return NextResponse.json(
        {
          success: false,
          error: "Image processing failed",
          details: e instanceof Error ? e.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    // Parse the generated DXF to extract geometry for pricing
    let geometry;
    try {
      geometry = parseDxf(pipelineResult.dxfContent);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not extract geometry from traced image. Try a clearer photo with better contrast.",
        },
        { status: 400 }
      );
    }

    if (geometry.closedPathCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No closed shapes found in the traced image. Ensure the gasket is dark on white paper.",
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

    // Encode DXF as base64 for download
    const dxfBase64 = Buffer.from(pipelineResult.dxfContent).toString("base64");

    return NextResponse.json({
      success: true,
      quote,
      dxfBase64,
      confidence: pipelineResult.confidence,
      warnings: pipelineResult.warnings,
    });
  } catch (e) {
    console.error("Photo-to-DXF API error:", e);
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
