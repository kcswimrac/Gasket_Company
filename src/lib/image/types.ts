import type { Point2D } from "@/lib/dxf/types";

/** Result of paper detection from the photo */
export interface PaperDetection {
  found: boolean;
  /** Bounding box of detected paper region in pixels */
  paperBounds: { left: number; top: number; width: number; height: number };
  /** Calculated pixels per inch from paper dimensions */
  pixelsPerInch: number;
  /** Confidence in detection (0-1) */
  confidence: number;
  warnings: string[];
}

/** A single contour extracted from the traced image */
export interface TracedContour {
  /** Points in pixel coordinates */
  pixelPoints: Point2D[];
  /** Points scaled to inches using paper reference */
  inchPoints: Point2D[];
  /** Whether this is a hole (inner contour) */
  isHole: boolean;
}

/** Complete result from the photo-to-DXF pipeline */
export interface PhotoPipelineResult {
  /** Generated DXF file content as string */
  dxfContent: string;
  /** Traced contours with real-world dimensions */
  contours: TracedContour[];
  /** Paper detection info */
  paper: PaperDetection;
  /** Overall confidence score (0-1) */
  confidence: number;
  /** Warnings for the user */
  warnings: string[];
}
