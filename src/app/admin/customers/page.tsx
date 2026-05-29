"use client";

import { useState, useEffect, useCallback } from "react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  is_shop_account: boolean;
  notes: string | null;
  created_at: string;
  order_count: number;
  total_spent: number;
}

interface Order {
  id: string;
  status: string;
  total_price: string | null;
  created_at: string;
  notes: string | null;
}

/* ── Add Customer Form ─────────────────────────────────────────────── */

function AddCustomerForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    is_shop_account: false,
    notes: "",
  });

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      setError("Name and email are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
        return;
      }
      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        is_shop_account: false,
        notes: "",
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
        + Add Customer
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
        <h3 className="text-sm font-bold text-white">Add New Customer</h3>
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
        <div>
          <label className={labelCls}>Name *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="John Doe"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="john@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="(555) 123-4567"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Company</label>
          <input
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Acme Tractor Repair"
            className={inputCls}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={form.is_shop_account}
              onClick={() => set("is_shop_account", !form.is_shop_account)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.is_shop_account ? "bg-emerald-500" : "bg-charcoal-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  form.is_shop_account ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-xs text-charcoal-300">
              Shop Account (B2B)
            </span>
          </label>
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <label className={labelCls}>Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Internal notes about this customer..."
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs rounded uppercase tracking-wider transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Create Customer"}
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

/* ── Inline edit fields for expanded row ───────────────────────────── */

function EditableCustomerFields({
  customer,
  onSaved,
}: {
  customer: Customer;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: customer.name,
    email: customer.email,
    phone: customer.phone || "",
    company: customer.company || "",
    is_shop_account: customer.is_shop_account,
    notes: customer.notes || "",
  });

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const inputCls =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded px-2.5 py-1.5 text-xs text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls =
    "text-[9px] text-charcoal-500 uppercase tracking-wider";

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id, ...form }),
      });
      const data = await res.json();
      if (data.success) {
        setEditing(false);
        onSaved();
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">
            Customer Details
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
          <div>
            <span className={labelCls}>Name</span>
            <p className="text-charcoal-200">{customer.name}</p>
          </div>
          <div>
            <span className={labelCls}>Email</span>
            <p className="text-charcoal-200">{customer.email}</p>
          </div>
          <div>
            <span className={labelCls}>Phone</span>
            <p className="text-charcoal-200">{customer.phone || "—"}</p>
          </div>
          <div>
            <span className={labelCls}>Company</span>
            <p className="text-charcoal-200">{customer.company || "—"}</p>
          </div>
          {customer.notes && (
            <div className="col-span-2 sm:col-span-4">
              <span className={labelCls}>Notes</span>
              <p className="text-charcoal-200 whitespace-pre-wrap">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-charcoal-950/40 rounded-lg p-3 border border-emerald-500/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-semibold">
          Editing Customer
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="text-[11px] text-charcoal-500 hover:text-charcoal-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>Name</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Company</label>
          <input
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              role="switch"
              aria-checked={form.is_shop_account}
              onClick={() => set("is_shop_account", !form.is_shop_account)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                form.is_shop_account ? "bg-emerald-500" : "bg-charcoal-700"
              }`}
            >
              <span
                className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${
                  form.is_shop_account ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-[10px] text-charcoal-300">
              Shop Account
            </span>
          </label>
        </div>
        <div className="col-span-2 sm:col-span-4">
          <label className={labelCls}>Notes</label>
          <textarea
            rows={2}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Status badge helper ───────────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  pending_quote: "bg-charcoal-800 text-charcoal-400",
  quoted: "bg-blue-500/10 text-blue-400",
  paid: "bg-emerald-500/10 text-emerald-400",
  queued: "bg-gold-500/10 text-gold-400",
  in_progress: "bg-copper-500/10 text-copper-400",
  qc: "bg-purple-500/10 text-purple-400",
  shipped: "bg-blue-500/10 text-blue-400",
  delivered: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "bg-charcoal-800 text-charcoal-400";
  const label = status.replace(/_/g, " ");
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${color}`}
    >
      {label}
    </span>
  );
}

/* ── Expanded customer row ─────────────────────────────────────────── */

function CustomerRow({
  customer,
  onRefresh,
}: {
  customer: Customer;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(
        `/api/admin/customers/orders?customerId=${customer.id}`
      );
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {
      /* ignore */
    } finally {
      setLoadingOrders(false);
      setOrdersLoaded(true);
    }
  }, [customer.id]);

  useEffect(() => {
    if (expanded && !ordersLoaded) loadOrders();
  }, [expanded, ordersLoaded, loadOrders]);

  const joined = new Date(customer.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="border-b border-charcoal-800/30">
      {/* Summary row */}
      <div
        className="flex items-center gap-4 py-3 px-4 hover:bg-charcoal-900/30 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Expand chevron */}
        <svg
          className={`w-3 h-3 text-charcoal-600 transition-transform shrink-0 ${
            expanded ? "rotate-90" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-white truncate">
              {customer.name}
            </p>
            {customer.is_shop_account && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 tracking-wider">
                B2B
              </span>
            )}
          </div>
          <p className="text-[11px] text-charcoal-500 truncate">
            {customer.email}
          </p>
        </div>

        {/* Company */}
        <span className="text-xs text-charcoal-400 hidden lg:block w-36 truncate">
          {customer.company || "—"}
        </span>

        {/* Phone */}
        <span className="text-xs text-charcoal-500 hidden xl:block w-32 truncate">
          {customer.phone || "—"}
        </span>

        {/* Orders */}
        <span className="text-xs text-charcoal-400 w-16 text-right tabular-nums">
          {customer.order_count}{" "}
          <span className="text-charcoal-600">
            {customer.order_count === 1 ? "order" : "orders"}
          </span>
        </span>

        {/* Total spent */}
        <span className="text-xs text-emerald-400 font-medium w-20 text-right tabular-nums">
          {Number(customer.total_spent) > 0
            ? `$${Number(customer.total_spent).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            : "—"}
        </span>

        {/* Joined */}
        <span className="text-[11px] text-charcoal-500 w-24 text-right hidden md:block">
          {joined}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-5 pl-11 space-y-4">
          {/* Editable fields */}
          <EditableCustomerFields customer={customer} onSaved={onRefresh} />

          {/* Orders list */}
          <div className="bg-charcoal-950/40 rounded-lg p-3 border border-charcoal-800/30">
            <span className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">
              Orders ({customer.order_count})
            </span>

            {loadingOrders ? (
              <div className="flex items-center gap-2 py-4 justify-center">
                <svg
                  className="animate-spin w-3 h-3 text-charcoal-500"
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
                <span className="text-[11px] text-charcoal-500">
                  Loading orders...
                </span>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-[10px] text-charcoal-600 py-3">
                No orders yet
              </p>
            ) : (
              <div className="mt-2 space-y-1.5">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-charcoal-950/60 border border-charcoal-800/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-charcoal-500 font-mono">
                        {order.id.slice(0, 8)}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <div className="flex items-center gap-4">
                      {order.total_price && (
                        <span className="text-xs text-emerald-400 font-medium tabular-nums">
                          $
                          {Number(order.total_price).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                      <span className="text-[10px] text-charcoal-500">
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────── */

export default function CustomersAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number } | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        if (data.pagination) setPagination(data.pagination);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const shopCount = customers.filter((c) => c.is_shop_account).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-sm text-charcoal-400 mt-1">
            {customers.length} customers{shopCount > 0 ? ` · ${shopCount} shop accounts` : ""}
          </p>
        </div>
        <AddCustomerForm onCreated={fetchCustomers} />
      </div>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email, or company..."
          className="bg-charcoal-900 border border-charcoal-800/50 rounded-lg px-3 py-2 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 w-80"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400">
          {error}
          <button onClick={fetchCustomers} className="ml-3 text-xs underline">
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center gap-4 py-2 px-4 border-b border-charcoal-800/50 text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold">
          <span className="w-3" />
          <span className="flex-1">Customer</span>
          <span className="w-36 hidden lg:block">Company</span>
          <span className="w-32 hidden xl:block">Phone</span>
          <span className="w-16 text-right">Orders</span>
          <span className="w-20 text-right">Spent</span>
          <span className="w-24 text-right hidden md:block">Joined</span>
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
            <span className="text-sm text-charcoal-400">
              Loading customers...
            </span>
          </div>
        ) : customers.length === 0 ? (
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
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-charcoal-300 mb-2">
              {search ? "No customers match your search" : "No customers yet"}
            </p>
            <p className="text-sm text-charcoal-500 max-w-sm mx-auto">
              {search
                ? "Try a different search term."
                : 'Click "+ Add Customer" to add your first customer. Shop accounts (B2B) can be flagged for net-30 terms.'}
            </p>
          </div>
        ) : (
          <div>
            {customers.map((customer) => (
              <CustomerRow
                key={customer.id}
                customer={customer}
                onRefresh={fetchCustomers}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-charcoal-500">
            Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 bg-charcoal-900 border border-charcoal-800/50 rounded text-xs text-charcoal-300 font-medium transition-colors hover:bg-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-charcoal-400">
              Page {pagination.page} of {Math.max(1, Math.ceil(pagination.total / pagination.limit))}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
              className="px-3 py-1.5 bg-charcoal-900 border border-charcoal-800/50 rounded text-xs text-charcoal-300 font-medium transition-colors hover:bg-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
