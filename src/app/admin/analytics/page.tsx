"use client";

import { useState, useEffect } from "react";

interface MonthlyRevenue {
  month: string;
  revenue: string;
  order_count: number;
}

interface TopPart {
  id: string;
  name: string;
  times_sold: number;
  unit_price: string;
  segment: string;
}

interface OrderByStatus {
  status: string;
  count: number;
}

interface RecentOrder {
  id: string;
  status: string;
  total_price: string | null;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
}

interface AnalyticsData {
  monthlyRevenue: MonthlyRevenue[];
  topParts: TopPart[];
  ordersByStatus: OrderByStatus[];
  totalRevenue: string;
  totalOrders: number;
  monthRevenue: string;
  monthOrders: number;
  recentOrders: RecentOrder[];
}

const STATUS_COLORS: Record<string, string> = {
  pending_quote: "bg-charcoal-700 text-charcoal-300",
  quoted: "bg-blue-500/15 text-blue-400",
  paid: "bg-emerald-500/15 text-emerald-400",
  queued: "bg-gold-500/15 text-gold-400",
  in_progress: "bg-amber-500/15 text-amber-400",
  qc: "bg-purple-500/15 text-purple-400",
  shipped: "bg-blue-500/15 text-blue-400",
  delivered: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d);
        else setError(d.error);
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <svg className="animate-spin w-5 h-5 text-charcoal-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm text-charcoal-400">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-6 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const maxRevenue = Math.max(
    ...data.monthlyRevenue.map((m) => parseFloat(m.revenue)),
    1
  );

  const totalRevenue = parseFloat(data.totalRevenue);
  const monthRevenue = parseFloat(data.monthRevenue);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-charcoal-400 mt-1">Revenue and order insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5">
          <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-extrabold text-white mt-1">
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-charcoal-500 mt-1">All time</p>
        </div>
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5">
          <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">This Month</p>
          <p className="text-3xl font-extrabold text-white mt-1">
            ${monthRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-charcoal-500 mt-1">{data.monthOrders} orders</p>
        </div>
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5">
          <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-extrabold text-white mt-1">{data.totalOrders}</p>
          <p className="text-[11px] text-charcoal-500 mt-1">Paid + fulfilled</p>
        </div>
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5">
          <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">Conversion Rate</p>
          <p className="text-3xl font-extrabold text-white mt-1">{data.totalOrders}</p>
          <p className="text-[11px] text-charcoal-500 mt-1">Completed orders</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 mb-10">
        <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider mb-6">
          Monthly Revenue (Last 12 Months)
        </h2>
        {data.monthlyRevenue.length === 0 ? (
          <p className="text-sm text-charcoal-500 text-center py-10">No revenue data yet</p>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {data.monthlyRevenue.map((m) => {
              const rev = parseFloat(m.revenue);
              const pct = maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0;
              const date = new Date(m.month);
              const label = date.toLocaleDateString("en-US", { month: "short" });
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-charcoal-400 font-mono">
                    ${rev >= 1000 ? `${(rev / 1000).toFixed(1)}k` : rev.toFixed(0)}
                  </span>
                  <div
                    className="w-full bg-emerald-500/60 rounded-t hover:bg-emerald-500/80 transition-colors min-h-[2px]"
                    style={{ height: `${Math.max(pct, 1)}%` }}
                    title={`${label}: $${rev.toFixed(2)} (${m.order_count} orders)`}
                  />
                  <span className="text-[9px] text-charcoal-500">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        {/* Top selling parts */}
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-800/50">
            <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider">
              Top Selling Parts
            </h2>
          </div>
          <div className="divide-y divide-charcoal-800/30">
            {data.topParts.length === 0 ? (
              <p className="text-sm text-charcoal-500 text-center py-8">No sales data yet</p>
            ) : (
              data.topParts.map((p, i) => (
                <div key={p.id} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs text-charcoal-500 font-mono w-5">{i + 1}.</span>
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{p.name}</p>
                      <p className="text-[10px] text-charcoal-500 capitalize">{p.segment}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-charcoal-400">{p.times_sold} sold</span>
                    {parseFloat(p.unit_price) > 0 && (
                      <span className="text-xs text-emerald-400 font-medium">
                        ${(parseFloat(p.unit_price) * p.times_sold).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Orders by status */}
        <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-800/50">
            <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider">
              Orders by Status
            </h2>
          </div>
          <div className="p-6 space-y-2">
            {data.ordersByStatus.length === 0 ? (
              <p className="text-sm text-charcoal-500 text-center py-4">No orders yet</p>
            ) : (
              data.ordersByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase ${STATUS_COLORS[s.status] || "bg-charcoal-700 text-charcoal-300"}`}>
                    {s.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-white font-medium">{s.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-800/50">
          <h2 className="text-sm font-bold text-charcoal-300 uppercase tracking-wider">
            Recent Orders
          </h2>
        </div>
        <div className="divide-y divide-charcoal-800/30">
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-charcoal-500 text-center py-8">No orders yet</p>
          ) : (
            data.recentOrders.map((o) => (
              <div key={o.id} className="px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold uppercase shrink-0 ${STATUS_COLORS[o.status] || "bg-charcoal-700 text-charcoal-300"}`}>
                    {o.status.replace(/_/g, " ")}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">
                      {o.customer_name || o.customer_email || "Guest"}
                    </p>
                    <p className="text-[10px] text-charcoal-500">
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-white font-medium shrink-0">
                  {o.total_price ? `$${parseFloat(o.total_price).toFixed(2)}` : "--"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
