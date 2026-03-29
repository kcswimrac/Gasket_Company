import sharp from "sharp";
import type { PaperDetection } from "./types";

/** Known paper dimensions in inches */
const PAPER_WIDTH_IN = 8.5;
const PAPER_HEIGHT_IN = 11.0;
const PAPER_ASPECT = PAPER_WIDTH_IN / PAPER_HEIGHT_IN; // ~0.7727

/**
 * Detect the paper region in a preprocessed grayscale image.
 *
 * Strategy:
 * 1. Threshold to create a binary mask (paper = white, background = black)
 * 2. Use sharp.trim() to find where the white region lives
 * 3. If white fills nearly the whole image, assume paper IS the image
 * 4. Validate aspect ratio against known letter paper dimensions
 */
export async function detectPaper(
  grayscaleBuffer: Buffer,
  imageWidth: number,
  imageHeight: number
): Promise<PaperDetection> {
  const warnings: string[] = [];

  try {
    // Create paper mask: threshold high to isolate white paper
    const paperMask = await sharp(grayscaleBuffer)
      .threshold(190)
      .toBuffer();

    // Count white pixels to determine how much of the image is paper
    const stats = await sharp(paperMask).stats();
    const meanBrightness = stats.channels[0].mean;
    const whiteFraction = meanBrightness / 255;

    let paperLeft = 0;
    let paperTop = 0;
    let paperW = imageWidth;
    let paperH = imageHeight;

    if (whiteFraction > 0.6) {
      // Paper is the dominant element — likely fills most/all of the image
      // Try to find the actual paper edges by trimming the black border
      try {
        const trimInfo = await sharp(paperMask)
          .trim({ threshold: 10 })
          .toBuffer({ resolveWithObject: true });

        const trimMeta = trimInfo.info;
        paperLeft = Math.abs(trimMeta.trimOffsetLeft ?? 0);
        paperTop = Math.abs(trimMeta.trimOffsetTop ?? 0);
        paperW = trimMeta.width;
        paperH = trimMeta.height;
      } catch {
        // trim() can throw if image is uniform — paper is the whole image
        paperLeft = 0;
        paperTop = 0;
        paperW = imageWidth;
        paperH = imageHeight;
      }
    } else if (whiteFraction > 0.15) {
      // Paper is present but doesn't fill the image — find it via trim
      try {
        const trimInfo = await sharp(paperMask)
          .trim({ threshold: 10 })
          .toBuffer({ resolveWithObject: true });

        const trimMeta = trimInfo.info;
        paperLeft = Math.abs(trimMeta.trimOffsetLeft ?? 0);
        paperTop = Math.abs(trimMeta.trimOffsetTop ?? 0);
        paperW = trimMeta.width;
        paperH = trimMeta.height;
      } catch {
        // Fallback
      }
    } else {
      // Very little white — can't find paper
      return {
        found: false,
        paperBounds: {
          left: 0,
          top: 0,
          width: imageWidth,
          height: imageHeight,
        },
        pixelsPerInch: Math.min(imageWidth, imageHeight) / PAPER_WIDTH_IN,
        confidence: 0.15,
        warnings: [
          "Could not detect paper boundaries. Using full image as reference — dimensions may be inaccurate.",
        ],
      };
    }

    // Determine if paper fills the image (common for straight-on photos)
    const areaRatio = (paperW * paperH) / (imageWidth * imageHeight);
    let confidence = 0.85;

    if (areaRatio > 0.95) {
      // Paper IS the image — use full image dimensions
      paperLeft = 0;
      paperTop = 0;
      paperW = imageWidth;
      paperH = imageHeight;
      warnings.push(
        "Paper appears to fill the entire image. For best accuracy, include a small border around the paper."
      );
      confidence = 0.7;
    }

    // Check aspect ratio against letter paper
    const detectedAspect =
      Math.min(paperW, paperH) / Math.max(paperW, paperH);
    const aspectDiff = Math.abs(detectedAspect - PAPER_ASPECT);

    if (aspectDiff > 0.15) {
      warnings.push(
        "Image aspect ratio doesn't closely match 8.5\" x 11\" paper. Accuracy may be reduced."
      );
      confidence -= 0.25;
    } else if (aspectDiff > 0.08) {
      warnings.push(
        "Paper detection is approximate. For best results, ensure all four edges are clearly visible."
      );
      confidence -= 0.1;
    }

    // Calculate pixels per inch — average both dimensions
    let ppi: number;
    if (paperW > paperH) {
      // Landscape
      ppi = (paperW / PAPER_HEIGHT_IN + paperH / PAPER_WIDTH_IN) / 2;
    } else {
      // Portrait
      ppi = (paperW / PAPER_WIDTH_IN + paperH / PAPER_HEIGHT_IN) / 2;
    }

    return {
      found: true,
      paperBounds: {
        left: Math.max(0, paperLeft),
        top: Math.max(0, paperTop),
        width: Math.min(paperW, imageWidth - paperLeft),
        height: Math.min(paperH, imageHeight - paperTop),
      },
      pixelsPerInch: ppi,
      confidence: Math.max(0, confidence),
      warnings,
    };
  } catch {
    return {
      found: false,
      paperBounds: {
        left: 0,
        top: 0,
        width: imageWidth,
        height: imageHeight,
      },
      pixelsPerInch: Math.min(imageWidth, imageHeight) / PAPER_WIDTH_IN,
      confidence: 0.2,
      warnings: [
        "Paper detection failed. Using full image as reference — accuracy may be limited.",
      ],
    };
  }
}

/**
 * Convert pixel coordinates to inches using detected paper scale.
 */
export function pixelsToInches(
  pixelX: number,
  pixelY: number,
  ppi: number
): { x: number; y: number } {
  return {
    x: Math.round((pixelX / ppi) * 1000) / 1000,
    y: Math.round((pixelY / ppi) * 1000) / 1000,
  };
}
