"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";

interface Variant {
  id: string;
  tier: string;
  material: string;
  process: string;
  resolvedPrice: string | null;
  pricingStatus: string;
  lead_time_days: number | null;
}

interface Props {
  partId: string;
  partName: string;
  variants: Variant[];
  estimate: { price: string; material: string | null } | null;
}

const TIER_LABELS: Record<string, string> = {
  fitment_check: "3D Test-Fit",
  oem: "OEM Spec",
  improved: "Improved",
  custom: "Custom",
};

export default function AddToCartButton({ partId, partName, variants, estimate }: Props) {
  const [activeTier, setActiveTier] = useState(0);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const variant = variants[activeTier] || null;

  const handleAdd = () => {
    if (variant?.resolvedPrice) {
      addItem({
        partId,
        partName,
        variantId: variant.id,
        tier: variant.tier,
        material: variant.material,
        process: variant.process,
        quantity: qty,
        unitPrice: variant.resolvedPrice,
        totalPrice: (parseFloat(variant.resolvedPrice) * qty).toFixed(2),
        leadTimeDays: variant.lead_time_days,
        isEstimate: variant.pricingStatus !== "firm",
        quoteId: null,
        quoteSource: "catalog_cached",
      });
      setAddedToCart(true);
    } else if (estimate?.price) {
      addItem({
        partId,
        partName,
        variantId: null,
        tier: null,
        material: estimate.material || "Default",
        process: "TBD",
        quantity: qty,
        unitPrice: estimate.price,
        totalPrice: (parseFloat(estimate.price) * qty).toFixed(2),
        leadTimeDays: null,
        isEstimate: true,
        quoteId: null,
        quoteSource: "cached_estimate",
      });
      setAddedToCart(true);
    }
  };

  const hasPrice = !!(variant?.resolvedPrice || (!variant && estimate?.price));
  const displayPrice = variant?.resolvedPrice || estimate?.price || null;

  return (
    <div className="space-y-4">
      {/* Tier selector */}
      {variants.length > 1 && (
        <div className="flex rounded-lg bg-charcoal-950/60 p-0.5 border border-charcoal-800/30">
          {variants.map((v, i) => (
            <button
              key={v.id}
              onClick={() => { setActiveTier(i); setAddedToCart(false); }}
              className={`flex-1 py-2 text-[11px] font-semibold rounded-md uppercase tracking-wider transition-all ${
                activeTier === i
                  ? v.tier === "fitment_check"
                    ? "bg-blue-500/15 text-blue-400"
                    : "bg-charcoal-800 text-white"
                  : "text-charcoal-500 hover:text-charcoal-300"
              }`}
            >
              {TIER_LABELS[v.tier] || v.tier}
            </button>
          ))}
        </div>
      )}

      {/* Variant details */}
      {variant && (
        <div className="bg-charcoal-950/40 rounded-lg p-4 border border-charcoal-800/30 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-charcoal-300">Material</span>
            <span className="text-charcoal-200 font-medium">{variant.material}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-charcoal-300">Process</span>
            <span className="text-charcoal-200 font-medium">{variant.process}</span>
          </div>
          {variant.lead_time_days && (
            <div className="flex justify-between text-xs">
              <span className="text-charcoal-300">Lead Time</span>
              <span className="text-charcoal-200 font-medium">{variant.lead_time_days} days</span>
            </div>
          )}
        </div>
      )}

      {/* Price + Add to Cart */}
      <div className="flex items-end justify-between pt-2">
        <div>
          {displayPrice ? (
            <>
              <span className="text-[10px] text-charcoal-300 uppercase tracking-wider">
                {variant?.pricingStatus === "firm" ? "Price" : "Est. from"}
              </span>
              <p className="text-2xl font-bold text-white">${displayPrice}</p>
            </>
          ) : (
            <p className="text-sm text-charcoal-300">Contact for pricing</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="999"
            value={qty}
            onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 bg-charcoal-950 border border-charcoal-700/50 rounded px-2 py-2 text-sm text-charcoal-100 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
          {hasPrice && !addedToCart ? (
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              Add to Cart
            </button>
          ) : addedToCart ? (
            <a
              href="/cart"
              className="px-6 py-3 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-sm rounded-lg uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              View Cart
            </a>
          ) : !hasPrice ? (
            <a
              href={`mailto:parts@backyardrestoration.com?subject=Quote: ${encodeURIComponent(partName)}`}
              className="px-6 py-3 border border-charcoal-700 hover:border-charcoal-600 text-charcoal-300 hover:text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors"
            >
              Request Quote
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
