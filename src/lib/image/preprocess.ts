import sharp from "sharp";

/** Maximum dimension for processing (keeps performance reasonable) */
const MAX_DIMENSION = 3000;

/**
 * Preprocess a photo for gasket detection.
 * Returns a normalized grayscale buffer and image dimensions.
 */
export async function preprocessImage(imageBuffer: Buffer): Promise<{
  grayscale: Buffer;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
}> {
  // Get original dimensions
  const metadata = await sharp(imageBuffer).metadata();
  const originalWidth = metadata.width ?? 0;
  const originalHeight = metadata.height ?? 0;

  if (!originalWidth || !originalHeight) {
    throw new Error("Could not read image dimensions");
  }

  // Resize if needed, maintaining aspect ratio
  let pipeline = sharp(imageBuffer).rotate(); // auto-rotate based on EXIF

  if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
    pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to grayscale, normalize contrast
  const processed = await pipeline.grayscale().normalise().png().toBuffer();

  const processedMeta = await sharp(processed).metadata();

  return {
    grayscale: processed,
    width: processedMeta.width ?? originalWidth,
    height: processedMeta.height ?? originalHeight,
    originalWidth,
    originalHeight,
  };
}

/**
 * Create a high-contrast binary image for paper detection.
 * Paper is near-white, so threshold high to isolate it.
 */
export async function createPaperMask(
  grayscaleBuffer: Buffer
): Promise<Buffer> {
  return sharp(grayscaleBuffer)
    .threshold(200)
    .png()
    .toBuffer();
}

/**
 * Create a binary image isolating the dark gasket on white paper.
 * After cropping to paper region, threshold to find dark shapes.
 */
export async function createGasketMask(
  grayscaleBuffer: Buffer,
  cropRegion: { left: number; top: number; width: number; height: number }
): Promise<{ buffer: Buffer; width: number; height: number }> {
  // Crop to paper region
  const cropped = await sharp(grayscaleBuffer)
    .extract(cropRegion)
    .toBuffer();

  // Apply blur to reduce noise, then threshold
  // Result: dark gasket = black, white paper = white
  // This is what potrace expects with blackOnWhite: true
  const mask = await sharp(cropped)
    .blur(1.5)
    .threshold(128)
    .png()
    .toBuffer();

  return { buffer: mask, width: cropRegion.width, height: cropRegion.height };
}
