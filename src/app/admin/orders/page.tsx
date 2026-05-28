"use client";

import { useState, useEffect, useCallback } from "react";

/* ─── Types ─── */

interface Order {
  id: string;
  customer_id: string | null;
  status: string;
  total_price: string | null;
  rush_order: boolean;
  shipping_method: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_company: string | null;
  item_count: number;
  total_quantity: number;
}

interface LineItem {
  id: string;
  order_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: string | null;
  total_price: string | null;
  status: string;
  notes: string | null;
  tier: string | null;
  material: string | null;
  process: string | null;
  part_name: string | null;
  part_number: string | null;
  application: string | null;
}

interface Stats {
  total_orders: number;
  pending_count: number;
  in_progress_count: number;
  shipped_count: number;
  delivered_count: number;
  total_revenue: string;
}

/* ─── Constants ─── */

const ORDER_STATUSES = [
  { id: "pending_quote", label: "Pending Quote" },
  { id: "quoted", label: "Quoted" },
  { id: "paid", label: "Paid" },
  { id: "queued", label: "Queued" },
  { id: "in_progress", label: "In Progress" },
  { id: "qc", label: "QC" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

function statusColor(status: string): string {
  switch (status) {
    case "pending_quote":
      return "bg-gold-500/10 text-gold-400 border-gold-500/20";
    case "quoted":
      return "bg-gold-500/10 text-gold-400 border-gold-500/20";
    case "paid":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "queued":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "in_progress":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "qc":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "shipped":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "delivered":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-charcoal-800 text-charcoal-400";
  }
}

function statusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.id === status)?.label || status;
}

function shortId(id: string): string {
  return id.slice(0, 8).toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(amount: string | null): string {
  if (!amount) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(amount));
}

/* ─── Summary Bar ─── */

function SummaryBar({ stats, loading }: { stats: Stats | null; loading: boolean }) {
  const items = [
    {
      label: "Total Orders",
      value: stats?.total_orders ?? 0,
      color: "text-white",
    },
    {
      label: "Pending",
      value: stats?.pending_count ?? 0,
      color: "text-gold-400",
    },
    {
      label: "In Progress",
      value: stats?.in_progress_count ?? 0,
      color: "text-emerald-400",
    },
    {
      label: "Shipped",
      value: stats?.shipped_count ?? 0,
      color: "text-purple-400",
    },
    {
      label: "Revenue",
      value: formatCurrency(stats?.total_revenue ?? "0"),
      color: "text-emerald-400",
      isRevenue: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
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
            <p className={`text-xl font-bold ${item.color}`}>
              {item.isRevenue ? item.value : item.value}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Line Items Detail ─── */

function LineItemsDetail({ orderId, editable, onPricesChanged }: { orderId: string; editable: boolean; onPricesChanged?: () => void }) {
  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/orders/items?orderId=${orderId}`);
        const data = await res.json();
        if (data.success) setItems(data.items);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <svg
          className="animate-spin w-3.5 h-3.5 text-charcoal-500"
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
        <span className="text-xs text-charcoal-500">Loading line items...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-[11px] text-charcoal-600 py-3">
        No line items on this order.
      </p>
    );
  }

  const savePrice = async (itemId: string, qty: number) => {
    const price = editPrices[itemId];
    if (!price) return;
    setSaving(itemId);
    try {
      await fetch("/api/admin/orders/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, unitPrice: price, quantity: qty }),
      });
      setItems((prev) => prev.map((i) => i.id === itemId ? { ...i, unit_price: price, total_price: (parseFloat(price) * qty).toFixed(2) } : i));
      onPricesChanged?.();
    } catch { /* ignore */ }
    finally { setSaving(null); }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const currentPrice = editPrices[item.id] ?? item.unit_price ?? "";
        const isEdited = editPrices[item.id] !== undefined && editPrices[item.id] !== (item.unit_price ?? "");
        return (
          <div
            key={item.id}
            className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30"
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-charcoal-200 font-medium">
                  {item.part_name || item.notes || "Unknown Part"}
                </p>
                <p className="text-[10px] text-charcoal-500 truncate">
                  {item.application || item.part_number || "—"}
                </p>
              </div>
              {editable ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-charcoal-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={currentPrice}
                    onChange={(e) => setEditPrices((p) => ({ ...p, [item.id]: e.target.value }))}
                    className="w-24 bg-charcoal-950 border border-charcoal-700/50 rounded px-2 py-1 text-sm text-charcoal-100 text-right focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    placeholder="0.00"
                  />
                  {isEdited && (
                    <button
                      onClick={() => savePrice(item.id, item.quantity)}
                      disabled={saving === item.id}
                      className="text-[9px] px-2 py-1 bg-emerald-500 text-white rounded font-semibold uppercase disabled:opacity-50"
                    >
                      {saving === item.id ? "..." : "Save"}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-charcoal-200 font-medium shrink-0">
                  {formatCurrency(item.total_price)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              {item.tier && (
                <span
                  className={`px-1.5 py-0.5 rounded font-semibold uppercase ${
                    item.tier === "oem"
                      ? "bg-blue-500/10 text-blue-400"
                      : item.tier === "improved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : item.tier === "fitment_check"
                          ? "bg-gold-500/10 text-gold-400"
                          : "bg-charcoal-800 text-charcoal-400"
                  }`}
                >
                  {item.tier === "fitment_check" ? "3D Fit" : item.tier}
                </span>
              )}
              <span className="text-charcoal-400">{item.material || "—"}</span>
              <span className="text-charcoal-500">× {item.quantity}</span>
              {!editable && <span className="text-charcoal-500">{formatCurrency(item.unit_price)}/ea</span>}
              {editable && item.unit_price && <span className="text-charcoal-500">current: {formatCurrency(item.unit_price)}/ea → ${currentPrice ? (parseFloat(currentPrice) * item.quantity).toFixed(2) : "0.00"} total</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Order Row ─── */

function OrderRow({
  order,
  onUpdated,
}: {
  order: Order;
  onUpdated: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editStatus, setEditStatus] = useState(order.status);
  const [editTracking, setEditTracking] = useState(order.tracking_number || "");
  const [editNotes, setEditNotes] = useState(order.notes || "");
  const [showTrackingField, setShowTrackingField] = useState(
    order.status === "shipped" || order.status === "delivered"
  );
  const [confirming, setConfirming] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const isPending = order.status === "pending_quote" || order.status === "quoted";

  // Sync local state when order prop changes
  useEffect(() => {
    setEditStatus(order.status);
    setEditTracking(order.tracking_number || "");
    setEditNotes(order.notes || "");
    setShowTrackingField(
      order.status === "shipped" || order.status === "delivered"
    );
  }, [order]);

  const handleStatusChange = async (newStatus: string) => {
    setEditStatus(newStatus);
    setShowTrackingField(
      newStatus === "shipped" || newStatus === "delivered"
    );

    // If changing to shipped and no tracking yet, don't auto-save, let them enter tracking
    if (
      (newStatus === "shipped" || newStatus === "delivered") &&
      !editTracking
    ) {
      return;
    }

    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) onUpdated();
    } catch {
      /* ignore */
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveDetails = async () => {
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.id,
          status: editStatus,
          trackingNumber: editTracking || null,
          notes: editNotes || null,
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

  const handleConfirmPricing = async () => {
    setConfirming(true);
    setConfirmError(null);
    try {
      const res = await fetch("/api/admin/orders/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.paymentUrl) setPaymentUrl(data.paymentUrl);
        onUpdated();
      } else {
        setConfirmError(data.error);
      }
    } catch {
      setConfirmError("Failed to confirm pricing");
    } finally {
      setConfirming(false);
    }
  };

  const inputCls =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded px-2.5 py-1.5 text-xs text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls =
    "text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold mb-1";

  return (
    <div className="border-b border-charcoal-800/30">
      {/* Collapsed row */}
      <div
        className="py-3 px-4 hover:bg-charcoal-900/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Mobile card layout */}
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
                <p className="text-sm font-mono font-medium text-white">
                  #{shortId(order.id)}
                </p>
                {order.rush_order && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold uppercase">
                    Rush
                  </span>
                )}
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border shrink-0 ${statusColor(order.status)}`}
              >
                {statusLabel(order.status)}
              </span>
            </div>

            <p className="text-sm text-charcoal-200 truncate">
              {order.customer_name || "Walk-in"}
            </p>
            <p className="text-[11px] text-charcoal-500 truncate">
              {order.customer_email || order.customer_company || "—"}
            </p>

            <div className="flex items-center gap-4 mt-1.5 text-xs text-charcoal-400">
              <span>{order.item_count} item{order.item_count !== 1 ? "s" : ""}</span>
              <span className="font-medium text-charcoal-200">{formatCurrency(order.total_price)}</span>
              <span className="hidden sm:inline">{formatDate(order.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-5 sm:pl-11 space-y-4">
          {/* Status + tracking controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className={labelCls}>Status</p>
              <select
                value={editStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className={inputCls}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {showTrackingField && (
              <div>
                <p className={labelCls}>Tracking Number</p>
                <input
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  placeholder="Enter tracking number..."
                  className={inputCls}
                />
              </div>
            )}

            <div>
              <p className={labelCls}>Notes</p>
              <input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Internal notes..."
                className={inputCls}
              />
            </div>
          </div>

          {/* Save button if there are unsaved changes */}
          {(editStatus !== order.status ||
            editTracking !== (order.tracking_number || "") ||
            editNotes !== (order.notes || "")) && (
            <div>
              <button
                onClick={handleSaveDetails}
                disabled={updating}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded uppercase tracking-wider transition-colors disabled:opacity-50"
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {/* Order metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
            <div>
              <p className={labelCls}>Order ID</p>
              <p className="text-[11px] text-charcoal-300 font-mono break-all">
                {order.id}
              </p>
            </div>
            <div>
              <p className={labelCls}>Shipping</p>
              <p className="text-[11px] text-charcoal-300">
                {order.shipping_method || "—"}
              </p>
            </div>
            <div>
              <p className={labelCls}>Created</p>
              <p className="text-[11px] text-charcoal-300">
                {formatDate(order.created_at)}
              </p>
            </div>
            <div>
              <p className={labelCls}>Last Updated</p>
              <p className="text-[11px] text-charcoal-300">
                {formatDate(order.updated_at)}
              </p>
            </div>
            {order.shipped_at && (
              <div>
                <p className={labelCls}>Shipped</p>
                <p className="text-[11px] text-charcoal-300">
                  {formatDate(order.shipped_at)}
                </p>
              </div>
            )}
            {order.tracking_number && (
              <div>
                <p className={labelCls}>Tracking</p>
                <p className="text-[11px] text-charcoal-300 font-mono">
                  {order.tracking_number}
                </p>
              </div>
            )}
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">
                Line Items ({order.item_count})
              </p>
              {isPending && (
                <span className="text-[9px] text-gold-400/80">Edit prices below, then confirm</span>
              )}
            </div>
            <LineItemsDetail orderId={order.id} editable={isPending} onPricesChanged={onUpdated} />
          </div>

          {/* Confirm pricing + payment link */}
          {isPending && (
            <div className="bg-gold-500/3 border border-gold-500/15 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-charcoal-200">Confirm Pricing</p>
                  <p className="text-xs text-charcoal-500 mt-0.5">Review and set final prices above, then confirm to generate a Stripe payment link for the customer.</p>
                </div>
              </div>
              {confirmError && (
                <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-2">
                  <p className="text-[11px] text-red-400">{confirmError}</p>
                </div>
              )}
              <button
                onClick={handleConfirmPricing}
                disabled={confirming}
                className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-charcoal-950 font-bold text-sm rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {confirming ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Generating payment link...</>
                ) : "Confirm Pricing & Generate Payment Link"}
              </button>
            </div>
          )}

          {/* Payment link display */}
          {paymentUrl && (
            <div className="bg-emerald-500/3 border border-emerald-500/15 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-emerald-300">Payment Link Ready</p>
                  <p className="text-xs text-charcoal-500 mt-0.5">Send this link to {order.customer_email || "the customer"} to collect payment.</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      readOnly
                      value={paymentUrl}
                      className="flex-1 bg-charcoal-950 border border-charcoal-700/50 rounded px-2.5 py-1.5 text-xs text-charcoal-300 font-mono truncate focus:outline-none"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                    />
                    <button
                      onClick={() => { navigator.clipboard.writeText(paymentUrl); }}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-[10px] font-bold rounded uppercase tracking-wider shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setStats(data.stats);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const STATUS_FILTERS = [
    { id: "all", label: "All" },
    { id: "pending_quote", label: "Pending" },
    { id: "quoted", label: "Quoted" },
    { id: "paid", label: "Paid" },
    { id: "in_progress", label: "In Progress" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            Production queue and fulfillment
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <SummaryBar stats={stats} loading={loading} />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, email, order ID..."
          className="bg-charcoal-900 border border-charcoal-800/50 rounded-lg px-3 py-2 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 w-full sm:w-72"
        />
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
          <button onClick={fetchOrders} className="ml-3 text-xs underline">
            Retry
          </button>
        </div>
      )}

      {/* Orders list */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:flex items-center gap-4 py-2.5 px-4 border-b border-charcoal-800/50 bg-charcoal-900/50">
          <div className="w-3" /> {/* chevron spacer */}
          <span className="w-24 text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">
            Order
          </span>
          <span className="flex-1 text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">
            Customer
          </span>
          <span className="w-24 text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">
            Status
          </span>
          <span className="w-16 text-right text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">
            Items
          </span>
          <span className="w-24 text-right text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">
            Total
          </span>
          <span className="w-28 text-right text-[9px] text-charcoal-500 uppercase tracking-wider font-semibold">
            Date
          </span>
        </div>

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
            <span className="text-sm text-charcoal-400">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
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
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              {statusFilter !== "all" ? "No matching orders" : "No orders yet"}
            </h3>
            <p className="text-sm text-charcoal-500 max-w-sm mx-auto">
              {statusFilter !== "all"
                ? `No orders with status "${statusLabel(statusFilter)}" found.`
                : "Orders will appear here when customers place them through the catalog."}
            </p>
          </div>
        ) : (
          <div>
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} onUpdated={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
