import type { Point2D, ClosedPath, BoundingBox, GasketGeometry } from "./types";

/**
 * Shoelace formula for polygon area.
 * Returns signed area: positive = CCW (outer), negative = CW (hole).
 */
export function signedArea(points: Point2D[]): number {
  const n = points.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return sum / 2;
}

/** Euclidean distance between two points */
export function dist(a: Point2D, b: Point2D): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/** Perimeter of a polygon defined by ordered points */
export function polylinePerimeter(points: Point2D[], closed: boolean): number {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += dist(points[i], points[i + 1]);
  }
  if (closed && points.length > 1) {
    total += dist(points[points.length - 1], points[0]);
  }
  return total;
}

/**
 * Interpolate an arc segment defined by LWPOLYLINE bulge between two vertices.
 * Bulge = tan(included_angle / 4). Positive = CCW arc, negative = CW arc.
 * Returns intermediate points along the arc (excludes start, includes end).
 */
export function interpolateBulgeArc(
  p1: Point2D,
  p2: Point2D,
  bulge: number,
  segments: number = 16
): { points: Point2D[]; arcLength: number } {
  const d = dist(p1, p2);
  if (d < 1e-10 || Math.abs(bulge) < 1e-10) {
    return { points: [p2], arcLength: d };
  }

  const theta = 4 * Math.atan(Math.abs(bulge));
  const r = (d * (1 + bulge * bulge)) / (4 * Math.abs(bulge));

  // Midpoint of chord
  const mx = (p1.x + p2.x) / 2;
  const my = (p1.y + p2.y) / 2;

  // Unit vector along chord
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  // Normal to chord (pointing toward arc center)
  const sign = bulge > 0 ? 1 : -1;
  const nx = -dy / d * sign;
  const ny = dx / d * sign;

  // Distance from chord midpoint to center
  const h = r * Math.cos(theta / 2);
  const cx = mx + nx * h;
  const cy = my + ny * h;

  // Start angle from center to p1
  const startAngle = Math.atan2(p1.y - cy, p1.x - cx);

  // Generate points along the arc
  const result: Point2D[] = [];
  const angleStep = (bulge > 0 ? theta : -theta) / segments;

  for (let i = 1; i <= segments; i++) {
    const angle = startAngle + angleStep * i;
    result.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }

  const arcLength = r * theta;
  return { points: result, arcLength };
}

/**
 * Convert LWPOLYLINE vertices (with potential bulge values) into
 * a flat list of Point2D for area/perimeter calculation.
 * Also returns the total path length accounting for arcs.
 */
export function expandLwpolyline(
  vertices: Array<{ x: number; y: number; bulge?: number }>,
  closed: boolean
): { points: Point2D[]; totalLength: number } {
  const expanded: Point2D[] = [];
  let totalLength = 0;
  const count = closed ? vertices.length : vertices.length - 1;

  for (let i = 0; i < count; i++) {
    const v1 = vertices[i];
    const v2 = vertices[(i + 1) % vertices.length];
    const bulge = v1.bulge ?? 0;

    if (i === 0) {
      expanded.push({ x: v1.x, y: v1.y });
    }

    if (Math.abs(bulge) > 1e-10) {
      const { points, arcLength } = interpolateBulgeArc(
        { x: v1.x, y: v1.y },
        { x: v2.x, y: v2.y },
        bulge
      );
      expanded.push(...points);
      totalLength += arcLength;
    } else {
      expanded.push({ x: v2.x, y: v2.y });
      totalLength += dist(
        { x: v1.x, y: v1.y },
        { x: v2.x, y: v2.y }
      );
    }
  }

  return { points: expanded, totalLength };
}

/** Generate points along a full circle */
export function circleToPoints(
  cx: number,
  cy: number,
  r: number,
  segments: number = 64
): Point2D[] {
  const points: Point2D[] = [];
  for (let i = 0; i < segments; i++) {
    const angle = (2 * Math.PI * i) / segments;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }
  return points;
}

/** Generate points along an arc (partial circle) */
export function arcToPoints(
  cx: number,
  cy: number,
  r: number,
  startAngleDeg: number,
  endAngleDeg: number,
  segments: number = 32
): { points: Point2D[]; arcLength: number } {
  let startRad = (startAngleDeg * Math.PI) / 180;
  let endRad = (endAngleDeg * Math.PI) / 180;

  // Ensure positive sweep
  if (endRad <= startRad) endRad += 2 * Math.PI;
  const sweep = endRad - startRad;

  const points: Point2D[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = startRad + (sweep * i) / segments;
    points.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    });
  }

  return { points, arcLength: r * sweep };
}

/** Compute bounding box from a set of points */
export function computeBoundingBox(points: Point2D[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

/** Check if a bounding box is inside another bounding box */
function isInsideBBox(inner: BoundingBox, outer: BoundingBox): boolean {
  return (
    inner.minX >= outer.minX - 0.01 &&
    inner.minY >= outer.minY - 0.01 &&
    inner.maxX <= outer.maxX + 0.01 &&
    inner.maxY <= outer.maxY + 0.01
  );
}

/**
 * Classify closed paths into outer boundaries and holes.
 * The largest path is the outer boundary. Smaller paths whose
 * bounding boxes fall inside the outer path are holes.
 */
export function classifyPaths(
  paths: Array<{ points: Point2D[]; perimeter: number }>
): GasketGeometry {
  if (paths.length === 0) {
    return {
      outerPaths: [],
      holePaths: [],
      totalArea: 0,
      totalCutLength: 0,
      boundingBox: { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 },
      holeCount: 0,
      closedPathCount: 0,
      entityCount: 0,
    };
  }

  // Compute areas and bboxes
  const analyzed = paths.map((p) => {
    const area = Math.abs(signedArea(p.points));
    const bbox = computeBoundingBox(p.points);
    return { ...p, area, bbox };
  });

  // Sort by area descending — largest is outer boundary
  analyzed.sort((a, b) => b.area - a.area);

  const outerPaths: ClosedPath[] = [];
  const holePaths: ClosedPath[] = [];
  let totalCutLength = 0;

  // The largest path is always an outer boundary
  const outer = analyzed[0];
  outerPaths.push({
    points: outer.points,
    area: outer.area,
    perimeter: outer.perimeter,
    isHole: false,
  });
  totalCutLength += outer.perimeter;

  // Classify remaining paths
  for (let i = 1; i < analyzed.length; i++) {
    const p = analyzed[i];
    totalCutLength += p.perimeter;

    if (isInsideBBox(p.bbox, outer.bbox)) {
      holePaths.push({
        points: p.points,
        area: p.area,
        perimeter: p.perimeter,
        isHole: true,
      });
    } else {
      outerPaths.push({
        points: p.points,
        area: p.area,
        perimeter: p.perimeter,
        isHole: false,
      });
    }
  }

  const outerArea = outerPaths.reduce((s, p) => s + p.area, 0);
  const holeArea = holePaths.reduce((s, p) => s + p.area, 0);

  // Collect all points for overall bounding box
  const allPoints = paths.flatMap((p) => p.points);

  return {
    outerPaths,
    holePaths,
    totalArea: outerArea - holeArea,
    totalCutLength,
    boundingBox: computeBoundingBox(allPoints),
    holeCount: holePaths.length,
    closedPathCount: outerPaths.length + holePaths.length,
    entityCount: 0, // set by caller
  };
}
