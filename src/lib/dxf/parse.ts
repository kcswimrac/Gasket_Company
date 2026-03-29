import DxfParser from "dxf-parser";
import type { IEntity } from "dxf-parser";
import type { ILwpolylineEntity } from "dxf-parser/dist/entities/lwpolyline";
import type { ICircleEntity } from "dxf-parser/dist/entities/circle";
import type { IArcEntity } from "dxf-parser/dist/entities/arc";
import type { ILineEntity } from "dxf-parser/dist/entities/line";
import type { IEllipseEntity } from "dxf-parser/dist/entities/ellipse";
import type { Point2D, GasketGeometry } from "./types";
import {
  expandLwpolyline,
  circleToPoints,
  arcToPoints,
  dist,
  polylinePerimeter,
  classifyPaths,
} from "./geometry";

interface RawPath {
  points: Point2D[];
  perimeter: number;
}

/**
 * Parse a DXF file string and extract gasket geometry.
 * Handles LWPOLYLINE, CIRCLE, ARC, LINE, and ELLIPSE entities.
 */
export function parseDxf(dxfContent: string): GasketGeometry {
  const parser = new DxfParser();
  const dxf = parser.parseSync(dxfContent);

  if (!dxf || !dxf.entities || dxf.entities.length === 0) {
    throw new Error("No entities found in DXF file");
  }

  const closedPaths: RawPath[] = [];
  const openSegments: Array<{ start: Point2D; end: Point2D; length: number }> =
    [];
  let entityCount = 0;

  for (const entity of dxf.entities) {
    entityCount++;

    switch (entity.type) {
      case "LWPOLYLINE": {
        const lw = entity as ILwpolylineEntity;
        if (!lw.vertices || lw.vertices.length < 2) break;

        const verts = lw.vertices.map((v) => ({
          x: v.x,
          y: v.y,
          bulge: v.bulge ?? 0,
        }));

        const { points, totalLength } = expandLwpolyline(verts, lw.shape);

        if (lw.shape && points.length >= 3) {
          closedPaths.push({ points, perimeter: totalLength });
        } else if (points.length >= 2) {
          // Open polyline — check if endpoints meet (auto-close)
          if (dist(points[0], points[points.length - 1]) < 0.01) {
            closedPaths.push({ points, perimeter: totalLength });
          } else {
            openSegments.push({
              start: points[0],
              end: points[points.length - 1],
              length: totalLength,
            });
          }
        }
        break;
      }

      case "CIRCLE": {
        const c = entity as ICircleEntity;
        if (!c.center || !c.radius) break;
        const pts = circleToPoints(c.center.x, c.center.y, c.radius);
        const perim = 2 * Math.PI * c.radius;
        closedPaths.push({ points: pts, perimeter: perim });
        break;
      }

      case "ARC": {
        const a = entity as IArcEntity;
        if (!a.center || !a.radius) break;
        const { points, arcLength } = arcToPoints(
          a.center.x,
          a.center.y,
          a.radius,
          a.startAngle,
          a.endAngle
        );
        if (points.length >= 2) {
          openSegments.push({
            start: points[0],
            end: points[points.length - 1],
            length: arcLength,
          });
        }
        break;
      }

      case "LINE": {
        const l = entity as ILineEntity;
        if (!l.vertices || l.vertices.length < 2) break;
        const p1: Point2D = { x: l.vertices[0].x, y: l.vertices[0].y };
        const p2: Point2D = { x: l.vertices[1].x, y: l.vertices[1].y };
        openSegments.push({
          start: p1,
          end: p2,
          length: dist(p1, p2),
        });
        break;
      }

      case "ELLIPSE": {
        const e = entity as IEllipseEntity;
        if (!e.center || !e.majorAxisEndPoint) break;
        // Full ellipse (startAngle=0, endAngle=2*PI or close)
        const a =
          Math.sqrt(e.majorAxisEndPoint.x ** 2 + e.majorAxisEndPoint.y ** 2);
        const b = a * (e.axisRatio || 1);
        const isFull =
          Math.abs(e.endAngle - e.startAngle) > 6.2 ||
          (e.startAngle === 0 && Math.abs(e.endAngle - 2 * Math.PI) < 0.01);

        if (isFull) {
          // Generate points for full ellipse
          const pts: Point2D[] = [];
          const majorAngle = Math.atan2(
            e.majorAxisEndPoint.y,
            e.majorAxisEndPoint.x
          );
          for (let i = 0; i < 64; i++) {
            const t = (2 * Math.PI * i) / 64;
            const px = a * Math.cos(t);
            const py = b * Math.sin(t);
            // Rotate by major axis angle
            pts.push({
              x:
                e.center.x +
                px * Math.cos(majorAngle) -
                py * Math.sin(majorAngle),
              y:
                e.center.y +
                px * Math.sin(majorAngle) +
                py * Math.cos(majorAngle),
            });
          }
          // Ramanujan approximation for perimeter
          const perim =
            Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
          closedPaths.push({ points: pts, perimeter: perim });
        }
        break;
      }
    }
  }

  // Attempt to chain open segments into closed paths
  const chained = chainSegments(openSegments);
  closedPaths.push(...chained);

  // Classify paths into outer vs holes
  const geometry = classifyPaths(closedPaths);
  geometry.entityCount = entityCount;

  return geometry;
}

/**
 * Attempt to chain individual line/arc segments into closed paths.
 * Uses endpoint proximity matching with a tolerance of 0.01 units.
 */
function chainSegments(
  segments: Array<{ start: Point2D; end: Point2D; length: number }>
): RawPath[] {
  if (segments.length === 0) return [];

  const TOLERANCE = 0.01;
  const used = new Set<number>();
  const chains: RawPath[] = [];

  for (let i = 0; i < segments.length; i++) {
    if (used.has(i)) continue;

    const chain: Point2D[] = [segments[i].start, segments[i].end];
    let totalLen = segments[i].length;
    used.add(i);

    let extended = true;
    while (extended) {
      extended = false;
      const chainEnd = chain[chain.length - 1];

      for (let j = 0; j < segments.length; j++) {
        if (used.has(j)) continue;

        if (dist(chainEnd, segments[j].start) < TOLERANCE) {
          chain.push(segments[j].end);
          totalLen += segments[j].length;
          used.add(j);
          extended = true;
          break;
        }

        if (dist(chainEnd, segments[j].end) < TOLERANCE) {
          chain.push(segments[j].start);
          totalLen += segments[j].length;
          used.add(j);
          extended = true;
          break;
        }
      }
    }

    // Check if chain forms a closed path
    if (chain.length >= 3 && dist(chain[0], chain[chain.length - 1]) < TOLERANCE) {
      chains.push({ points: chain, perimeter: totalLen });
    }
  }

  return chains;
}
