"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/lib/cart";

function SuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { clearCart } = useCart();

  useEffect(() => {
    if (sessionId) clearCart();
  }, [sessionId, clearCart]);

  return (
    <div className="max-w-md mx-auto px-5 text-center">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/15">
        <svg className="w-10 h-10 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Payment Received</h1>
      <p className="text-sm text-charcoal-400 mb-2">
        Your order has been confirmed and payment processed.
        You&apos;ll receive a confirmation email shortly.
      </p>
      <p className="text-xs text-charcoal-500 mb-8">
        We&apos;ll begin production and send tracking info when your order ships.
      </p>
      <a href="/catalog" className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded uppercase tracking-wider transition-colors">
        Back to Catalog
      </a>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <Suspense>
          <SuccessContent />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
