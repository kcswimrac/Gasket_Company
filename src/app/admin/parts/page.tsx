"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

interface PartFile {
  id: string;
  file_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  show_in_catalog: boolean;
  is_step_file: boolean;
  notes: string | null;
  uploaded_at: string;
}

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
  cad_file_url: string | null;
  scan_queue_id: string | null;
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

function PartFileUpload({ partId, fileType, label, onUploaded }: { partId: string; fileType: string; label: string; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("partId", partId);
      fd.append("fileType", fileType);
      fd.append("showInCatalog", fileType.startsWith("photo") ? "true" : "false");
      await fetch("/api/admin/parts/files", { method: "POST", body: fd });
      onUploaded();
    } catch { /* ignore */ }
    finally { setUploading(false); if (ref.current) ref.current.value = ""; }
  };
  return (
    <>
      <input ref={ref} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button onClick={() => ref.current?.click()} disabled={uploading} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50 flex items-center gap-1">
        {uploading ? "..." : label}
      </button>
    </>
  );
}

function NewScanVersionButton({ part, onCreated }: { part: Part; onCreated: () => void }) {
  const [creating, setCreating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      // Create a new scan queue entry linked to this part
      const res = await fetch("/api/admin/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partDescription: part.name,
          application: part.application,
          segment: part.segment,
          make: part.make || "",
          model: part.model || "",
          yearStart: part.year_start,
          yearEnd: part.year_end,
          notes: `New scan version for existing part ${part.id}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Link the scan queue entry to this part
        await fetch("/api/admin/parts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: part.id, scanQueueId: data.item.id }),
        });
        alert("New scan version created in Scan Queue. Upload files there.");
        setShowConfirm(false);
        onCreated();
      } else {
        alert(data.error);
      }
    } catch {
      alert("Failed to create scan version");
    } finally {
      setCreating(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-charcoal-400">Start new scan version?</span>
        <button onClick={handleCreate} disabled={creating} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50">
          {creating ? "Creating..." : "Yes, create"}
        </button>
        <button onClick={() => setShowConfirm(false)} className="text-[11px] text-charcoal-500 hover:text-charcoal-300 font-medium">Cancel</button>
      </div>
    );
  }

  return (
    <button onClick={() => setShowConfirm(true)} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      New Scan Version
    </button>
  );
}

function PartRow({ part, onRefresh, onDelete }: { part: Part; onRefresh: () => void; onDelete: (id: string, name: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState<PartFile[]>([]);
  const [filesLoaded, setFilesLoaded] = useState(false);

  const loadFiles = useCallback(async () => {
    const res = await fetch(`/api/admin/parts/files?partId=${part.id}`);
    const data = await res.json();
    if (data.success) setFiles(data.files);
    setFilesLoaded(true);
  }, [part.id]);

  useEffect(() => {
    if (expanded && !filesLoaded) loadFiles();
  }, [expanded, filesLoaded, loadFiles]);

  const handleFileUploaded = () => { loadFiles(); onRefresh(); };

  const yearDisplay = part.year_start && part.year_end ? `${part.year_start}–${part.year_end}` : part.year_start ? `${part.year_start}+` : "—";

  return (
    <div className="border-b border-charcoal-800/30">
      <div className="flex items-center gap-4 py-3 px-4 hover:bg-charcoal-900/30 cursor-pointer transition-colors" onClick={() => setExpanded(!expanded)}>
        <svg className={`w-3 h-3 text-charcoal-600 transition-transform shrink-0 ${expanded ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{part.name}</p>
          <p className="text-[11px] text-charcoal-500">{part.application}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-charcoal-400">{part.make || ""} {part.model || ""}</span>
          <span className="text-xs text-charcoal-500">{yearDisplay}</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${FITMENT_STATUSES.find((s) => s.id === part.fitment_status)?.color || ""}`}>
            {FITMENT_STATUSES.find((s) => s.id === part.fitment_status)?.label || part.fitment_status}
          </span>
          <span className="text-[10px] text-charcoal-500">{part.variants.length} tiers</span>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-5 pl-11 space-y-4">
          {/* Detail grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Segment</span>
              <p className="text-xs text-charcoal-200 mt-0.5 capitalize">{SEGMENTS.find((s) => s.id === part.segment)?.label || part.segment}</p>
            </div>
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Make / Model</span>
              <p className="text-xs text-charcoal-200 mt-0.5">{part.make || "—"} {part.model || ""}</p>
            </div>
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Years</span>
              <p className="text-xs text-charcoal-200 mt-0.5">{yearDisplay}</p>
            </div>
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Part Number</span>
              <p className="text-xs text-charcoal-200 mt-0.5">{part.part_number || "—"}</p>
            </div>
          </div>

          {part.description && (
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Description</span>
              <p className="text-xs text-charcoal-200 mt-1 leading-relaxed">{part.description}</p>
            </div>
          )}

          {/* Variants */}
          {part.variants.length > 0 && (
            <div>
              <span className="text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">Material Tiers</span>
              <div className="mt-2 space-y-2">
                {part.variants.map((v) => (
                  <div key={v.id} className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-charcoal-200 uppercase">{v.tier}</span>
                      <span className="text-xs text-charcoal-500 ml-2">{v.material} — {v.process}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      {v.last_quoted_price && <span className="text-xs text-charcoal-300">${v.last_quoted_price} <span className="text-charcoal-600">(quoted)</span></span>}
                      {v.base_price && <span className="text-xs text-charcoal-400">${v.base_price} <span className="text-charcoal-600">(base)</span></span>}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${v.available ? "bg-emerald-500/10 text-emerald-400" : "bg-charcoal-800 text-charcoal-500"}`}>
                        {v.available ? "Available" : "Draft"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {part.contributor_name && (
            <p className="text-[10px] text-charcoal-500">Contributor: {part.contributor_name}</p>
          )}

          {/* Files */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Photos */}
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">Photos</span>
                <div className="flex gap-2">
                  <PartFileUpload partId={part.id} fileType="photo_donor" label="+ Donor" onUploaded={handleFileUploaded} />
                  <PartFileUpload partId={part.id} fileType="photo_finished" label="+ Finished" onUploaded={handleFileUploaded} />
                </div>
              </div>
              {files.filter((f) => f.file_type.startsWith("photo")).length === 0 && <p className="text-[10px] text-charcoal-600">No photos</p>}
              {files.filter((f) => f.file_type.startsWith("photo")).map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[11px] py-1">
                  <span className={`text-[9px] px-1 rounded ${f.file_type === "photo_donor" ? "bg-gold-500/10 text-gold-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {f.file_type === "photo_donor" ? "donor" : "finished"}
                  </span>
                  <a href={f.file_url} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 truncate">{f.file_name}</a>
                  {f.show_in_catalog && <span className="text-[9px] text-charcoal-500">catalog</span>}
                </div>
              ))}
            </div>

            {/* CAD Files */}
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">CAD Files</span>
                <div className="flex gap-2">
                  <PartFileUpload partId={part.id} fileType="cad_step" label="+ STEP" onUploaded={handleFileUploaded} />
                  <PartFileUpload partId={part.id} fileType="cad_other" label="+ Other" onUploaded={handleFileUploaded} />
                </div>
              </div>
              {files.filter((f) => f.file_type.startsWith("cad")).length === 0 && <p className="text-[10px] text-charcoal-600">No CAD files</p>}
              {files.filter((f) => f.file_type.startsWith("cad")).map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[11px] py-1">
                  {f.is_step_file && <span className="text-[9px] px-1 rounded bg-blue-500/10 text-blue-400">STEP</span>}
                  <a href={f.file_url} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 truncate">{f.file_name}</a>
                  {f.file_size && <span className="text-charcoal-600">{(f.file_size / 1024).toFixed(0)}KB</span>}
                </div>
              ))}
            </div>

            {/* Other files */}
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">Other Files</span>
                <div className="flex gap-2">
                  <PartFileUpload partId={part.id} fileType="stl_preview" label="+ STL" onUploaded={handleFileUploaded} />
                  <PartFileUpload partId={part.id} fileType="drawing_pdf" label="+ Drawing" onUploaded={handleFileUploaded} />
                </div>
              </div>
              {files.filter((f) => !f.file_type.startsWith("photo") && !f.file_type.startsWith("cad")).length === 0 && <p className="text-[10px] text-charcoal-600">No files</p>}
              {files.filter((f) => !f.file_type.startsWith("photo") && !f.file_type.startsWith("cad")).map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[11px] py-1">
                  <span className="text-[9px] px-1 rounded bg-charcoal-800 text-charcoal-400">{f.file_type}</span>
                  <a href={f.file_url} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 truncate">{f.file_name}</a>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <NewScanVersionButton part={part} onCreated={onRefresh} />
            {part.scan_queue_id && (
              <a href="/admin/scans" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">View in Scan Queue</a>
            )}
            <button onClick={() => onDelete(part.id, part.name)} className="text-[11px] text-red-400/60 hover:text-red-400 font-medium">Delete Part</button>
          </div>
        </div>
      )}
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
          <div>
            {parts.map((part) => (
              <PartRow key={part.id} part={part} onRefresh={fetchParts} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
