"use client";

import { useState } from "react";
import {
  CATALOG,
  SEGMENTS,
  FITMENT_BADGES,
  type CatalogEntry,
  type Segment,
  type FitmentStatus,
} from "@/lib/restoration/catalog";

function StatusBadge({ status }: { status: FitmentStatus }) {
  const b = FITMENT_BADGES[status];
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    gold: "bg-gold-500/10 text-gold-400",
    copper: "bg-copper-500/10 text-copper-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${colors[b.color]}`}>
      {b.label}
    </span>
  );
}

function PartRow({ part }: { part: CatalogEntry }) {
  const availableTiers = part.tiers.filter((t) => t.available).length;
  const prices = part.tiers
    .filter((t) => t.available && t.price !== "Quoted")
    .map((t) => t.price);

  return (
    <tr className="border-b border-charcoal-800/30 hover:bg-charcoal-900/30 transition-colors">
      <td className="py-3 px-4">
        <span className="text-[10px] font-mono text-charcoal-600">{part.id}</span>
      </td>
      <td className="py-3 px-4">
        <p className="text-sm font-medium text-white">{part.name}</p>
        <p className="text-[11px] text-charcoal-500 mt-0.5">{part.application}</p>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-charcoal-400 capitalize">
          {SEGMENTS.find((s) => s.id === part.segment)?.label}
        </span>
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={part.fitment} />
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-charcoal-400">
          {availableTiers}/{part.tiers.length} tiers
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-charcoal-300">
          {prices.length > 0 ? prices[0] : "—"}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-xs text-charcoal-500">{part.leadTime}</span>
      </td>
      <td className="py-3 px-4">
        {part.contributor ? (
          <span className="text-xs text-charcoal-400">{part.contributor.name}</span>
        ) : (
          <span className="text-xs text-charcoal-600">—</span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <button className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">
            Edit
          </button>
          <button className="text-[11px] text-charcoal-500 hover:text-charcoal-300 font-medium">
            Quote
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function PartsAdmin() {
  const [filter, setFilter] = useState<Segment | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = CATALOG.filter((p) => {
    if (filter !== "all" && p.segment !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.application.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Parts Catalog</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            {CATALOG.length} parts across {SEGMENTS.length} segments
          </p>
        </div>
        <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors">
          + Add Part
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search parts..."
          className="bg-charcoal-900 border border-charcoal-800/50 rounded-lg px-3 py-2 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 w-64"
        />
        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
              filter === "all"
                ? "bg-emerald-500/10 text-emerald-400"
                : "text-charcoal-500 hover:text-charcoal-300"
            }`}
          >
            All
          </button>
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setFilter(s.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                filter === s.id
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-charcoal-500 hover:text-charcoal-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-800/50">
                {["ID", "Part", "Segment", "Fitment", "Tiers", "Price", "Lead Time", "Contributor", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="py-3 px-4 text-left text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((part) => (
                <PartRow key={part.id} part={part} />
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-charcoal-500">No parts match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
