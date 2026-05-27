"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/lib/cart";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "",
    address: "", city: "", state: "", zip: "",
    notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setSubmitting(true);

    // TODO: Replace with Stripe Checkout session creation
    // const res = await fetch("/api/checkout", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ items, customer: form }),
    // });
    // const { url } = await res.json();
    // window.location.href = url; // Redirect to Stripe

    // For now: simulate order submission
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitted(true);
    setSubmitting(false);
    clearCart();
  };

  const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
  const labelCls = "block text-[10px] font-semibold text-charcoal-400 mb-1.5 uppercase tracking-wider";

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
            <p className="text-sm text-charcoal-400 mb-2">
              We&apos;ve received your order and will review it shortly.
              You&apos;ll receive a confirmation email with final pricing and lead time.
            </p>
            <p className="text-xs text-charcoal-500 mb-8">
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className={labelCls}>Full Name *</label>
                    <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Name" className={inputCls} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
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

              {/* Payment stub */}
              <div className="bg-charcoal-900 border border-charcoal-800/50 rounded-xl p-6">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Payment</h2>
                <div className="bg-charcoal-950/40 border border-charcoal-800/30 rounded-lg p-6 text-center">
                  <svg className="w-8 h-8 text-charcoal-600 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                  </svg>
                  <p className="text-sm text-charcoal-400 mb-1">Stripe payment integration coming soon</p>
                  <p className="text-xs text-charcoal-500">For now, submit your order and we&apos;ll send an invoice via email.</p>
                </div>
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
                        <p className="text-charcoal-200 truncate">{item.partName}</p>
                        <p className="text-[10px] text-charcoal-500">
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
                    <span className="text-charcoal-400">Subtotal</span>
                    <span className="text-white font-bold">${total}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-charcoal-400">Shipping</span>
                    <span className="text-charcoal-400">Calculated after review</span>
                  </div>
                </div>

                {items.some((i) => i.isEstimate) && (
                  <div className="bg-gold-500/5 border border-gold-500/15 rounded-lg p-3 mb-4">
                    <p className="text-[10px] text-gold-300/80">Some prices are estimates and will be confirmed via email before payment is collected.</p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !form.name || !form.email}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Submitting...</>
                  ) : "Submit Order"}
                </button>

                <p className="text-[10px] text-charcoal-600 text-center mt-3">
                  No payment collected now. We&apos;ll confirm pricing and send an invoice.
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
