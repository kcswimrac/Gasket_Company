"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Types ─── */

interface Bounty {
  id: string;
  title: string;
  description: string | null;
  segment: string | null;
  make: string | null;
  model: string | null;
  year_start: number | null;
  year_end: number | null;
  reward: string | null;
  priority: string;
  status: string;
  claimed_by: string | null;
  claimed_by_name: string | null;
  part_id: string | null;
  part_name: string | null;
  created_at: string;
  updated_at: string;
}

/* ─── Constants ─── */

const SEGMENTS = [
  { id: "tractor", label: "Vintage Tractors" },
  { id: "marine", label: "Marine & Outboard" },
  { id: "automotive", label: "Classic Automotive" },
  { id: "motorcycle", label: "Vintage Motorcycle" },
  { id: "industrial", label: "Industrial & Machinery" },
];

const STATUSES = [
  { id: "open", label: "Open" },
  { id: "claimed", label: "Claimed" },
  { id: "fulfilled", label: "Fulfilled" },
  { id: "closed", label: "Closed" },
];

const PRIORITIES = [
  { id: "high", label: "High" },
  { id: "normal", label: "Normal" },
  { id: "low", label: "Low" },
];

/* ─── Helpers ─── */

function statusColor(status: string): string {
  switch (status) {
    case "open":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "claimed":
      return "bg-gold-500/10 text-gold-400 border-gold-500/20";
    case "fulfilled":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "closed":
      return "bg-charcoal-700/30 text-charcoal-400 border-charcoal-700/30";
    default:
      return "bg-charcoal-800 text-charcoal-400";
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function segmentLabel(id: string | null): string {
  if (!id) return "—";
  return SEGMENTS.find((s) => s.id === id)?.label || id;
}

/* ─── Summary Bar ─── */

function SummaryBar({ bounties, loading }: { bounties: Bounty[]; loading: boolean }) {
  const openCount = bounties.filter((b) => b.status === "open").length;
  const claimedCount = bounties.filter((b) => b.status === "claimed").length;
  const fulfilledCount = bounties.filter((b) => b.status === "fulfilled").length;

  const items = [
    { label: "Open", value: openCount, color: "text-emerald-400" },
    { label: "Claimed", value: claimedCount, color: "text-gold-400" },
    { label: "Fulfilled", value: fulfilledCount, color: "text-blue-400" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-4"
        >
          <p className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold mb-1">
            {item.label}
          </p>
          {loading ? (
            <div className="h-7 w-16 bg-charcoal-800/50 rounded animate-pulse" />
          ) : (
            <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Add Bounty Form ─── */

function AddBountyForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    segment: "",
    make: "",
    model: "",
    yearStart: "",
    yearEnd: "",
    reward: "",
    priority: "normal",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          yearStart: form.yearStart ? parseInt(form.yearStart) : null,
          yearEnd: form.yearEnd ? parseInt(form.yearEnd) : null,
          segment: form.segment || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setForm({
        title: "",
        description: "",
        segment: "",
        make: "",
        model: "",
        yearStart: "",
        yearEnd: "",
        reward: "",
        priority: "normal",
      });
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
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors"
      >
        + Add Bounty
      </button>
    );
  }

  const inputCls =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-3 py-2.5 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls =
    "block text-[10px] font-semibold text-charcoal-400 mb-1.5 uppercase tracking-wider";

  return (
    <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold text-white">Add New Bounty</h3>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-charcoal-500 hover:text-charcoal-300"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 mb-4 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelCls}>Title *</label>
          <input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g., Ford 8N Battery Tray gasket"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelCls}>Description</label>
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="What do you need? Context, OEM part numbers, etc..."
            className={`${inputCls} resize-none`}
          />
        </div>
        <div>
          <label className={labelCls}>Segment</label>
          <select
            value={form.segment}
            onChange={(e) => set("segment", e.target.value)}
            className={inputCls}
          >
            <option value="">— Select —</option>
            {SEGMENTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Make</label>
          <input
            value={form.make}
            onChange={(e) => set("make", e.target.value)}
            placeholder="e.g., Ford"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Model</label>
          <input
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
            placeholder="e.g., 8N"
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelCls}>Year Start</label>
            <input
              type="number"
              value={form.yearStart}
              onChange={(e) => set("yearStart", e.target.value)}
              placeholder="1939"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Year End</label>
            <input
              type="number"
              value={form.yearEnd}
              onChange={(e) => set("yearEnd", e.target.value)}
              placeholder="1952"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Reward</label>
          <input
            value={form.reward}
            onChange={(e) => set("reward", e.target.value)}
            placeholder='e.g., $50 credit or "Part at cost"'
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Priority</label>
          <div className="flex gap-2 mt-1">
            {PRIORITIES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => set("priority", p.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  form.priority === p.id
                    ? p.id === "high"
                      ? "bg-red-500/10 text-red-400 border-red-500/30"
                      : p.id === "low"
                        ? "bg-charcoal-700/30 text-charcoal-300 border-charcoal-600/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "border-charcoal-700/50 text-charcoal-500 hover:text-charcoal-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Bounty"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-6 py-2.5 border border-charcoal-700 text-charcoal-400 hover:text-charcoal-300 text-xs rounded uppercase tracking-wider transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ─── Bounty Row ─── */

function BountyRow({
  bounty,
  onUpdated,
}: {
  bounty: Bounty;
  onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editTitle, setEditTitle] = useState(bounty.title);
  const [editDescription, setEditDescription] = useState(bounty.description || "");
  const [editSegment, setEditSegment] = useState(bounty.segment || "");
  const [editMake, setEditMake] = useState(bounty.make || "");
  const [editModel, setEditModel] = useState(bounty.model || "");
  const [editYearStart, setEditYearStart] = useState(String(bounty.year_start || ""));
  const [editYearEnd, setEditYearEnd] = useState(String(bounty.year_end || ""));
  const [editReward, setEditReward] = useState(bounty.reward || "");
  const [editPriority, setEditPriority] = useState(bounty.priority);
  const [editStatus, setEditStatus] = useState(bounty.status);

  // Sync local state when bounty prop changes
  useEffect(() => {
    setEditTitle(bounty.title);
    setEditDescription(bounty.description || "");
    setEditSegment(bounty.segment || "");
    setEditMake(bounty.make || "");
    setEditModel(bounty.model || "");
    setEditYearStart(String(bounty.year_start || ""));
    setEditYearEnd(String(bounty.year_end || ""));
    setEditReward(bounty.reward || "");
    setEditPriority(bounty.priority);
    setEditStatus(bounty.status);
  }, [bounty]);

  const hasChanges =
    editTitle !== bounty.title ||
    editDescription !== (bounty.description || "") ||
    editSegment !== (bounty.segment || "") ||
    editMake !== (bounty.make || "") ||
    editModel !== (bounty.model || "") ||
    editYearStart !== String(bounty.year_start || "") ||
    editYearEnd !== String(bounty.year_end || "") ||
    editReward !== (bounty.reward || "") ||
    editPriority !== bounty.priority ||
    editStatus !== bounty.status;

  const handleSave = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/bounties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: bounty.id,
          title: editTitle,
          description: editDescription || null,
          segment: editSegment || null,
          make: editMake || null,
          model: editModel || null,
          yearStart: editYearStart ? parseInt(editYearStart) : null,
          yearEnd: editYearEnd ? parseInt(editYearEnd) : null,
          reward: editReward || null,
          priority: editPriority,
          status: editStatus,
        }),
      });
      const data = await res.json();
      if (data.success) onUpdated();
    } catch {
      /* ignore */
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete bounty "${bounty.title}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/bounties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bounty.id }),
      });
      const data = await res.json();
      if (data.success) onUpdated();
    } catch {
      /* ignore */
    } finally {
      setDeleting(false);
    }
  };

  const inputCls =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded px-2.5 py-1.5 text-xs text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls =
    "text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold mb-1";

  const yearDisplay =
    bounty.year_start && bounty.year_end
      ? `${bounty.year_start}–${bounty.year_end}`
      : bounty.year_start
        ? `${bounty.year_start}+`
        : "";

  return (
    <div className="border-b border-charcoal-800/30">
      {/* Collapsed row */}
      <div
        className="py-3 px-4 hover:bg-charcoal-900/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <svg
            className={`w-3 h-3 text-charcoal-600 transition-transform shrink-0 mt-1.5 ${expanded ? "rotate-90" : ""}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clipRule="evenodd"
            />
          </svg>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                {/* Priority indicator */}
                {bounty.priority === "high" && (
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" title="High priority" />
                )}
                {bounty.priority === "low" && (
                  <span className="w-2 h-2 rounded-full bg-charcoal-600 shrink-0" title="Low priority" />
                )}
                <p className="text-sm font-medium text-white truncate">
                  {bounty.title}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border shrink-0 ${statusColor(bounty.status)}`}
              >
                {bounty.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-400">
              {bounty.segment && (
                <span className="capitalize">{segmentLabel(bounty.segment)}</span>
              )}
              {(bounty.make || bounty.model) && (
                <span>
                  {bounty.make || ""} {bounty.model || ""}
                </span>
              )}
              {yearDisplay && <span>{yearDisplay}</span>}
              {bounty.reward && (
                <span className="text-emerald-400/80 font-medium">{bounty.reward}</span>
              )}
              <span className="hidden sm:inline text-charcoal-500">
                {formatDate(bounty.created_at)}
              </span>
            </div>

            {bounty.claimed_by_name && (
              <p className="text-[11px] text-gold-400/70 mt-1">
                Claimed by {bounty.claimed_by_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-5 sm:pl-11 space-y-4">
          {/* Status + Priority controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className={labelCls}>Status</p>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className={inputCls}
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={labelCls}>Priority</p>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className={inputCls}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={labelCls}>Reward</p>
              <input
                value={editReward}
                onChange={(e) => setEditReward(e.target.value)}
                placeholder='e.g., $50 credit'
                className={inputCls}
              />
            </div>
          </div>

          {/* Title + Description */}
          <div className="space-y-3">
            <div>
              <p className={labelCls}>Title</p>
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <p className={labelCls}>Description</p>
              <textarea
                rows={2}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Details about the bounty..."
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Vehicle details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className={labelCls}>Segment</p>
              <select
                value={editSegment}
                onChange={(e) => setEditSegment(e.target.value)}
                className={inputCls}
              >
                <option value="">— None —</option>
                {SEGMENTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <p className={labelCls}>Make</p>
              <input
                value={editMake}
                onChange={(e) => setEditMake(e.target.value)}
                placeholder="e.g., Ford"
                className={inputCls}
              />
            </div>
            <div>
              <p className={labelCls}>Model</p>
              <input
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                placeholder="e.g., 8N"
                className={inputCls}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className={labelCls}>Year Start</p>
                <input
                  type="number"
                  value={editYearStart}
                  onChange={(e) => setEditYearStart(e.target.value)}
                  placeholder="1939"
                  className={inputCls}
                />
              </div>
              <div>
                <p className={labelCls}>Year End</p>
                <input
                  type="number"
                  value={editYearEnd}
                  onChange={(e) => setEditYearEnd(e.target.value)}
                  placeholder="1952"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div>
                <p className={labelCls}>Created</p>
                <p className="text-charcoal-300">{formatDate(bounty.created_at)}</p>
              </div>
              <div>
                <p className={labelCls}>Updated</p>
                <p className="text-charcoal-300">{formatDate(bounty.updated_at)}</p>
              </div>
              {bounty.claimed_by_name && (
                <div>
                  <p className={labelCls}>Claimed By</p>
                  <p className="text-gold-400">{bounty.claimed_by_name}</p>
                </div>
              )}
              {bounty.part_name && (
                <div>
                  <p className={labelCls}>Linked Part</p>
                  <p className="text-blue-400">{bounty.part_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Save / Delete actions */}
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={updating}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[11px] text-red-400/60 hover:text-red-400 font-medium ml-auto disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete Bounty"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function BountiesAdmin() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBounties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/bounties");
      const data = await res.json();
      if (data.success) {
        setBounties(data.bounties);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch bounties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBounties();
  }, [fetchBounties]);

  const filteredBounties =
    statusFilter === "all"
      ? bounties
      : bounties.filter((b) => b.status === statusFilter);

  const STATUS_FILTERS = [
    { id: "all", label: "All" },
    { id: "open", label: "Open" },
    { id: "claimed", label: "Claimed" },
    { id: "fulfilled", label: "Fulfilled" },
    { id: "closed", label: "Closed" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Bounty Board</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Community part requests and rewards
          </p>
        </div>
        <AddBountyForm onCreated={fetchBounties} />
      </div>

      {/* Summary stats */}
      <SummaryBar bounties={bounties} loading={loading} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                statusFilter === f.id
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-charcoal-500 hover:text-charcoal-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400">
          {error}
          <button onClick={fetchBounties} className="ml-3 text-xs underline">
            Retry
          </button>
        </div>
      )}

      {/* Bounties list */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <svg
              className="animate-spin w-4 h-4 text-charcoal-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-sm text-charcoal-400">Loading bounties...</span>
          </div>
        ) : filteredBounties.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-charcoal-800/30 flex items-center justify-center mb-5">
              <svg
                className="w-7 h-7 text-charcoal-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {statusFilter !== "all" ? "No matching bounties" : "No bounties yet"}
            </h3>
            <p className="text-sm text-charcoal-500 max-w-sm mx-auto">
              {statusFilter !== "all"
                ? `No bounties with status "${statusFilter}" found.`
                : 'Click "+ Add Bounty" to post a part request to the bounty board.'}
            </p>
          </div>
        ) : (
          <div>
            {filteredBounties.map((bounty) => (
              <BountyRow key={bounty.id} bounty={bounty} onUpdated={fetchBounties} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
