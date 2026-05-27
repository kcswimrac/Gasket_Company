"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Artifact {
  id: string;
  artifact_type: string;
  version: number;
  file_name: string;
  file_url: string;
  file_size: number | null;
  superseded_by: string | null;
  notes: string | null;
  uploaded_at: string;
}

interface ScanItem {
  id: string;
  part_description: string;
  application: string;
  segment: string | null;
  make: string | null;
  model: string | null;
  year_start: number | null;
  year_end: number | null;
  fitment_status: string | null;
  dimensions: string | null;
  part_number: string | null;
  condition: string | null;
  status: string;
  contributor_name: string | null;
  notes: string | null;
  current_scan_version: number;
  current_cad_version: number;
  needs_cad_update: boolean;
  part_id: string | null;
  received_at: string;
  scanned_at: string | null;
  completed_at: string | null;
  artifacts: Artifact[];
}

const STATUS_FLOW = ["received", "scanning", "modeling", "complete"];
const STATUS_COLORS: Record<string, string> = {
  received: "bg-gold-500/10 text-gold-400",
  scanning: "bg-blue-500/10 text-blue-400",
  modeling: "bg-copper-500/10 text-copper-400",
  complete: "bg-emerald-500/10 text-emerald-400",
};

function FileUploadButton({
  scanQueueId,
  artifactType,
  label,
  onUploaded,
}: {
  scanQueueId: string;
  artifactType: string;
  label: string;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("scanQueueId", scanQueueId);
      fd.append("artifactType", artifactType);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!data.success) alert(data.error);
      else onUploaded();
    } catch {
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <>
      <input ref={ref} type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button
        onClick={() => ref.current?.click()}
        disabled={uploading}
        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50 flex items-center gap-1"
      >
        {uploading ? (
          <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Uploading...</>
        ) : (
          <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg> {label}</>
        )}
      </button>
    </>
  );
}

function ArtifactList({ artifacts, type }: { artifacts: Artifact[]; type: string }) {
  const filtered = artifacts.filter((a) => a.artifact_type === type).sort((a, b) => b.version - a.version);
  if (filtered.length === 0) return null;

  return (
    <div className="space-y-1">
      {filtered.map((a) => (
        <div key={a.id} className={`flex items-center gap-2 text-[11px] ${a.superseded_by ? "opacity-40 line-through" : ""}`}>
          <span className="text-charcoal-500 font-mono">v{a.version}</span>
          <a href={a.file_url} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 truncate max-w-[150px]">{a.file_name}</a>
          {a.file_size && <span className="text-charcoal-600">{(a.file_size / 1024).toFixed(0)}KB</span>}
        </div>
      ))}
    </div>
  );
}

function ScanItemRow({ item, onRefresh }: { item: ScanItem; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const nextStatus = () => {
    const idx = STATUS_FLOW.indexOf(item.status);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const advanceStatus = async (newStatus: string) => {
    await fetch("/api/admin/scans", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: newStatus }),
    });
    onRefresh();
  };

  const scanArtifacts = item.artifacts.filter((a) => a.artifact_type === "scan_raw" || a.artifact_type === "scan_processed");
  const cadArtifacts = item.artifacts.filter((a) => a.artifact_type === "cad_model");
  const otherArtifacts = item.artifacts.filter((a) => !["scan_raw", "scan_processed", "cad_model"].includes(a.artifact_type));

  return (
    <div className="border-b border-charcoal-800/30">
      {/* Main row */}
      <div
        className="flex items-center gap-4 py-3 px-4 hover:bg-charcoal-900/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <svg className={`w-3 h-3 text-charcoal-600 transition-transform ${expanded ? "rotate-90" : ""}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-white font-medium truncate">{item.part_description}</p>
          <p className="text-[11px] text-charcoal-500">{item.application}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Version badges */}
          <div className="flex gap-1.5">
            {item.current_scan_version > 0 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">
                scan v{item.current_scan_version}
              </span>
            )}
            {item.current_cad_version > 0 && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-copper-500/10 text-copper-400">
                cad v{item.current_cad_version}
              </span>
            )}
            {item.needs_cad_update && (
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                CAD outdated
              </span>
            )}
          </div>

          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${STATUS_COLORS[item.status] || ""}`}>
            {item.status}
          </span>

          <span className="text-[10px] text-charcoal-600">{item.contributor_name || "—"}</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pl-11 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Scan files */}
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">Scan Files</span>
                <FileUploadButton scanQueueId={item.id} artifactType="scan_raw" label="Upload Scan" onUploaded={onRefresh} />
              </div>
              <ArtifactList artifacts={item.artifacts} type="scan_raw" />
              <ArtifactList artifacts={item.artifacts} type="scan_processed" />
              {scanArtifacts.length === 0 && <p className="text-[10px] text-charcoal-600">No scans uploaded</p>}
            </div>

            {/* CAD files */}
            <div className={`bg-charcoal-950/40 rounded-lg p-3 border ${item.needs_cad_update ? "border-red-500/20" : "border-charcoal-800/30"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">CAD Models</span>
                <FileUploadButton scanQueueId={item.id} artifactType="cad_model" label="Upload CAD" onUploaded={onRefresh} />
              </div>
              {item.needs_cad_update && (
                <div className="bg-red-500/5 border border-red-500/15 rounded p-2 mb-2">
                  <p className="text-[10px] text-red-400">New scan uploaded — CAD needs update to match.</p>
                </div>
              )}
              <ArtifactList artifacts={item.artifacts} type="cad_model" />
              {cadArtifacts.length === 0 && <p className="text-[10px] text-charcoal-600">No CAD uploaded</p>}
            </div>

            {/* Other files */}
            <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">Other Files</span>
                <FileUploadButton scanQueueId={item.id} artifactType="photo" label="Upload" onUploaded={onRefresh} />
              </div>
              <ArtifactList artifacts={item.artifacts} type="photo" />
              <ArtifactList artifacts={item.artifacts} type="stl_preview" />
              <ArtifactList artifacts={item.artifacts} type="drawing_pdf" />
              {otherArtifacts.length === 0 && <p className="text-[10px] text-charcoal-600">No files</p>}
            </div>
          </div>

          {/* Part info summary */}
          <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div><span className="text-charcoal-500 block">Segment</span><span className="text-charcoal-200 capitalize">{item.segment || "—"}</span></div>
              <div><span className="text-charcoal-500 block">Make / Model</span><span className="text-charcoal-200">{item.make || "—"} {item.model || ""}</span></div>
              <div><span className="text-charcoal-500 block">Years</span><span className="text-charcoal-200">{item.year_start && item.year_end ? `${item.year_start}–${item.year_end}` : item.year_start || "—"}</span></div>
              <div><span className="text-charcoal-500 block">Condition</span><span className="text-charcoal-200">{item.condition || "—"}</span></div>
            </div>
          </div>

          {/* Status actions */}
          <div className="flex flex-wrap items-center gap-3">
            {item.status !== "complete" && cadArtifacts.length > 0 && (
              <button
                onClick={() => advanceStatus("complete")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-semibold rounded uppercase tracking-wider transition-colors"
              >
                Mark Complete
              </button>
            )}
            {item.status === "received" && scanArtifacts.length === 0 && cadArtifacts.length === 0 && (
              <span className="text-[10px] text-charcoal-500">Upload a scan or CAD file to advance status</span>
            )}
            {item.status === "scanning" && cadArtifacts.length === 0 && (
              <span className="text-[10px] text-charcoal-500">Upload CAD to advance to modeling</span>
            )}
            {item.status === "modeling" && (
              <span className="text-[10px] text-charcoal-500">Upload STL preview or mark complete to publish</span>
            )}
            {item.status === "complete" && !item.part_id && (
              <button
                onClick={async () => {
                  setPublishing(true);
                  try {
                    const res = await fetch("/api/admin/scans/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scanQueueId: item.id }) });
                    const data = await res.json();
                    if (data.success) { alert(`Published! Part created.`); onRefresh(); }
                    else alert(data.error);
                  } catch { alert("Failed"); }
                  finally { setPublishing(false); }
                }}
                disabled={publishing}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-[11px] font-semibold rounded uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {publishing ? "Publishing..." : "Publish to Catalog"}
              </button>
            )}
            {item.part_id && (
              <span className="text-[10px] text-emerald-400/70 flex items-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Published to catalog
              </span>
            )}
            {item.status === "complete" && !item.part_id && !item.segment && (
              <span className="text-[10px] text-gold-400">Set segment before publishing</span>
            )}
            {item.notes && <span className="text-[10px] text-charcoal-600 ml-auto">Notes: {item.notes}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function AddScanForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ partDescription: "", application: "", segment: "automotive", make: "", model: "", yearStart: "", yearEnd: "", condition: "Intact but worn", contributorName: "", contributorEmail: "", notes: "" });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.partDescription || !form.application) { setError("Part description and application required"); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch("/api/admin/scans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, yearStart: form.yearStart ? parseInt(form.yearStart) : null, yearEnd: form.yearEnd ? parseInt(form.yearEnd) : null }) });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setForm({ partDescription: "", application: "", segment: "automotive", make: "", model: "", yearStart: "", yearEnd: "", condition: "Intact but worn", contributorName: "", contributorEmail: "", notes: "" });
      setOpen(false); onCreated();
    } catch { setError("Network error"); } finally { setSaving(false); }
  };

  const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls = "block text-[10px] font-semibold text-charcoal-400 mb-1.5 uppercase tracking-wider";

  if (!open) return <button onClick={() => setOpen(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors">+ Add to Queue</button>;

  return (
    <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Add Scan Queue Item</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-charcoal-500 hover:text-charcoal-300">Cancel</button>
      </div>
      {error && <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 mb-4 text-xs text-red-400">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="sm:col-span-2 lg:col-span-3"><label className={labelCls}>Part Name / Description *</label><input value={form.partDescription} onChange={(e) => set("partDescription", e.target.value)} placeholder="e.g., Battery Tray, Alternator Bracket" className={inputCls} /></div>
        <div>
          <label className={labelCls}>Segment</label>
          <select value={form.segment} onChange={(e) => set("segment", e.target.value)} className={inputCls}>
            <option value="automotive">Classic Automotive</option>
            <option value="tractor">Vintage Tractors</option>
            <option value="marine">Marine & Outboard</option>
            <option value="motorcycle">Vintage Motorcycle</option>
            <option value="industrial">Industrial & Machinery</option>
          </select>
        </div>
        <div><label className={labelCls}>Make</label><input value={form.make} onChange={(e) => set("make", e.target.value)} placeholder="e.g., Ford" className={inputCls} /></div>
        <div><label className={labelCls}>Model</label><input value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g., 8N" className={inputCls} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className={labelCls}>Year Start</label><input type="number" value={form.yearStart} onChange={(e) => set("yearStart", e.target.value)} placeholder="1939" className={inputCls} /></div>
          <div><label className={labelCls}>Year End</label><input type="number" value={form.yearEnd} onChange={(e) => set("yearEnd", e.target.value)} placeholder="1952" className={inputCls} /></div>
        </div>
        <div className="sm:col-span-2"><label className={labelCls}>Application / Fitment *</label><input value={form.application} onChange={(e) => set("application", e.target.value)} placeholder="e.g., 1939–1952 Ford 8N / 9N / 2N" className={inputCls} /></div>
        <div><label className={labelCls}>Condition</label><select value={form.condition} onChange={(e) => set("condition", e.target.value)} className={inputCls}><option>Intact but worn</option><option>Cracked or broken</option><option>Heavily corroded</option><option>Missing pieces</option></select></div>
        <div><label className={labelCls}>Contributor</label><input value={form.contributorName} onChange={(e) => set("contributorName", e.target.value)} placeholder="Name or shop" className={inputCls} /></div>
        <div><label className={labelCls}>Email</label><input value={form.contributorEmail} onChange={(e) => set("contributorEmail", e.target.value)} placeholder="Email" className={inputCls} /></div>
      </div>
      <div className="mt-5 flex gap-3">
        <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider disabled:opacity-50">{saving ? "Saving..." : "Add"}</button>
        <button onClick={() => setOpen(false)} className="px-6 py-2.5 border border-charcoal-700 text-charcoal-400 text-xs rounded uppercase tracking-wider">Cancel</button>
      </div>
    </div>
  );
}

export default function ScansAdmin() {
  const [items, setItems] = useState<ScanItem[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({ received: 0, scanning: 0, modeling: 0, complete: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scans");
      const data = await res.json();
      if (data.success) { setItems(data.items); setPipeline(data.pipeline); }
      else setError(data.error);
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan Queue</h1>
          <p className="text-sm text-charcoal-400 mt-1">Donor parts: receive → scan → model → catalog</p>
        </div>
        <AddScanForm onCreated={fetchData} />
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATUS_FLOW.map((s) => (
          <div key={s} className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-white">{pipeline[s] || 0}</p>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider mt-1 capitalize">{s}</p>
          </div>
        ))}
      </div>

      {error && <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400">{error}<button onClick={fetchData} className="ml-3 underline text-xs">Retry</button></div>}

      {/* Items */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <svg className="animate-spin w-4 h-4 text-charcoal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <span className="text-sm text-charcoal-400">Loading...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-charcoal-300 mb-2">Queue is empty</p>
            <p className="text-sm text-charcoal-500">Add items when donor parts arrive.</p>
          </div>
        ) : (
          <div>
            <div className="px-4 py-2 border-b border-charcoal-800/50 flex items-center gap-4 text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">
              <span className="w-3" />
              <span className="flex-1">Part</span>
              <span>Versions</span>
              <span className="w-20 text-center">Status</span>
              <span className="w-24">Contributor</span>
            </div>
            {items.map((item) => <ScanItemRow key={item.id} item={item} onRefresh={fetchData} />)}
          </div>
        )}
      </div>
    </div>
  );
}
