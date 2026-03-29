import Potrace from "potrace";
import type { Point2D } from "@/lib/dxf/types";

interface TraceResult {
  /** Outer contours (the gasket body) */
  outerPaths: Point2D[][];
  /** Inner contours (holes in the gasket) */
  holePaths: Point2D[][];
  /** Raw SVG path data for debugging */
  svgPathData: string;
}

/**
 * Trace a binary image (white foreground on black background) using potrace.
 * Returns extracted contour paths as arrays of points.
 */
export async function traceImage(
  imageBuffer: Buffer,
  options?: { turdSize?: number; alphaMax?: number; optTolerance?: number }
): Promise<TraceResult> {
  const svgPath = await new Promise<string>((resolve, reject) => {
    const tracer = new Potrace.Potrace({
      turdSize: options?.turdSize ?? 5,
      alphaMax: options?.alphaMax ?? 1.0,
      optTolerance: options?.optTolerance ?? 0.2,
      blackOnWhite: true, // potrace traces dark shapes on light background
    });

    tracer.loadImage(imageBuffer, (err: Error | null) => {
      if (err) return reject(err);
      resolve(tracer.getPathTag());
    });
  });

  // Parse the SVG path `d` attribute
  const dMatch = svgPath.match(/d="([^"]+)"/);
  if (!dMatch) {
    return { outerPaths: [], holePaths: [], svgPathData: "" };
  }

  const pathData = dMatch[1];
  const { outerPaths, holePaths } = parseSvgPathData(pathData);

  return { outerPaths, holePaths, svgPathData: pathData };
}

/**
 * Parse SVG path data string into arrays of points.
 *
 * Potrace outputs paths using M (moveto), C (cubic bezier), L (lineto), Z (close).
 * Outer contours are drawn CCW, holes are CW.
 * We flatten bezier curves into line segments.
 */
function parseSvgPathData(d: string): {
  outerPaths: Point2D[][];
  holePaths: Point2D[][];
} {
  const outerPaths: Point2D[][] = [];
  const holePaths: Point2D[][] = [];

  let currentPath: Point2D[] = [];
  let cx = 0;
  let cy = 0;

  // Tokenize the path data
  const tokens = tokenizeSvgPath(d);
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i];

    switch (cmd) {
      case "M":
      case "m": {
        // Start new subpath — finalize previous if exists
        if (currentPath.length >= 3) {
          classifyAndPush(currentPath, outerPaths, holePaths);
        }
        currentPath = [];

        const dx = parseFloat(tokens[++i]);
        const dy = parseFloat(tokens[++i]);
        if (cmd === "m") {
          cx += dx;
          cy += dy;
        } else {
          cx = dx;
          cy = dy;
        }
        currentPath.push({ x: cx, y: cy });
        i++;
        break;
      }

      case "L":
      case "l": {
        const dx = parseFloat(tokens[++i]);
        const dy = parseFloat(tokens[++i]);
        if (cmd === "l") {
          cx += dx;
          cy += dy;
        } else {
          cx = dx;
          cy = dy;
        }
        currentPath.push({ x: cx, y: cy });
        i++;
        break;
      }

      case "C":
      case "c": {
        // Cubic bezier — flatten to line segments
        const x1 = parseFloat(tokens[++i]);
        const y1 = parseFloat(tokens[++i]);
        const x2 = parseFloat(tokens[++i]);
        const y2 = parseFloat(tokens[++i]);
        const x3 = parseFloat(tokens[++i]);
        const y3 = parseFloat(tokens[++i]);

        let bx1: number, by1: number, bx2: number, by2: number, bx3: number, by3: number;
        if (cmd === "c") {
          bx1 = cx + x1; by1 = cy + y1;
          bx2 = cx + x2; by2 = cy + y2;
          bx3 = cx + x3; by3 = cy + y3;
        } else {
          bx1 = x1; by1 = y1;
          bx2 = x2; by2 = y2;
          bx3 = x3; by3 = y3;
        }

        // Sample 8 points along the bezier
        for (let t = 1; t <= 8; t++) {
          const tt = t / 8;
          const pt = cubicBezierPoint(cx, cy, bx1, by1, bx2, by2, bx3, by3, tt);
          currentPath.push(pt);
        }

        cx = bx3;
        cy = by3;
        i++;
        break;
      }

      case "Z":
      case "z": {
        if (currentPath.length >= 3) {
          classifyAndPush(currentPath, outerPaths, holePaths);
        }
        currentPath = [];
        i++;
        break;
      }

      default: {
        // Try to parse as number (implicit lineto after M)
        const val = parseFloat(cmd);
        if (!isNaN(val)) {
          cx = val;
          cy = parseFloat(tokens[++i]);
          currentPath.push({ x: cx, y: cy });
        }
        i++;
        break;
      }
    }
  }

  // Finalize any remaining path
  if (currentPath.length >= 3) {
    classifyAndPush(currentPath, outerPaths, holePaths);
  }

  // Reclassify: all paths were put in outerPaths by classifyAndPush.
  // The largest by absolute area is the outer boundary. Smaller paths = holes.
  if (outerPaths.length > 1) {
    const withArea = outerPaths.map((p) => ({
      path: p,
      area: Math.abs(signedAreaSvg(p)),
    }));
    withArea.sort((a, b) => b.area - a.area);

    const realOuter: Point2D[][] = [withArea[0].path];
    const realHoles: Point2D[][] = [];

    for (let j = 1; j < withArea.length; j++) {
      // Skip tiny noise paths (< 1% of largest)
      if (withArea[j].area < withArea[0].area * 0.005) continue;
      realHoles.push(withArea[j].path);
    }

    return { outerPaths: realOuter, holePaths: realHoles };
  }

  return { outerPaths, holePaths };
}

/**
 * Classify a closed path as outer or hole using signed area (winding direction).
 * Potrace with blackOnWhite=true outputs:
 *   - Outer boundaries as CW paths (negative signed area in standard math coords,
 *     but positive in SVG Y-down coords)
 *   - Holes as CCW paths (opposite sign)
 *
 * We use absolute area and classify later by containment/size.
 * Largest path = outer, smaller paths inside it = holes.
 */
function classifyAndPush(
  path: Point2D[],
  outerPaths: Point2D[][],
  holePaths: Point2D[][]
) {
  // Potrace alternates outer/hole in SVG path order:
  // First subpath = outer boundary, subsequent = holes, then nested outers, etc.
  // We'll collect all paths and classify by area in the caller.
  outerPaths.push(path);
  void holePaths; // classification happens in parseSvgPathData
}

/** Signed area in SVG coordinate space (Y-axis points down) */
function signedAreaSvg(points: Point2D[]): number {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    sum += points[i].x * points[j].y - points[j].x * points[i].y;
  }
  return sum / 2;
}

/** Evaluate a cubic bezier at parameter t */
function cubicBezierPoint(
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  t: number
): Point2D {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;
  return {
    x: mt2 * mt * x0 + 3 * mt2 * t * x1 + 3 * mt * t2 * x2 + t2 * t * x3,
    y: mt2 * mt * y0 + 3 * mt2 * t * y1 + 3 * mt * t2 * y2 + t2 * t * y3,
  };
}

/** Tokenize SVG path data into commands and numbers */
function tokenizeSvgPath(d: string): string[] {
  const tokens: string[] = [];
  const re = /([MmLlCcZz])|(-?\d+\.?\d*(?:e[+-]?\d+)?)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(d)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
}
