"use client";

import { useState, useEffect, useCallback } from "react";

const SEGMENTS = [
  { id: "tractor", label: "Vintage Tractors" },
  { id: "marine", label: "Marine & Outboard" },
  { id: "automotive", label: "Classic Automotive" },
  { id: "motorcycle", label: "Vintage Motorcycle" },
  { id: "industrial", label: "Industrial & Machinery" },
];

const FITMENT_STATUSES = [
  { id: "reference", label: "Reference Model", color: "bg-copper-500/10 text-copper-400" },
  { id: "scan_verified", label: "Scan Verified", color: "bg-gold-500/10 text-gold-400" },
  { id: "verified", label: "Verified Fit", color: "bg-emerald-500/10 text-emerald-400" },
];

interface Part {
  id: string;
  name: string;
  segment: string;
  make: string | null;
  model: string | null;
  year_start: number | null;
  year_end: number | null;
  application: string;
  description: string | null;
  fitment_status: string;
  dimensions: string | null;
  part_number: string | null;
  active: boolean;
  created_at: string;
  contributor_name: string | null;
  variants: Array<{
    id: string;
    tier: string;
    material: string;
    process: string;
    base_price: string | null;
    available: boolean;
    last_quoted_price: string | null;
  }>;
}

function AddPartForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", segment: "automotive", make: "", model: "",
    yearStart: "", yearEnd: "", application: "", description: "",
    fitmentStatus: "reference", dimensions: "", partNumber: "", notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.application) {
      setError("Name and application are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/parts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearStart: form.yearStart ? parseInt(form.yearStart) : null,
          yearEnd: form.yearEnd ? parseInt(form.yearEnd) : null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setForm({ name: "", segment: "automotive", make: "", model: "", yearStart: "", yearEnd: "", application: "", description: "", fitmentStatus: "reference", dimensions: "", partNumber: "", notes: "" });
      setOpen(false);
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors">
        + Add Part
      </button>
    );
  }

  const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls = "block text-[10px] font-semibold text-charcoal-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Add New Part</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-charcoal-500 hover:text-charcoal-300">Cancel</button>
      </div>

      {error && <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 mb-4 text-xs text-red-400">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div><label className={labelCls}>Part Name *</label><input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g., Battery Tray" className={inputCls} /></div>
        <div>
          <label className={labelCls}>Segment *</label>
          <select value={form.segment} onChange={(e) => set("segment", e.target.value)} className={inputCls}>
            {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Fitment Status</label>
          <select value={form.fitmentStatus} onChange={(e) => set("fitmentStatus", e.target.value)} className={inputCls}>
            {FITMENT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div><label className={labelCls}>Make</label><input value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="e.g., Ford" className={inputCls} /></div>
        <div><label className={labelCls}>Model</label><input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g., 8N" className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>Year Start</label><input type="number" value={form.yearStart} onChange={(e) => set("yearStart", e.target.value)} placeholder="1939" className={inputCls} /></div>
          <div><label className={labelCls}>Year End</label><input type="number" value={form.yearEnd} onChange={(e) => set("yearEnd", e.target.value)} placeholder="1952" className={inputCls} /></div>
        </div>
        <div className="sm:col-span-2 lg:col-span-3"><label className={labelCls}>Application / Fitment *</label><input value={form.application} onChange={(e) => set("application", e.target.value)} placeholder="e.g., 1939–1952 Ford 8N / 9N / 2N" className={inputCls} /></div>
        <div className="sm:col-span-2 lg:col-span-3"><label className={labelCls}>Description</label><textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Part description, scan source, notes..." className={`${inputCls} resize-none`} /></div>
        <div><label className={labelCls}>Dimensions</label><input value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder='e.g., 16.5" × 6.2" × 2.1"' className={inputCls} /></div>
        <div><label className={labelCls}>Part Number</label><input value={form.partNumber} onChange={(e) => set("partNumber", e.target.value)} placeholder="OEM or internal P/N" className={inputCls} /></div>
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Create Part"}
        </button>
        <button onClick={() => setOpen(false)} className="px-6 py-2.5 border border-charcoal-700 text-charcoal-400 hover:text-charcoal-300 text-xs rounded uppercase tracking-wider transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function PartsAdmin() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("segment", filter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/parts?${params}`);
      const data = await res.json();
      if (data.success) {
        setParts(data.parts);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch parts");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await fetch("/api/admin/parts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchParts();
    } catch { /* ignore */ }
  };

  const yearDisplay = (p: Part) => {
    if (p.year_start && p.year_end) return `${p.year_start}–${p.year_end}`;
    if (p.year_start) return `${p.year_start}+`;
    return "—";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Parts Catalog</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            {parts.length} parts in database
          </p>
        </div>
        <AddPartForm onCreated={fetchParts} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, make, model..."
          className="bg-charcoal-900 border border-charcoal-800/50 rounded-lg px-3 py-2 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 w-64"
        />
        <div className="flex gap-1.5">
          <button onClick={() => setFilter("all")} className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${filter === "all" ? "bg-emerald-500/10 text-emerald-400" : "text-charcoal-500 hover:text-charcoal-300"}`}>All</button>
          {SEGMENTS.map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)} className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${filter === s.id ? "bg-emerald-500/10 text-emerald-400" : "text-charcoal-500 hover:text-charcoal-300"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400">
          {error}
          <button onClick={fetchParts} className="ml-3 text-xs underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <svg className="animate-spin w-4 h-4 text-charcoal-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-charcoal-400">Loading parts...</span>
          </div>
        ) : parts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-charcoal-300 mb-2">No parts yet</p>
            <p className="text-sm text-charcoal-500">Click &quot;+ Add Part&quot; to add your first part to the catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-800/50">
                  {["Part", "Make / Model", "Years", "Segment", "Fitment", "Variants", "Price", "Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => (
                  <tr key={part.id} className="border-b border-charcoal-800/30 hover:bg-charcoal-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-white">{part.name}</p>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">{part.application}</p>
                    </td>
                    <td className="py-3 px-4">
                      {part.make || part.model ? (
                        <div>
                          <span className="text-xs text-charcoal-200">{part.make}</span>
                          {part.model && <span className="text-xs text-charcoal-400"> {part.model}</span>}
                        </div>
                      ) : (
                        <span className="text-xs text-charcoal-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-charcoal-400">{yearDisplay(part)}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-charcoal-400 capitalize">
                        {SEGMENTS.find((s) => s.id === part.segment)?.label || part.segment}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${FITMENT_STATUSES.find((s) => s.id === part.fitment_status)?.color || ""}`}>
                        {FITMENT_STATUSES.find((s) => s.id === part.fitment_status)?.label || part.fitment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-charcoal-400">
                      {part.variants.length} tier{part.variants.length !== 1 ? "s" : ""}
                    </td>
                    <td className="py-3 px-4">
                      {part.variants.length > 0 ? (
                        <span className="text-xs text-charcoal-300">{part.variants[0].base_price ? `$${part.variants[0].base_price}` : "—"}</span>
                      ) : (
                        <span className="text-xs text-charcoal-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => handleDelete(part.id, part.name)} className="text-[11px] text-red-400/60 hover:text-red-400 font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
