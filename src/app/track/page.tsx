"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

interface OrderItem {
  partName: string;
  quantity: number;
  unitPrice: string | null;
  totalPrice: string | null;
}

interface OrderData {
  id: string;
  shortId: string;
  status: string;
  totalPrice: string | null;
  trackingNumber: string | null;
  createdAt: string;
  shippedAt: string | null;
  items: OrderItem[];
}

const STATUSES = [
  { key: "pending_quote", label: "Ordered" },
  { key: "quoted", label: "Ordered" },
  { key: "paid", label: "Paid" },
  { key: "queued", label: "Manufacturing" },
  { key: "in_progress", label: "Manufacturing" },
  { key: "qc", label: "Manufacturing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const PROGRESS_STEPS = ["Ordered", "Paid", "Manufacturing", "Shipped", "Delivered"];

function getProgressIndex(status: string): number {
  if (status === "delivered") return 4;
  if (status === "shipped") return 3;
  if (status === "in_progress" || status === "queued" || status === "qc") return 2;
  if (status === "paid" || status === "quoted") return 1;
  return 0;
}

function getStatusLabel(status: string): string {
  const found = STATUSES.find((s) => s.key === status);
  return found?.label || status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function guessCarrierUrl(tracking: string): string {
  // UPS: 1Z...
  if (/^1Z/i.test(tracking)) {
    return `https://www.ups.com/track?tracknum=${tracking}`;
  }
  // FedEx: 12-34 digits
  if (/^\d{12,34}$/.test(tracking)) {
    return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`;
  }
  // USPS: 20-34 digits or starts with 9
  if (/^9\d{15,34}$/.test(tracking) || /^\d{20,34}$/.test(tracking)) {
    return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`;
  }
  // Default: try Google
  return `https://www.google.com/search?q=${encodeURIComponent(tracking)}+tracking`;
}

export default function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderData | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || !email.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const params = new URLSearchParams({
        orderId: orderId.trim(),
        email: email.trim(),
      });
      const res = await fetch(`/api/track?${params}`);
      const data = await res.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.error || "Order not found. Please check your order ID and email.");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progressIndex = order ? getProgressIndex(order.status) : -1;

  return (
    <>
      <SiteHeader />
      <main className="pt-24 pb-16 md:pt-32 md:pb-24 min-h-screen">
        <div className="max-w-2xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Order Tracking
            </span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
              Track Your Order
            </h1>
            <p className="mt-4 text-charcoal-300 max-w-md mx-auto">
              Enter your order ID and email address to check the status of your order.
            </p>
          </div>

          {/* Lookup form */}
          <form
            onSubmit={handleTrack}
            className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl p-6 sm:p-8 mb-8"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-300 mb-2 uppercase tracking-wider">
                  Order ID
                </label>
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g., a1b2c3d4 or full UUID"
                  className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-charcoal-300 mb-2 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email used when placing the order"
                  className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !orderId.trim() || !email.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
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
                    Looking up...
                  </>
                ) : (
                  "Track Order"
                )}
              </button>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Order result */}
          {order && (
            <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 sm:px-8 py-5 border-b border-charcoal-800/40">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] text-charcoal-300 uppercase tracking-wider mb-1">
                      Order
                    </p>
                    <p className="text-lg font-bold text-white font-mono">
                      #{order.shortId.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-charcoal-300 uppercase tracking-wider mb-1">
                      Placed
                    </p>
                    <p className="text-sm text-charcoal-200">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-6 sm:px-8 py-6 border-b border-charcoal-800/40">
                <div className="flex items-center justify-between mb-4">
                  {PROGRESS_STEPS.map((step, i) => (
                    <div key={step} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-2 transition-colors ${
                          i <= progressIndex
                            ? "bg-emerald-500 text-white"
                            : "bg-charcoal-800 text-charcoal-500"
                        }`}
                      >
                        {i < progressIndex ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold text-center ${
                          i <= progressIndex ? "text-emerald-400" : "text-charcoal-500"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Connecting line */}
                <div className="relative mx-4 -mt-[3.25rem] mb-8">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-charcoal-800" />
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.max(0, (progressIndex / (PROGRESS_STEPS.length - 1)) * 100)}%`,
                    }}
                  />
                </div>

                <div className="text-center">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      order.status === "delivered"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : order.status === "shipped"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : order.status === "cancelled"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-gold-500/10 text-gold-400 border border-gold-500/20"
                    }`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              {/* Tracking number */}
              {order.trackingNumber && (
                <div className="px-6 sm:px-8 py-4 border-b border-charcoal-800/40 bg-blue-500/3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-charcoal-300 uppercase tracking-wider mb-0.5">
                        Tracking Number
                      </p>
                      <a
                        href={guessCarrierUrl(order.trackingNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 font-mono font-medium underline underline-offset-2 transition-colors"
                      >
                        {order.trackingNumber}
                      </a>
                    </div>
                    {order.shippedAt && (
                      <p className="text-xs text-charcoal-300">
                        Shipped{" "}
                        {new Date(order.shippedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Line items */}
              <div className="px-6 sm:px-8 py-5 border-b border-charcoal-800/40">
                <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-3">
                  Items
                </p>
                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-charcoal-800/20 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-charcoal-400 font-mono w-6">
                          x{item.quantity}
                        </span>
                        <span className="text-sm text-charcoal-200">{item.partName}</span>
                      </div>
                      {item.totalPrice && (
                        <span className="text-sm text-charcoal-200 font-medium">
                          ${item.totalPrice}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              {order.totalPrice && (
                <div className="px-6 sm:px-8 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-charcoal-300 uppercase tracking-wider">
                      Total
                    </span>
                    <span className="text-xl font-bold text-white">${order.totalPrice}</span>
                  </div>
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
