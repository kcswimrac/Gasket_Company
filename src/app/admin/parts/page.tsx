"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";

const CadViewer = dynamic(() => import("@/components/CadViewer"), { ssr: false });
const RenderPreviewButton = dynamic(() => import("@/components/RenderPreviewButton"), { ssr: false });

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
  display_order: number;
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

interface AQMaterial { code: string; display_name: string; processes: string[] }

function VariantManager({ partId, variants, onChanged }: { partId: string; variants: Part["variants"]; onChanged: () => void }) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [materials, setMaterials] = useState<AQMaterial[]>([]);
  const [materialsLoaded, setMaterialsLoaded] = useState(false);

  const [tier, setTier] = useState("oem");
  const [materialCode, setMaterialCode] = useState("");
  const [process, setProcess] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [leadTime, setLeadTime] = useState("");

  const loadMaterials = async () => {
    if (materialsLoaded) return;
    try {
      const res = await fetch("/api/admin/autoquote");
      const data = await res.json();
      if (data.success && data.materialList) {
        setMaterials(data.materialList);
        if (data.materialList.length > 0) {
          setMaterialCode(data.materialList[0].code);
          if (data.materialList[0].processes.length > 0) setProcess(data.materialList[0].processes[0]);
        }
      }
    } catch { /* ignore */ }
    setMaterialsLoaded(true);
  };

  const selectedMaterial = materials.find((m) => m.code === materialCode);

  const handleAdd = async () => {
    if (!materialCode || !process) return;
    setSaving(true);
    const mat = materials.find((m) => m.code === materialCode);
    await fetch("/api/admin/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partId,
        tier,
        material: mat?.display_name || materialCode,
        process,
        basePrice: basePrice || null,
        leadTimeDays: leadTime ? parseInt(leadTime) : null,
        autoquoteMaterialCode: materialCode,
        autoquoteProcess: process,
        available: true,
      }),
    });
    setSaving(false);
    setAdding(false);
    setBasePrice("");
    setLeadTime("");
    onChanged();
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm("Remove this tier?")) return;
    await fetch("/api/admin/variants", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variantId }),
    });
    onChanged();
  };

  const toggleAvailable = async (v: Part["variants"][0]) => {
    await fetch("/api/admin/variants", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id, available: !v.available }),
    });
    onChanged();
  };

  const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded px-2.5 py-1.5 text-xs text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">Material Tiers ({variants.length})</span>
        <button onClick={() => { setAdding(true); loadMaterials(); }} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">+ Add Tier</button>
      </div>

      {/* Existing variants */}
      <div className="space-y-2">
        {variants.map((v) => (
          <div key={v.id} className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${v.tier === "oem" ? "bg-blue-500/10 text-blue-400" : v.tier === "improved" ? "bg-emerald-500/10 text-emerald-400" : v.tier === "fitment_check" ? "bg-gold-500/10 text-gold-400" : "bg-charcoal-800 text-charcoal-400"}`}>
                {v.tier === "fitment_check" ? "3D Fit" : v.tier}
              </span>
              <div>
                <span className="text-xs text-charcoal-200">{v.material}</span>
                <span className="text-[10px] text-charcoal-500 ml-1.5">{v.process}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {v.last_quoted_price && <span className="text-xs text-emerald-400 font-medium">${v.last_quoted_price}</span>}
              {v.base_price && <span className="text-xs text-charcoal-400">${v.base_price}</span>}
              <button onClick={() => toggleAvailable(v)} className={`text-[10px] px-2 py-0.5 rounded transition-colors ${v.available ? "bg-emerald-500/15 text-emerald-400" : "bg-charcoal-800 text-charcoal-500"}`}>
                {v.available ? "Active" : "Draft"}
              </button>
              <button onClick={() => handleDelete(v.id)} className="text-[10px] text-red-400/50 hover:text-red-400">×</button>
            </div>
          </div>
        ))}

        {variants.length === 0 && !adding && (
          <p className="text-[10px] text-charcoal-600 py-2">No tiers configured. Add material tiers to enable ordering.</p>
        )}
      </div>

      {/* Add tier form */}
      {adding && (
        <div className="mt-3 bg-charcoal-950/40 rounded-lg p-4 border border-emerald-500/20 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[9px] text-charcoal-500 uppercase tracking-wider">Tier</label>
              <select value={tier} onChange={(e) => setTier(e.target.value)} className={inputCls}>
                <option value="oem">OEM Spec</option>
                <option value="improved">Improved</option>
                <option value="custom">Custom</option>
                <option value="fitment_check">3D Test-Fit</option>
              </select>
            </div>
            <div>
              <label className="text-[9px] text-charcoal-500 uppercase tracking-wider">Material</label>
              {materials.length > 0 ? (
                <select value={materialCode} onChange={(e) => { setMaterialCode(e.target.value); const m = materials.find((x) => x.code === e.target.value); if (m?.processes[0]) setProcess(m.processes[0]); }} className={inputCls}>
                  {materials.map((m) => <option key={m.code} value={m.code}>{m.display_name} ({m.code})</option>)}
                </select>
              ) : (
                <input value={materialCode} onChange={(e) => setMaterialCode(e.target.value)} placeholder="e.g., AL_6061" className={inputCls} />
              )}
            </div>
            <div>
              <label className="text-[9px] text-charcoal-500 uppercase tracking-wider">Process</label>
              {selectedMaterial ? (
                <select value={process} onChange={(e) => setProcess(e.target.value)} className={inputCls}>
                  {selectedMaterial.processes.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              ) : (
                <input value={process} onChange={(e) => setProcess(e.target.value)} placeholder="e.g., CNC_3AXIS" className={inputCls} />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-charcoal-500 uppercase tracking-wider">Base $</label>
                <input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} placeholder="0.00" className={inputCls} />
              </div>
              <div>
                <label className="text-[9px] text-charcoal-500 uppercase tracking-wider">Days</label>
                <input value={leadTime} onChange={(e) => setLeadTime(e.target.value)} placeholder="7" className={inputCls} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving || !materialCode || !process} className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded uppercase tracking-wider disabled:opacity-50">
              {saving ? "Adding..." : "Add Tier"}
            </button>
            <button onClick={() => setAdding(false)} className="px-4 py-1.5 border border-charcoal-700 text-charcoal-400 text-[11px] rounded uppercase tracking-wider">Cancel</button>
          </div>
          {materials.length === 0 && materialsLoaded && (
            <p className="text-[10px] text-gold-400">AutoQuote not connected — enter material codes manually.</p>
          )}
        </div>
      )}
    </div>
  );
}

function PhotoManager({ files, onChanged }: { files: PartFile[]; onChanged: () => void }) {
  const patchFile = async (fileId: string, updates: Record<string, unknown>) => {
    await fetch("/api/admin/parts/files", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId, ...updates }),
    });
    onChanged();
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm("Delete this photo?")) return;
    await fetch("/api/admin/parts/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
    onChanged();
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const current = files[index];
    const prev = files[index - 1];
    await patchFile(current.id, { displayOrder: prev.display_order });
    await patchFile(prev.id, { displayOrder: current.display_order });
  };

  const moveDown = async (index: number) => {
    if (index >= files.length - 1) return;
    const current = files[index];
    const next = files[index + 1];
    await patchFile(current.id, { displayOrder: next.display_order });
    await patchFile(next.id, { displayOrder: current.display_order });
  };

  if (files.length === 0) {
    return <p className="text-[10px] text-charcoal-600 py-4 text-center">No photos uploaded</p>;
  }

  return (
    <div className="space-y-1.5">
      {files.map((f, i) => (
        <div key={f.id} className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all ${f.show_in_catalog ? "border-emerald-500/20 bg-emerald-500/3" : "border-charcoal-800/30 bg-charcoal-950/30"}`}>
          {/* Thumbnail */}
          <img
            src={`/api/files?url=${encodeURIComponent(f.file_url)}`}
            alt={f.file_name}
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-charcoal-200 truncate">{f.file_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[8px] px-1 rounded ${f.file_type === "photo_donor" ? "bg-gold-500/20 text-gold-400" : f.file_type === "photo_mockup" ? "bg-copper-500/20 text-copper-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                {f.file_type === "photo_donor" ? "original" : f.file_type === "photo_mockup" ? "3D mockup" : "finished"}
              </span>
              <span className="text-[8px] text-charcoal-600">#{f.display_order + 1}</span>
            </div>
          </div>

          {/* Reorder */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => moveUp(i)}
              disabled={i === 0}
              className="text-charcoal-500 hover:text-charcoal-300 disabled:opacity-20 p-0.5"
              title="Move up"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
            </button>
            <button
              onClick={() => moveDown(i)}
              disabled={i >= files.length - 1}
              className="text-charcoal-500 hover:text-charcoal-300 disabled:opacity-20 p-0.5"
              title="Move down"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
          </div>

          {/* Visibility toggle */}
          <button
            onClick={() => patchFile(f.id, { showInCatalog: !f.show_in_catalog })}
            className={`text-[9px] px-2 py-1 rounded font-semibold transition-colors ${f.show_in_catalog ? "bg-emerald-500 text-white" : "bg-charcoal-700 text-charcoal-400 hover:bg-charcoal-600"}`}
            title={f.show_in_catalog ? "Click to hide from catalog" : "Click to show in catalog"}
          >
            {f.show_in_catalog ? "Visible" : "Hidden"}
          </button>

          {/* Delete */}
          <button
            onClick={() => deleteFile(f.id)}
            className="text-red-400/40 hover:text-red-400 p-1 transition-colors"
            title="Delete photo"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ))}
    </div>
  );
}

function EditablePartFields({ part, onSaved }: { part: Part; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: part.name, segment: part.segment, make: part.make || "",
    model: part.model || "", yearStart: String(part.year_start || ""),
    yearEnd: String(part.year_end || ""), application: part.application,
    description: part.description || "", fitmentStatus: part.fitment_status,
    dimensions: part.dimensions || "", partNumber: part.part_number || "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded px-2.5 py-1.5 text-xs text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls = "text-[9px] text-charcoal-500 uppercase tracking-wider";

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/admin/parts", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: part.id, ...form, yearStart: form.yearStart ? parseInt(form.yearStart) : null, yearEnd: form.yearEnd ? parseInt(form.yearEnd) : null }),
    });
    setSaving(false); setEditing(false); onSaved();
  };

  if (!editing) {
    return (
      <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">Part Details</span>
          <button onClick={() => setEditing(true)} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">Edit</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div><span className={labelCls}>Segment</span><p className="text-charcoal-200 capitalize">{SEGMENTS.find((s) => s.id === part.segment)?.label || part.segment}</p></div>
          <div><span className={labelCls}>Make / Model</span><p className="text-charcoal-200">{part.make || "—"} {part.model || ""}</p></div>
          <div><span className={labelCls}>Years</span><p className="text-charcoal-200">{part.year_start && part.year_end ? `${part.year_start}–${part.year_end}` : part.year_start || "—"}</p></div>
          <div><span className={labelCls}>Fitment</span><p className="text-charcoal-200">{FITMENT_STATUSES.find((s) => s.id === part.fitment_status)?.label || part.fitment_status}</p></div>
          <div><span className={labelCls}>Part Number</span><p className="text-charcoal-200">{part.part_number || "—"}</p></div>
          <div><span className={labelCls}>Dimensions</span><p className="text-charcoal-200">{part.dimensions || "—"}</p></div>
          {part.description && <div className="col-span-2"><span className={labelCls}>Description</span><p className="text-charcoal-200">{part.description}</p></div>}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-charcoal-950/40 rounded-lg p-3 border border-emerald-500/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">Editing Part</span>
        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save"}</button>
          <button onClick={() => setEditing(false)} className="text-[11px] text-charcoal-500 hover:text-charcoal-300 font-medium">Cancel</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2"><label className={labelCls}>Name</label><input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Segment</label><select value={form.segment} onChange={(e) => set("segment", e.target.value)} className={inputCls}>{SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
        <div><label className={labelCls}>Fitment</label><select value={form.fitmentStatus} onChange={(e) => set("fitmentStatus", e.target.value)} className={inputCls}>{FITMENT_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
        <div><label className={labelCls}>Make</label><input value={form.make} onChange={(e) => set("make", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Model</label><input value={form.model} onChange={(e) => set("model", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Year Start</label><input type="number" value={form.yearStart} onChange={(e) => set("yearStart", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Year End</label><input type="number" value={form.yearEnd} onChange={(e) => set("yearEnd", e.target.value)} className={inputCls} /></div>
        <div className="col-span-2"><label className={labelCls}>Application</label><input value={form.application} onChange={(e) => set("application", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Dimensions</label><input value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>Part Number</label><input value={form.partNumber} onChange={(e) => set("partNumber", e.target.value)} className={inputCls} /></div>
        <div className="col-span-2 sm:col-span-4"><label className={labelCls}>Description</label><textarea rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} className={`${inputCls} resize-none`} /></div>
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
          partId: part.id,
          partDescription: part.name,
          application: part.application,
          segment: part.segment,
          make: part.make || "",
          model: part.model || "",
          yearStart: part.year_start,
          yearEnd: part.year_end,
          notes: `Revision scan for existing part`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Revision scan created in Scan Queue. Upload new files there, then 'Release Update' to push to this part.");
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

  const cadOrStl = files.find((f) => f.file_type === "stl_preview") || files.find((f) => f.is_step_file);

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
          {/* Visual row: photos + 3D preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Photo gallery */}
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">Photos</span>
                <div className="flex gap-2">
                  <PartFileUpload partId={part.id} fileType="photo_donor" label="+ Donor" onUploaded={handleFileUploaded} />
                  <PartFileUpload partId={part.id} fileType="photo_finished" label="+ Finished" onUploaded={handleFileUploaded} />
                  <PartFileUpload partId={part.id} fileType="photo_mockup" label="+ Mockup" onUploaded={handleFileUploaded} />
                </div>
              </div>
              <PhotoManager files={files.filter((f) => f.file_type.startsWith("photo")).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))} onChanged={loadFiles} />
            </div>

            {/* 3D STL Preview */}
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">3D Preview</span>
                <PartFileUpload partId={part.id} fileType="stl_preview" label="+ STL" onUploaded={handleFileUploaded} />
              </div>
              {cadOrStl ? (
                <>
                  <CadViewer
                    url={`/api/files?url=${encodeURIComponent(cadOrStl.file_url)}`}
                    fileName={cadOrStl.file_name}
                  />
                  <div className="mt-2 pt-2 border-t border-charcoal-800/30">
                    <RenderPreviewButton
                      fileUrl={`/api/files?url=${encodeURIComponent(cadOrStl.file_url)}`}
                      fileName={cadOrStl.file_name}
                      partId={part.id}
                      onRendered={handleFileUploaded}
                    />
                    <p className="text-[9px] text-charcoal-600 mt-1">Renders 4 views and uploads as catalog images. CAD files are never exposed to customers.</p>
                  </div>
                </>
              ) : (
                <p className="text-[10px] text-charcoal-600 py-4 text-center">Upload a STEP or STL file for 3D preview<br />(Front / Right / Top / Iso views)</p>
              )}
            </div>
          </div>

          {/* Editable detail fields */}
          <EditablePartFields part={part} onSaved={onRefresh} />

          {/* Variants / Material Tiers */}
          <VariantManager partId={part.id} variants={part.variants} onChanged={onRefresh} />

          {/* CAD + Other files */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">CAD Files</span>
                <div className="flex gap-2">
                  <PartFileUpload partId={part.id} fileType="cad_step" label="+ STEP" onUploaded={handleFileUploaded} />
                  <PartFileUpload partId={part.id} fileType="cad_other" label="+ Other" onUploaded={handleFileUploaded} />
                </div>
              </div>
              {files.filter((f) => f.file_type.startsWith("cad")).map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[11px] py-1">
                  {f.is_step_file && <span className="text-[9px] px-1 rounded bg-blue-500/10 text-blue-400">STEP</span>}
                  <a href={`/api/files?url=${encodeURIComponent(f.file_url)}`} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 truncate">{f.file_name}</a>
                  {f.file_size && <span className="text-charcoal-600">{(f.file_size / 1024).toFixed(0)}KB</span>}
                </div>
              ))}
              {files.filter((f) => f.file_type.startsWith("cad")).length === 0 && <p className="text-[10px] text-charcoal-600">No CAD files</p>}
            </div>
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">Drawings</span>
                <PartFileUpload partId={part.id} fileType="drawing_pdf" label="+ Drawing" onUploaded={handleFileUploaded} />
              </div>
              {files.filter((f) => f.file_type === "drawing_pdf").map((f) => (
                <div key={f.id} className="flex items-center gap-2 text-[11px] py-1">
                  <a href={`/api/files?url=${encodeURIComponent(f.file_url)}`} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 truncate">{f.file_name}</a>
                </div>
              ))}
              {files.filter((f) => f.file_type === "drawing_pdf").length === 0 && <p className="text-[10px] text-charcoal-600">No drawings</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <NewScanVersionButton part={part} onCreated={onRefresh} />
            {part.scan_queue_id && <a href="/admin/scans" className="text-[11px] text-blue-400 hover:text-blue-300 font-medium">View Scan Queue</a>}
            {part.contributor_name && <span className="text-[10px] text-charcoal-500">Contributor: {part.contributor_name}</span>}
            <button onClick={() => onDelete(part.id, part.name)} className="text-[11px] text-red-400/60 hover:text-red-400 font-medium ml-auto">Delete Part</button>
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
