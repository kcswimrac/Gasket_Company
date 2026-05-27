"use client";

import { useState, useEffect, useCallback } from "react";

interface ScanItem {
  id: string;
  part_description: string;
  application: string;
  condition: string | null;
  status: string;
  contributor_name: string | null;
  notes: string | null;
  received_at: string;
  scanned_at: string | null;
  completed_at: string | null;
}

const STATUS_FLOW = ["received", "scanning", "modeling", "complete"];
const STATUS_COLORS: Record<string, string> = {
  received: "bg-gold-500/10 text-gold-400",
  scanning: "bg-blue-500/10 text-blue-400",
  modeling: "bg-copper-500/10 text-copper-400",
  complete: "bg-emerald-500/10 text-emerald-400",
};

function AddScanForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    partDescription: "", application: "", condition: "Intact but worn",
    contributorName: "", contributorEmail: "", notes: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.partDescription || !form.application) {
      setError("Part description and application are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setForm({ partDescription: "", application: "", condition: "Intact but worn", contributorName: "", contributorEmail: "", notes: "" });
      setOpen(false);
      onCreated();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  };

  const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls = "block text-[10px] font-semibold text-charcoal-400 mb-1.5 uppercase tracking-wider";

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors">
        + Add to Queue
      </button>
    );
  }

  return (
    <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Add Scan Queue Item</h3>
        <button onClick={() => setOpen(false)} className="text-xs text-charcoal-500 hover:text-charcoal-300">Cancel</button>
      </div>

      {error && <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 mb-4 text-xs text-red-400">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className={labelCls}>Part Description *</label><input value={form.partDescription} onChange={(e) => set("partDescription", e.target.value)} placeholder="e.g., Battery tray, alternator bracket" className={inputCls} /></div>
        <div className="sm:col-span-2"><label className={labelCls}>Application / Fitment *</label><input value={form.application} onChange={(e) => set("application", e.target.value)} placeholder="Year, make, model" className={inputCls} /></div>
        <div>
          <label className={labelCls}>Condition</label>
          <select value={form.condition} onChange={(e) => set("condition", e.target.value)} className={inputCls}>
            <option>Intact but worn</option>
            <option>Cracked or broken</option>
            <option>Heavily corroded</option>
            <option>Missing pieces — partial</option>
          </select>
        </div>
        <div><label className={labelCls}>Contributor Name</label><input value={form.contributorName} onChange={(e) => set("contributorName", e.target.value)} placeholder="Name or shop" className={inputCls} /></div>
        <div><label className={labelCls}>Contributor Email</label><input value={form.contributorEmail} onChange={(e) => set("contributorEmail", e.target.value)} placeholder="Email" className={inputCls} /></div>
        <div><label className={labelCls}>Notes</label><input value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Internal notes" className={inputCls} /></div>
      </div>

      <div className="mt-5 flex gap-3">
        <button onClick={handleSubmit} disabled={saving} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Add to Queue"}
        </button>
        <button onClick={() => setOpen(false)} className="px-6 py-2.5 border border-charcoal-700 text-charcoal-400 text-xs rounded uppercase tracking-wider transition-colors">Cancel</button>
      </div>
    </div>
  );
}

export default function ScansAdmin() {
  const [items, setItems] = useState<ScanItem[]>([]);
  const [pipeline, setPipeline] = useState<Record<string, number>>({ received: 0, scanning: 0, modeling: 0, complete: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/scans");
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setPipeline(data.pipeline);
      } else {
        setError(data.error);
      }
    } catch { setError("Failed to load"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await fetch("/api/admin/scans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetch_();
    } catch { /* ignore */ }
    finally { setUpdating(null); }
  };

  const nextStatus = (current: string) => {
    const idx = STATUS_FLOW.indexOf(current);
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Scan Queue</h1>
          <p className="text-sm text-charcoal-400 mt-1">Donor parts in the scan → model → catalog pipeline</p>
        </div>
        <AddScanForm onCreated={fetch_} />
      </div>

      {/* Pipeline counts */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        {STATUS_FLOW.map((s) => (
          <div key={s} className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-extrabold text-white">{pipeline[s] || 0}</p>
            <p className="text-[10px] text-charcoal-500 uppercase tracking-wider mt-1 capitalize">{s}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400">
          {error}<button onClick={fetch_} className="ml-3 underline text-xs">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <svg className="animate-spin w-4 h-4 text-charcoal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <span className="text-sm text-charcoal-400">Loading queue...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-base font-medium text-charcoal-300 mb-2">Scan queue is empty</p>
            <p className="text-sm text-charcoal-500">Click &quot;+ Add to Queue&quot; when you receive a donor part.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-800/50">
                  {["Part", "Application", "Contributor", "Condition", "Status", "Received", "Actions"].map((h) => (
                    <th key={h} className="py-3 px-4 text-left text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const next = nextStatus(item.status);
                  return (
                    <tr key={item.id} className="border-b border-charcoal-800/30 hover:bg-charcoal-900/30 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-sm text-white font-medium">{item.part_description}</p>
                        {item.notes && <p className="text-[10px] text-charcoal-600 mt-0.5">{item.notes}</p>}
                      </td>
                      <td className="py-3 px-4 text-xs text-charcoal-400">{item.application}</td>
                      <td className="py-3 px-4 text-xs text-charcoal-400">{item.contributor_name || "—"}</td>
                      <td className="py-3 px-4 text-xs text-charcoal-400">{item.condition || "—"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${STATUS_COLORS[item.status] || ""}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-charcoal-500">{formatDate(item.received_at)}</td>
                      <td className="py-3 px-4">
                        {next ? (
                          <button
                            onClick={() => updateStatus(item.id, next)}
                            disabled={updating === item.id}
                            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50"
                          >
                            {updating === item.id ? "..." : `→ ${next}`}
                          </button>
                        ) : (
                          <span className="text-[11px] text-charcoal-600">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
