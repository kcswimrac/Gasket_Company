"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/lib/cart";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    address: "", city: "", state: "", zip: "",
    notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const hasEstimates = items.some((i) => i.isEstimate);
  const allFirmPriced = !hasEstimates && items.every((i) => i.unitPrice && parseFloat(i.unitPrice) > 0);

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, customer: form }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to submit order");
        setSubmitting(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // No Stripe URL — estimates need review first
      setSubmitted(true);
      setSubmitting(false);
      clearCart();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls = "block text-[10px] font-semibold text-charcoal-300 mb-1.5 uppercase tracking-wider";

  if (submitted) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <div className="max-w-md mx-auto px-5 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/15">
              <svg className="w-10 h-10 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Order Submitted</h1>
            <p className="text-sm text-charcoal-300 mb-2">
              We&apos;ve received your order and will review it shortly.
              You&apos;ll receive a confirmation email with final pricing and lead time.
            </p>
            <p className="text-xs text-charcoal-300 mb-8">
              Items with estimated pricing will be confirmed within 24 hours.
            </p>
            <a href="/catalog" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded uppercase tracking-wider transition-colors">
              Back to Catalog
            </a>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <SiteHeader />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-white mb-3">Cart is empty</h1>
            <a href="/catalog" className="text-sm text-emerald-400 hover:text-emerald-300">Browse catalog</a>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white mb-8">Checkout</h1>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Full Name *</label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Email *</label>
                    <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="Email" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone</label>
                    <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="Phone" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Company</label>
                    <input value={form.company} onChange={(e) => set("company", e.target.value)} placeholder="Company (optional)" className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Street Address</label>
                    <input value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Address" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>City</label>
                    <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>State</label>
                      <input value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="CA" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>ZIP</label>
                      <input value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="93001" className={inputCls} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Order Notes</h2>
                <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Special instructions, application details, or anything we should know..." className={`${inputCls} resize-none`} />
              </div>

              {/* Payment info */}
              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Payment</h2>
                {allFirmPriced ? (
                  <div className="bg-emerald-500/3 border border-emerald-500/15 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <div>
                      <p className="text-sm text-charcoal-200">Secure payment via Stripe</p>
                      <p className="text-xs text-charcoal-300 mt-0.5">You&apos;ll be redirected to Stripe&apos;s secure checkout to complete payment.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gold-500/3 border border-gold-500/15 rounded-lg p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <div>
                      <p className="text-sm text-charcoal-200">Pricing review required</p>
                      <p className="text-xs text-charcoal-300 mt-0.5">Some items have estimated prices. We&apos;ll confirm final pricing and send a payment link via email.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order summary */}
            <div>
              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6 sticky top-24">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="text-charcoal-200 line-clamp-2">{item.partName}</p>
                        <p className="text-[10px] text-charcoal-300">
                          {item.tier && `${item.tier.toUpperCase()} · `}{item.material} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-charcoal-200 font-medium shrink-0">
                        {item.totalPrice ? `$${item.totalPrice}` : "TBD"}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-charcoal-800/50 pt-4 mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-charcoal-300">Subtotal</span>
                    <span className="text-white font-bold">${total}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-charcoal-300">Shipping</span>
                    <span className="text-charcoal-300">Calculated after review</span>
                  </div>
                </div>

                {hasEstimates && (
                  <div className="bg-gold-500/5 border border-gold-500/15 rounded-lg p-3 mb-4">
                    <p className="text-[10px] text-gold-300/80">Some prices are estimates and will be confirmed via email before payment is collected.</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-3 mb-4">
                    <p className="text-[10px] text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.name || !form.email}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> {allFirmPriced ? "Redirecting to Stripe..." : "Submitting..."}</>
                  ) : allFirmPriced ? "Pay with Stripe" : "Submit for Review"}
                </button>

                <p className="text-[10px] text-charcoal-400 text-center mt-3">
                  {allFirmPriced
                    ? "You’ll be redirected to Stripe’s secure checkout."
                    : "No payment now. We’ll confirm pricing and send a payment link."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
