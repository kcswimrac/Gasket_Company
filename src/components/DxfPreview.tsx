"use client";

import { useEffect, useState } from "react";
import DxfParser from "dxf-parser";
import type { IEntity } from "dxf-parser";

interface DxfPreviewProps {
  file: File;
}

interface PathData {
  d: string;
  stroke: string;
}

export default function DxfPreview({ file }: DxfPreviewProps) {
  const [paths, setPaths] = useState<PathData[]>([]);
  const [viewBox, setViewBox] = useState("0 0 100 100");
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function parse() {
      try {
        const text = await file.text();
        const parser = new DxfParser();
        const dxf = parser.parseSync(text);

        if (!dxf?.entities?.length) {
          setError("No geometry found");
          return;
        }

        if (cancelled) return;

        const svgPaths: PathData[] = [];
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        const updateBounds = (x: number, y: number) => {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        };

        for (const entity of dxf.entities) {
          const result = entityToSvgPath(entity, updateBounds);
          if (result) svgPaths.push(result);
        }

        if (svgPaths.length === 0 || !isFinite(minX)) {
          setError("Could not render geometry");
          return;
        }

        const padding = Math.max(maxX - minX, maxY - minY) * 0.08;
        const vbX = minX - padding;
        const vbW = maxX - minX + padding * 2;
        const vbH = maxY - minY + padding * 2;
        // Flip Y: viewBox starts at -maxY so that scale(1,-1) maps correctly
        const vbY = -maxY - padding;

        setPaths(svgPaths);
        setViewBox(`${vbX} ${vbY} ${vbW} ${vbH}`);
        setDims({
          w: Math.round((maxX - minX) * 1000) / 1000,
          h: Math.round((maxY - minY) * 1000) / 1000,
        });
      } catch {
        setError("Could not parse DXF");
      }
    }

    parse();
    return () => { cancelled = true; };
  }, [file]);

  if (error) {
    return (
      <div className="bg-charcoal-950/40 rounded-xl p-4 mb-6 border border-charcoal-800/30 text-center">
        <p className="text-xs text-charcoal-500">{error}</p>
      </div>
    );
  }

  if (paths.length === 0) {
    return (
      <div className="bg-charcoal-950/40 rounded-xl p-6 mb-6 border border-charcoal-800/30 flex items-center justify-center">
        <svg className="animate-spin w-5 h-5 text-charcoal-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-charcoal-950/40 rounded-xl p-4 mb-6 border border-charcoal-800/30">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
          DXF Preview
        </span>
        {dims && (
          <span className="text-[10px] font-mono text-charcoal-500">
            {dims.w}&quot; × {dims.h}&quot;
          </span>
        )}
      </div>
      <div className="bg-white rounded-lg border border-charcoal-800/50 p-3 flex items-center justify-center">
        <svg
          viewBox={viewBox}
          className="w-full max-h-48"
          preserveAspectRatio="xMidYMid meet"
        >
          <g transform="scale(1,-1)">
            {paths.map((p, i) => (
              <path
                key={i}
                d={p.d}
                fill="none"
                stroke={p.stroke}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}

function entityToSvgPath(
  entity: IEntity,
  updateBounds: (x: number, y: number) => void
): PathData | null {
  const primary = "#1a1e2a";
  const secondary = "#64748b";

  switch (entity.type) {
    case "LWPOLYLINE": {
      const lw = entity as IEntity & {
        vertices: Array<{ x: number; y: number; bulge?: number }>;
        shape: boolean;
      };
      if (!lw.vertices || lw.vertices.length < 2) return null;

      let d = "";
      for (let i = 0; i < lw.vertices.length; i++) {
        const v = lw.vertices[i];
        const nextV = lw.vertices[(i + 1) % lw.vertices.length];
        updateBounds(v.x, v.y);

        if (i === 0) {
          d += `M ${v.x} ${v.y}`;
        }

        const bulge = v.bulge ?? 0;
        if (Math.abs(bulge) > 1e-10 && i < lw.vertices.length - (lw.shape ? 0 : 1)) {
          // Arc segment
          const dx = nextV.x - v.x;
          const dy = nextV.y - v.y;
          const chord = Math.sqrt(dx * dx + dy * dy);
          const theta = 4 * Math.atan(Math.abs(bulge));
          const r = (chord * (1 + bulge * bulge)) / (4 * Math.abs(bulge));
          const largeArc = theta > Math.PI ? 1 : 0;
          const sweep = bulge > 0 ? 1 : 0;
          d += ` A ${r} ${r} 0 ${largeArc} ${sweep} ${nextV.x} ${nextV.y}`;
          updateBounds(nextV.x, nextV.y);
        } else if (i < lw.vertices.length - 1) {
          d += ` L ${nextV.x} ${nextV.y}`;
          updateBounds(nextV.x, nextV.y);
        }
      }

      if (lw.shape) {
        // Close back to first vertex with possible arc
        const lastV = lw.vertices[lw.vertices.length - 1];
        const firstV = lw.vertices[0];
        const bulge = lastV.bulge ?? 0;
        if (Math.abs(bulge) > 1e-10) {
          const dx = firstV.x - lastV.x;
          const dy = firstV.y - lastV.y;
          const chord = Math.sqrt(dx * dx + dy * dy);
          const theta = 4 * Math.atan(Math.abs(bulge));
          const r = (chord * (1 + bulge * bulge)) / (4 * Math.abs(bulge));
          const largeArc = theta > Math.PI ? 1 : 0;
          const sweep = bulge > 0 ? 1 : 0;
          d += ` A ${r} ${r} 0 ${largeArc} ${sweep} ${firstV.x} ${firstV.y}`;
        }
        d += " Z";
      }

      return { d, stroke: primary };
    }

    case "CIRCLE": {
      const c = entity as IEntity & { center: { x: number; y: number }; radius: number };
      if (!c.center || !c.radius) return null;
      const { x: cx, y: cy } = c.center;
      const r = c.radius;
      updateBounds(cx - r, cy - r);
      updateBounds(cx + r, cy + r);
      // SVG circle as two arcs
      const d = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} Z`;
      return { d, stroke: primary };
    }

    case "ARC": {
      const a = entity as IEntity & {
        center: { x: number; y: number };
        radius: number;
        startAngle: number;
        endAngle: number;
      };
      if (!a.center || !a.radius) return null;
      const { x: cx, y: cy } = a.center;
      const r = a.radius;
      let start = (a.startAngle * Math.PI) / 180;
      let end = (a.endAngle * Math.PI) / 180;
      if (end <= start) end += 2 * Math.PI;
      const sweep = end - start;
      const x1 = cx + r * Math.cos(start);
      const y1 = cy + r * Math.sin(start);
      const x2 = cx + r * Math.cos(end);
      const y2 = cy + r * Math.sin(end);
      updateBounds(x1, y1);
      updateBounds(x2, y2);
      updateBounds(cx - r, cy - r);
      updateBounds(cx + r, cy + r);
      const largeArc = sweep > Math.PI ? 1 : 0;
      const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
      return { d, stroke: secondary };
    }

    case "LINE": {
      const l = entity as IEntity & { vertices: Array<{ x: number; y: number }> };
      if (!l.vertices || l.vertices.length < 2) return null;
      const p1 = l.vertices[0];
      const p2 = l.vertices[1];
      updateBounds(p1.x, p1.y);
      updateBounds(p2.x, p2.y);
      return { d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`, stroke: secondary };
    }

    case "ELLIPSE": {
      const e = entity as IEntity & {
        center: { x: number; y: number };
        majorAxisEndPoint: { x: number; y: number };
        axisRatio: number;
      };
      if (!e.center || !e.majorAxisEndPoint) return null;
      const a = Math.sqrt(e.majorAxisEndPoint.x ** 2 + e.majorAxisEndPoint.y ** 2);
      const b = a * (e.axisRatio || 1);
      const rot = (Math.atan2(e.majorAxisEndPoint.y, e.majorAxisEndPoint.x) * 180) / Math.PI;
      updateBounds(e.center.x - a, e.center.y - b);
      updateBounds(e.center.x + a, e.center.y + b);
      const d = `M ${e.center.x - a} ${e.center.y} A ${a} ${b} ${rot} 1 1 ${e.center.x + a} ${e.center.y} A ${a} ${b} ${rot} 1 1 ${e.center.x - a} ${e.center.y} Z`;
      return { d, stroke: primary };
    }

    default:
      return null;
  }
}
