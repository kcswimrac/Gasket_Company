"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/lib/cart";

interface WishlistItem {
  id: string;
  part_id: string;
  part_name: string;
  make: string | null;
  model: string | null;
  segment: string | null;
  photo_url: string | null;
  created_at: string;
}

interface LineItem {
  id: string;
  quantity: number;
  unit_price: string | null;
  total_price: string | null;
  status: string;
  notes: string | null;
  variant_id: string | null;
}

interface Order {
  id: string;
  status: string;
  total_price: string | null;
  rush_order: boolean;
  shipping_method: string | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  line_items: LineItem[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_quote: { label: "Pending Quote", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  quoted: { label: "Quoted", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  paid: { label: "Paid", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  queued: { label: "In Queue", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  in_progress: { label: "In Progress", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  qc: { label: "Quality Check", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  shipped: { label: "Shipped", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  delivered: { label: "Delivered", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  cancelled: { label: "Cancelled", color: "text-red-400 bg-red-500/10 border-red-500/20" },
};

export default function CustomerAccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [removingWishlist, setRemovingWishlist] = useState<string | null>(null);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [reorderSuccess, setReorderSuccess] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/account/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "customer") {
      fetch("/api/account/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setOrders(data.orders);
        })
        .catch(() => {})
        .finally(() => setLoadingOrders(false));

      fetch("/api/account/wishlist")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setWishlistItems(data.items);
        })
        .catch(() => {})
        .finally(() => setLoadingWishlist(false));
    } else if (status === "authenticated") {
      setLoadingOrders(false);
      setLoadingWishlist(false);
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <div className="text-charcoal-400 text-sm">Loading...</div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const isCustomer = session?.user?.role === "customer";

  const handleRemoveWishlist = async (partId: string) => {
    setRemovingWishlist(partId);
    try {
      const res = await fetch("/api/account/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId }),
      });
      const data = await res.json();
      if (data.success) {
        setWishlistItems((prev) => prev.filter((item) => item.part_id !== partId));
      }
    } catch {
      // ignore
    } finally {
      setRemovingWishlist(null);
    }
  };

  const handleReorder = useCallback(async (orderId: string) => {
    setReorderingId(orderId);
    setReorderSuccess(null);
    try {
      const res = await fetch(`/api/account/orders/${orderId}`);
      const data = await res.json();
      if (!data.success || !data.lineItems) return;

      for (const item of data.lineItems) {
        addItem({
          partId: item.part_id || item.variant_id || item.id,
          partName: item.part_name || "Order item",
          variantId: item.variant_id || null,
          tier: item.tier || null,
          material: item.material || "Unknown",
          process: item.process || "Unknown",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || item.base_price || null,
          totalPrice: item.total_price || null,
          leadTimeDays: item.lead_time_days || null,
          isEstimate: !(item.last_quote_firm),
          quoteId: null,
          quoteSource: "reorder",
        });
      }

      setReorderSuccess(orderId);
      setTimeout(() => setReorderSuccess(null), 3000);
    } catch {
      // ignore
    } finally {
      setReorderingId(null);
    }
  }, [addItem]);

  const SEGMENT_LABELS: Record<string, string> = {
    tractor: "Tractor",
    marine: "Marine",
    automotive: "Automotive",
    motorcycle: "Motorcycle",
    industrial: "Industrial",
  };

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Account header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold text-white">My Account</h1>
              <p className="text-sm text-charcoal-400 mt-1">
                {session?.user?.email}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-5 py-2.5 border border-charcoal-700 hover:border-red-500/30 text-charcoal-300 hover:text-red-400 text-sm font-medium rounded-lg transition-colors uppercase tracking-wider"
            >
              Log Out
            </button>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <a href="/catalog#gasket-quote" className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group text-center">
              <svg className="w-8 h-8 text-emerald-400 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
              <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Get Gasket Quote</p>
              <p className="text-[11px] text-charcoal-400 mt-1">Upload DXF or photo</p>
            </a>
            <a href="/catalog" className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-5 hover:border-emerald-500/20 transition-colors group text-center">
              <svg className="w-8 h-8 text-emerald-400 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" /></svg>
              <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Browse Parts Catalog</p>
              <p className="text-[11px] text-charcoal-400 mt-1">Find reproduction parts</p>
            </a>
          </div>

          {/* Profile card */}
          <div className="bg-charcoal-900 border border-emerald-500/15 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl shadow-emerald-500/5">
            <h2 className="text-[12px] font-bold text-white uppercase tracking-[0.15em] mb-5">
              Profile
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-charcoal-950/40 rounded-lg px-4 py-3 border border-charcoal-800/30">
                <span className="text-charcoal-500 text-[10px] uppercase tracking-wider">
                  Name
                </span>
                <p className="text-charcoal-100 font-medium text-sm mt-0.5">
                  {session?.user?.name || "---"}
                </p>
              </div>
              <div className="bg-charcoal-950/40 rounded-lg px-4 py-3 border border-charcoal-800/30">
                <span className="text-charcoal-500 text-[10px] uppercase tracking-wider">
                  Email
                </span>
                <p className="text-charcoal-100 font-medium text-sm mt-0.5">
                  {session?.user?.email || "---"}
                </p>
              </div>
            </div>
          </div>

          {/* Saved Parts */}
          {isCustomer && (
            <div className="bg-charcoal-900 border border-emerald-500/15 rounded-2xl p-6 sm:p-8 mb-8 shadow-2xl shadow-emerald-500/5">
              <h2 className="text-[12px] font-bold text-white uppercase tracking-[0.15em] mb-5">
                Saved Parts
              </h2>

              {loadingWishlist ? (
                <div className="text-center py-12">
                  <svg
                    className="animate-spin w-6 h-6 text-emerald-400 mx-auto mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-sm text-charcoal-400">Loading saved parts...</p>
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-charcoal-800/30 flex items-center justify-center mb-5 border border-charcoal-800/40">
                    <svg className="w-7 h-7 text-charcoal-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <p className="text-sm text-charcoal-200 font-semibold mb-2">No saved parts yet</p>
                  <p className="text-xs text-charcoal-500 mb-6">
                    Browse the catalog to save parts for later.
                  </p>
                  <a
                    href="/catalog"
                    className="inline-flex px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Browse Catalog
                  </a>
                </div>
              ) : (
                <div className="space-y-3">
                  {wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-charcoal-950/40 rounded-xl p-4 border border-charcoal-800/30 flex items-center gap-4"
                    >
                      {/* Photo thumbnail */}
                      {item.photo_url ? (
                        <img
                          src={item.photo_url}
                          alt={item.part_name}
                          className="w-16 h-16 rounded-lg object-cover border border-charcoal-800/40 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-charcoal-800/30 border border-charcoal-800/40 flex items-center justify-center shrink-0">
                          <svg width="24" height="24" viewBox="0 0 80 80" fill="none" className="text-charcoal-700">
                            <rect x="10" y="20" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
                            <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="1" />
                          </svg>
                        </div>
                      )}

                      {/* Part info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{item.part_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.make && (
                            <span className="text-[11px] text-emerald-400/70">{item.make}</span>
                          )}
                          {item.model && (
                            <span className="text-[11px] text-emerald-400/70">{item.model}</span>
                          )}
                          {item.segment && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-charcoal-800 text-charcoal-300 font-semibold uppercase">
                              {SEGMENT_LABELS[item.segment] || item.segment}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={`/catalog`}
                          className="px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-[10px] rounded uppercase tracking-wider transition-colors"
                        >
                          View Part
                        </a>
                        <button
                          onClick={() => handleRemoveWishlist(item.part_id)}
                          disabled={removingWishlist === item.part_id}
                          className="px-3 py-1.5 border border-charcoal-700 hover:border-red-500/30 text-charcoal-400 hover:text-red-400 text-[10px] font-bold rounded uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          {removingWishlist === item.part_id ? "..." : "Remove"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Order history */}
          {isCustomer && (
            <div className="bg-charcoal-900 border border-emerald-500/15 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-emerald-500/5">
              <h2 className="text-[12px] font-bold text-white uppercase tracking-[0.15em] mb-5">
                Order History
              </h2>

              {loadingOrders ? (
                <div className="text-center py-12">
                  <svg
                    className="animate-spin w-6 h-6 text-emerald-400 mx-auto mb-3"
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
                  <p className="text-sm text-charcoal-400">
                    Loading orders...
                  </p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-charcoal-800/30 flex items-center justify-center mb-5 border border-charcoal-800/40">
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
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-charcoal-200 font-semibold mb-2">
                    No orders yet
                  </p>
                  <p className="text-xs text-charcoal-500 mb-6">
                    Your order history will appear here after your first
                    purchase.
                  </p>
                  <a
                    href="/gaskets"
                    className="inline-flex px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Get a Quote
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = STATUS_LABELS[order.status] || {
                      label: order.status,
                      color: "text-charcoal-400 bg-charcoal-800/30 border-charcoal-700/30",
                    };
                    return (
                      <div
                        key={order.id}
                        className="bg-charcoal-950/40 rounded-xl p-5 border border-charcoal-800/30"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-xs text-charcoal-500 font-mono">
                              Order #{order.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-charcoal-500 mt-0.5">
                              {new Date(order.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold border uppercase tracking-wider ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                            {order.total_price && (
                              <span className="text-white font-bold text-sm">
                                ${parseFloat(order.total_price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Line items summary */}
                        <div className="text-xs text-charcoal-400">
                          {order.line_items.length} item
                          {order.line_items.length !== 1 ? "s" : ""}
                          {order.rush_order && (
                            <span className="ml-2 text-emerald-400 font-medium">
                              Rush
                            </span>
                          )}
                        </div>

                        {/* Invoice link */}
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <a
                            href={`/account/orders/${order.id}/invoice`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            Invoice
                          </a>
                        </div>

                        {/* Tracking link */}
                        {order.tracking_number && (
                          <div className="mt-3 flex items-center gap-2">
                            <svg
                              className="w-3.5 h-3.5 text-emerald-400"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                              />
                            </svg>
                            <a
                              href={`https://www.google.com/search?q=${encodeURIComponent(order.tracking_number)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors underline underline-offset-2"
                            >
                              Track: {order.tracking_number}
                            </a>
                          </div>
                        )}

                        {/* Re-order button */}
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            onClick={() => handleReorder(order.id)}
                            disabled={reorderingId === order.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-[10px] rounded uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {reorderingId === order.id ? (
                              <>
                                <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Adding...
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                </svg>
                                Re-order
                              </>
                            )}
                          </button>
                          {reorderSuccess === order.id && (
                            <span className="text-[10px] text-emerald-400 font-medium animate-pulse">
                              Added to cart
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
