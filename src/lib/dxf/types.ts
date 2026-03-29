/** 2D point for geometry calculations */
export interface Point2D {
  x: number;
  y: number;
}

/** A single closed path extracted from a DXF (outer boundary or internal cutout) */
export interface ClosedPath {
  points: Point2D[];
  area: number;          // sq inches (positive = outer, uses absolute value)
  perimeter: number;     // linear inches
  isHole: boolean;
}

/** Bounding box of the gasket */
export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

/** Complete geometry extraction result from a DXF file */
export interface GasketGeometry {
  outerPaths: ClosedPath[];
  holePaths: ClosedPath[];
  totalArea: number;         // net area in sq inches (outer minus holes)
  totalCutLength: number;    // sum of all path perimeters in linear inches
  boundingBox: BoundingBox;
  holeCount: number;
  closedPathCount: number;
  entityCount: number;
}
