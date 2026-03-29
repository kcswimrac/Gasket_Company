import type { Point2D } from "@/lib/dxf/types";
import type { PhotoPipelineResult, TracedContour } from "./types";
import { preprocessImage, createGasketMask } from "./preprocess";
import { detectPaper, pixelsToInches } from "./scale";
import { traceImage } from "./trace";
import { contoursToDxf } from "./svg-to-dxf";

/**
 * Full photo-to-DXF pipeline.
 *
 * 1. Preprocess image (resize, grayscale, normalize)
 * 2. Detect paper boundaries and calculate scale (pixels → inches)
 * 3. Crop to paper region, threshold to isolate gasket
 * 4. Trace gasket outline with potrace
 * 5. Scale traced paths from pixels to inches
 * 6. Generate DXF file from scaled contours
 */
export async function processPhoto(
  imageBuffer: Buffer
): Promise<PhotoPipelineResult> {
  const warnings: string[] = [];

  // 1. Preprocess
  const { grayscale, width, height } = await preprocessImage(imageBuffer);

  // 2. Detect paper
  const paper = await detectPaper(grayscale, width, height);
  warnings.push(...paper.warnings);

  // 3. Create gasket mask (crop to paper, threshold, invert)
  const { buffer: gasketMask } = await createGasketMask(
    grayscale,
    paper.paperBounds
  );

  // 4. Trace with potrace
  const traceResult = await traceImage(gasketMask, {
    turdSize: 8,       // ignore small speckles
    alphaMax: 1.0,     // smooth corners
    optTolerance: 0.3, // slight curve optimization
  });

  if (traceResult.outerPaths.length === 0) {
    throw new Error(
      "No gasket shape detected. Ensure the gasket is dark on white paper with good contrast."
    );
  }

  // 5. Scale pixel coordinates to real-world inches
  const ppi = paper.pixelsPerInch;
  const contours: TracedContour[] = [];

  const scaledOuterPaths: Point2D[][] = [];
  const scaledHolePaths: Point2D[][] = [];

  for (const path of traceResult.outerPaths) {
    const inchPts = path.map((p) => pixelsToInches(p.x, p.y, ppi));
    scaledOuterPaths.push(inchPts);
    contours.push({
      pixelPoints: path,
      inchPoints: inchPts,
      isHole: false,
    });
  }

  for (const path of traceResult.holePaths) {
    const inchPts = path.map((p) => pixelsToInches(p.x, p.y, ppi));
    scaledHolePaths.push(inchPts);
    contours.push({
      pixelPoints: path,
      inchPoints: inchPts,
      isHole: true,
    });
  }

  // 6. Generate DXF
  const dxfContent = contoursToDxf(scaledOuterPaths, scaledHolePaths);

  // Sanity checks for confidence
  let confidence = paper.confidence;

  // Check gasket is a reasonable size relative to paper
  const outerAreas = scaledOuterPaths.map((p) => Math.abs(polygonArea(p)));
  const maxArea = Math.max(...outerAreas, 0);
  const paperAreaInches = 8.5 * 11;

  if (maxArea < 0.5) {
    warnings.push("Detected shape is very small. Ensure the gasket is clearly visible.");
    confidence *= 0.5;
  } else if (maxArea > paperAreaInches * 0.85) {
    warnings.push("Detected shape is nearly the size of the paper. Check that the image shows a gasket, not just the paper.");
    confidence *= 0.6;
  }

  if (traceResult.outerPaths.length > 5) {
    warnings.push("Multiple separate shapes detected. Only the largest will be used for quoting.");
    confidence *= 0.8;
  }

  return {
    dxfContent,
    contours,
    paper,
    confidence: Math.max(0, Math.min(1, confidence)),
    warnings,
  };
}

/** Simple polygon area (shoelace formula) */
function polygonArea(points: Point2D[]): number {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return sum / 2;
}
