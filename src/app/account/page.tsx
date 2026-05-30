"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

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
    } else if (status === "authenticated") {
      setLoadingOrders(false);
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
