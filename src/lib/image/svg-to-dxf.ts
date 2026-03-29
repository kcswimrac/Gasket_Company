import type { Point2D } from "@/lib/dxf/types";

/**
 * Generate a DXF file string from extracted contour paths.
 * Each path becomes a closed LWPOLYLINE entity.
 *
 * Uses manual DXF generation (not dxf-writer) for full control
 * over the output format and to avoid async/callback issues.
 */
export function contoursToDxf(
  outerPaths: Point2D[][],
  holePaths: Point2D[][]
): string {
  const lines: string[] = [];

  // Header section
  lines.push("0", "SECTION", "2", "HEADER");
  lines.push("9", "$ACADVER", "1", "AC1015"); // AutoCAD 2000
  lines.push("9", "$INSUNITS", "70", "1"); // Inches
  lines.push("0", "ENDSEC");

  // Tables section (minimal — layers)
  lines.push("0", "SECTION", "2", "TABLES");
  lines.push("0", "TABLE", "2", "LAYER", "70", "2");

  // Outer layer
  lines.push("0", "LAYER", "2", "OUTER", "70", "0", "62", "7", "6", "CONTINUOUS");
  // Holes layer
  lines.push("0", "LAYER", "2", "HOLES", "70", "0", "62", "1", "6", "CONTINUOUS");

  lines.push("0", "ENDTAB");
  lines.push("0", "ENDSEC");

  // Entities section
  lines.push("0", "SECTION", "2", "ENTITIES");

  let handleCounter = 100;

  // Write outer contours
  for (const path of outerPaths) {
    if (path.length < 3) continue;
    handleCounter++;
    writeLwpolyline(lines, path, "OUTER", handleCounter);
  }

  // Write hole contours
  for (const path of holePaths) {
    if (path.length < 3) continue;
    handleCounter++;
    writeLwpolyline(lines, path, "HOLES", handleCounter);
  }

  lines.push("0", "ENDSEC");

  // EOF
  lines.push("0", "EOF");

  return lines.join("\n");
}

function writeLwpolyline(
  lines: string[],
  points: Point2D[],
  layer: string,
  handle: number
) {
  lines.push("0", "LWPOLYLINE");
  lines.push("5", handle.toString(16).toUpperCase()); // Handle
  lines.push("8", layer); // Layer
  lines.push("90", String(points.length)); // Number of vertices
  lines.push("70", "1"); // Closed polyline flag

  for (const pt of points) {
    lines.push("10", pt.x.toFixed(6)); // X
    lines.push("20", pt.y.toFixed(6)); // Y
  }
}
