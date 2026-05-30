"use client";

import { useState, useEffect, useCallback } from "react";
import { useCart } from "@/lib/cart";
import {
  SEGMENTS,
  FITMENT_COLORS,
  FITMENT_LABELS,
  TIER_LABELS,
  TIER_LABELS_FULL,
  TIER_CHIP_COLORS,
  fileChip,
  tierChip,
  getPhotosForTier,
  type CatalogPart,
  type CartQuote,
} from "./catalog-types";
import { partSlug } from "@/lib/slug";

/* ─── Part Card ─── */
function PartCard({ part }: { part: CatalogPart }) {
  const [activeTier, setActiveTier] = useState(0);
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  const variant = part.variants[activeTier] || null;
  const hasVariants = part.variants.length > 0;

  const handleGetPrice = async () => {
    setQuoting(true);
    setQuote(null);
    try {
      const res = await fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant?.id || undefined,
          partId: variant ? undefined : part.id,
          quantity: qty,
        }),
      });
      const data = await res.json();
      if (data.success) setQuote(data.quote);
    } catch {
      // Network error — show pre-loaded price from catalog (variant's own price only)
      const fp = variant ? variant.resolvedPrice : part.estimate?.price || null;
      setQuote({
        variantId: variant?.id || null, quoteId: null,
        unitPrice: fp, totalPrice: fp ? (parseFloat(fp) * qty).toFixed(2) : null,
        leadTimeDays: variant?.lead_time_days || null,
        priceStatus: fp ? "estimate" : "unavailable", source: "network_error",
        message: "Could not reach pricing service.",
      });
    } finally {
      setQuoting(false);
    }
  };

  const yearDisplay = part.year_start && part.year_end
    ? `${part.year_start}–${part.year_end}`
    : part.year_start ? `${part.year_start}+` : "";

  const allPhotos = part.files?.filter((f) => f.file_type.startsWith("photo") && f.show_in_catalog) || [];
  const photos = getPhotosForTier(allPhotos, variant?.tier || null);
  const heroPhoto = photos[0];
  const heroChip = heroPhoto ? fileChip(heroPhoto.file_type, heroPhoto.file_name) : null;
  const heroTierChip = heroPhoto ? tierChip(heroPhoto.tier) : null;

  return (
    <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl overflow-hidden hover:border-emerald-500/12 transition-all group">
      {/* Photo or placeholder */}
      {heroPhoto ? (
        <div className="relative h-40 bg-charcoal-950 border-b border-charcoal-800/40 overflow-hidden">
          <img src={heroPhoto.thumbnail_url || heroPhoto.file_url} alt={part.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" loading="lazy" />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className={`${heroChip!.color} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm`}>
              {heroChip!.label}
            </span>
            {heroTierChip && (
              <span className={`${heroTierChip.color} text-white text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm`}>
                {heroTierChip.label}
              </span>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-sm ${FITMENT_COLORS[part.fitment_status] || ""}`}>
              {FITMENT_LABELS[part.fitment_status] || part.fitment_status}
            </span>
          </div>
          {photos.length > 1 && (
            <span className="absolute bottom-2 right-2 text-[10px] text-white/60 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
              +{photos.length - 1} more
            </span>
          )}
        </div>
      ) : (
        <div className="h-32 bg-charcoal-950 border-b border-charcoal-800/40 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 80 80" fill="none" className="text-charcoal-800">
            <rect x="10" y="20" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <a href={`/catalog/${partSlug(part)}`} onClick={(e) => e.stopPropagation()} className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors hover:underline">{part.name}</a>
          {!heroPhoto && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${FITMENT_COLORS[part.fitment_status] || ""}`}>
              {FITMENT_LABELS[part.fitment_status] || part.fitment_status}
            </span>
          )}
        </div>
        <p className="text-[11px] text-emerald-400/70 font-medium">
          {part.make && <span>{part.make} </span>}
          {part.model && <span>{part.model} </span>}
          {yearDisplay && <span>({yearDisplay})</span>}
        </p>
        <p className="text-[11px] text-charcoal-300 mt-0.5">{part.application}</p>
        {part.description && !part.description.startsWith("Published from") && !part.description.startsWith("New scan version") && !part.description.startsWith("Revision scan") && (
          <p className="text-xs text-charcoal-300 leading-relaxed mb-4 line-clamp-2">{part.description}</p>
        )}

        {/* Tier tabs */}
        {hasVariants && part.variants.length > 1 && (
          <div className="flex rounded-lg bg-charcoal-950/60 p-0.5 mb-4 border border-charcoal-800/30">
            {part.variants.map((v, i) => (
              <button
                key={v.id}
                onClick={(e) => { e.stopPropagation(); setActiveTier(i); setQuote(null); }}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md uppercase tracking-wider transition-all ${
                  activeTier === i
                    ? v.tier === "fitment_check" ? "bg-blue-500/15 text-blue-400" : "bg-charcoal-800 text-white"
                    : "text-charcoal-500 hover:text-charcoal-300"
                }`}
              >
                {TIER_LABELS[v.tier] || v.tier}
              </button>
            ))}
          </div>
        )}

        {/* Variant details */}
        {variant ? (
          <div className="bg-charcoal-950/40 rounded-lg p-3 mb-4 border border-charcoal-800/30 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-charcoal-300">Material</span>
              <span className="text-charcoal-200 font-medium text-right max-w-[60%] truncate">{variant.material}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-charcoal-300">Process</span>
              <span className="text-charcoal-200 font-medium text-right max-w-[60%] truncate">{variant.process}</span>
            </div>
            {variant.lead_time_days && (
              <div className="flex justify-between text-[11px]">
                <span className="text-charcoal-300">Lead Time</span>
                <span className="text-charcoal-200 font-medium">{variant.lead_time_days} days</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-charcoal-950/40 rounded-lg p-3 mb-4 border border-charcoal-800/30">
            <p className="text-[11px] text-charcoal-300">Material tiers coming soon — contact us for pricing.</p>
          </div>
        )}

        {variant?.tier === "fitment_check" && (
          <div className="bg-blue-500/4 border border-blue-500/12 rounded-lg p-2.5 mb-4">
            <p className="text-[10px] text-blue-300/80 leading-relaxed">
              <strong className="text-blue-400">Test-Fit:</strong> 3D-printed mockup for dimensional check only.
            </p>
          </div>
        )}

        {part.contributor_name && (
          <p className="text-[10px] text-charcoal-400 mb-3">
            Scanned from donor by {part.contributor_name}
          </p>
        )}

        {/* Price + Add to Cart */}
        <div className="pt-3 border-t border-charcoal-800/40">
          {!variant ? (
            <div>
              {/* Show cached estimate if available */}
              {part.estimate && !quote ? (
                <div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-[10px] text-charcoal-300 uppercase tracking-wider">
                        {part.estimate.isStale ? "Previous est." : "Est. from"}
                      </span>
                      <p className="text-lg font-bold text-white">${part.estimate.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min="1" max="999" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-14 bg-charcoal-950 border border-charcoal-700/50 rounded px-2 py-1.5 text-xs text-charcoal-100 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40" onClick={(e) => e.stopPropagation()} />
                      {!addedToCart ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem({
                              partId: part.id, partName: part.name, variantId: null,
                              tier: null, material: part.estimate!.material || "Default",
                              process: "TBD", quantity: qty,
                              unitPrice: part.estimate!.price,
                              totalPrice: (parseFloat(part.estimate!.price) * qty).toFixed(2),
                              leadTimeDays: null, isEstimate: true,
                              quoteId: null, quoteSource: "cached_estimate",
                            });
                            setAddedToCart(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] rounded uppercase tracking-wider transition-colors"
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <a href="/cart" onClick={(e) => e.stopPropagation()} className="px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-[10px] rounded uppercase tracking-wider transition-colors flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          View Cart
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleGetPrice(); }}
                    disabled={quoting}
                    className="text-[10px] text-charcoal-500 hover:text-emerald-400 transition-colors"
                  >
                    {quoting ? "Updating..." : "↻ Get updated pricing"}
                  </button>
                </div>
              ) : part.hasStepFile && !quote ? (
                <button
                  onClick={(e) => { e.stopPropagation(); handleGetPrice(); }}
                  disabled={quoting}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[11px] rounded transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  {quoting ? (
                    <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Getting estimate...</>
                  ) : "Get Estimate"}
                </button>
              ) : !quote ? (
                <a href={`mailto:parts@backyardrestoration.com?subject=Quote: ${encodeURIComponent(part.name)}`} className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-medium" onClick={(e) => e.stopPropagation()}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  Request a quote
                </a>
              ) : null}
              {quote && (
                <div className={`mt-3 rounded-lg p-3 ${quote.priceStatus !== "firm" ? "bg-gold-500/5 border border-gold-500/15" : "bg-emerald-500/5 border border-emerald-500/15"}`}>
                  {quote.unitPrice ? (
                    <p className="text-lg font-bold text-white">${quote.totalPrice}</p>
                  ) : (
                    <p className="text-sm text-charcoal-300">Contact us for pricing</p>
                  )}
                  {quote.message && <p className="text-[10px] text-charcoal-300 mt-1">{quote.message}</p>}
                </div>
              )}
            </div>
          ) : !quote ? (
            <div className="flex items-end justify-between">
              <div>
                {variant.resolvedPrice ? (
                  <>
                    <span className="text-[10px] text-charcoal-300 uppercase tracking-wider">
                      {variant.pricingStatus !== "firm" ? "Est. from" : "Price"}
                    </span>
                    <p className="text-lg font-bold text-white">${variant.resolvedPrice}</p>
                  </>
                ) : variant.quotable ? (
                  <span className="text-xs text-charcoal-300">Click to get price for {variant.material}</span>
                ) : (
                  <span className="text-xs text-charcoal-300">Contact for pricing</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" max="999" value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 bg-charcoal-950 border border-charcoal-700/50 rounded px-2 py-1.5 text-xs text-charcoal-100 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  onClick={(e) => e.stopPropagation()}
                />
                {variant.resolvedPrice && !addedToCart ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({
                        partId: part.id, partName: part.name, variantId: variant.id,
                        tier: variant.tier, material: variant.material,
                        process: variant.process, quantity: qty,
                        unitPrice: variant.resolvedPrice!,
                        totalPrice: (parseFloat(variant.resolvedPrice!) * qty).toFixed(2),
                        leadTimeDays: variant.lead_time_days,
                        isEstimate: variant.pricingStatus !== "firm",
                        quoteId: null, quoteSource: "catalog_cached",
                      });
                      setAddedToCart(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[11px] rounded transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
                  >
                    Add to Cart
                  </button>
                ) : addedToCart ? (
                  <a href="/cart" onClick={(e) => e.stopPropagation()} className="px-4 py-2 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-[11px] rounded uppercase tracking-wider transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    View Cart
                  </a>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleGetPrice(); }}
                    disabled={quoting || !variant.quotable}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[11px] rounded transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/10 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {quoting ? (
                      <>
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Quoting...
                      </>
                    ) : "Get Price"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Live quote result */}
              <div className={`rounded-lg p-3 ${quote.priceStatus !== "firm" ? "bg-gold-500/5 border border-gold-500/15" : "bg-emerald-500/5 border border-emerald-500/15"}`}>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-charcoal-300">
                      {quote.priceStatus !== "firm" ? "Estimated price" : "Quoted price"}
                    </span>
                    {quote.unitPrice ? (
                      <p className="text-xl font-bold text-white">
                        ${quote.totalPrice}
                        <span className="text-xs text-charcoal-300 font-normal ml-1.5">
                          (${quote.unitPrice} × {qty})
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-charcoal-300">Contact us for pricing</p>
                    )}
                  </div>
                  {quote.leadTimeDays && (
                    <span className="text-xs text-charcoal-300">{quote.leadTimeDays} day lead</span>
                  )}
                </div>

                {quote.message && (
                  <p className="text-[11px] text-charcoal-300 leading-relaxed">{quote.message}</p>
                )}

                {quote.priceStatus === "firm" && (
                  <p className="text-[10px] text-emerald-400/70 mt-1">
                    Live price from AutoQuote • {quote.source === "autoquote_cached" ? "Cached" : "Fresh"}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {quote.unitPrice && !addedToCart && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem({
                        partId: part.id,
                        partName: part.name,
                        variantId: variant?.id || null,
                        tier: variant?.tier || null,
                        material: variant?.material || "Default",
                        process: variant?.process || "TBD",
                        quantity: qty,
                        unitPrice: quote.unitPrice,
                        totalPrice: quote.totalPrice,
                        leadTimeDays: quote.leadTimeDays,
                        isEstimate: quote.priceStatus !== "firm",
                        quoteId: quote.quoteId || null,
                        quoteSource: quote.source,
                      });
                      setAddedToCart(true);
                    }}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded uppercase tracking-wider transition-colors"
                  >
                    Add to Cart
                  </button>
                )}
                {addedToCart && (
                  <a href="/cart" className="flex-1 py-2.5 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-[11px] rounded uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    View Cart
                  </a>
                )}
                <button
                  onClick={() => setQuote(null)}
                  className="px-4 py-2.5 border border-charcoal-700 text-charcoal-400 hover:text-charcoal-300 text-[11px] rounded uppercase tracking-wider transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Part Detail Modal ─── */
function PartModal({ part, onClose }: { part: CatalogPart; onClose: () => void }) {
  const allPhotos = part.files?.filter((f) => f.file_type.startsWith("photo") && f.file_url) || [];
  const [activeTier, setActiveTier] = useState(0);
  const [activePhoto, setActivePhoto] = useState(0);
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addItem } = useCart();

  // Custom material state
  const [customMode, setCustomMode] = useState(false);
  const [materials, setMaterials] = useState<Array<{ code: string; name: string; processes: string[] }>>([]);
  const [materialsLoaded, setMaterialsLoaded] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState("");

  const variant = part.variants.length > 0 ? part.variants[activeTier] : null;
  const hasVariants = part.variants.length > 0;

  const photos = getPhotosForTier(allPhotos, variant?.tier || null);

  const handleQuote = async () => {
    setQuoting(true); setQuote(null);
    try {
      const res = await fetch("/api/cart/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: variant?.id || undefined,
          partId: variant ? undefined : part.id,
          quantity: qty,
        }),
      });
      const data = await res.json();
      if (data.success) setQuote(data.quote);
    } catch {
      const fp = variant ? variant.resolvedPrice : part.estimate?.price || null;
      setQuote({
        variantId: variant?.id || null, quoteId: null,
        unitPrice: fp, totalPrice: fp ? (parseFloat(fp) * qty).toFixed(2) : null,
        leadTimeDays: variant?.lead_time_days || null,
        priceStatus: fp ? "estimate" : "unavailable", source: "network_error",
        message: "Could not reach pricing service.",
      });
    }
    finally { setQuoting(false); }
  };

  const loadMaterials = async () => {
    if (materialsLoaded) return;
    try {
      const res = await fetch("/api/materials");
      const data = await res.json();
      if (data.success && data.materials.length > 0) {
        setMaterials(data.materials);
        setSelectedMaterial(data.materials[0].code);
      }
    } catch { /* ignore */ }
    setMaterialsLoaded(true);
  };

  const handleCustomQuote = async () => {
    if (!selectedMaterial) return;
    setQuoting(true); setQuote(null);
    try {
      const res = await fetch("/api/cart/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ partId: part.id, material: selectedMaterial, quantity: qty }),
      });
      const data = await res.json();
      if (data.success) setQuote(data.quote);
    } catch {
      setQuote({
        variantId: null, quoteId: null, unitPrice: null, totalPrice: null,
        leadTimeDays: null, priceStatus: "unavailable", source: "network_error",
        message: "Could not reach pricing service.",
      });
    } finally { setQuoting(false); }
  };

  const handleAddToCart = () => {
    if (!quote?.unitPrice) return;
    const mat = customMode
      ? materials.find((m) => m.code === selectedMaterial)
      : null;
    addItem({
      partId: part.id, partName: part.name, variantId: customMode ? null : (variant?.id || null),
      tier: customMode ? "custom" : (variant?.tier || null),
      material: customMode ? (mat?.name || selectedMaterial) : (variant?.material || part.estimate?.material || "Default"),
      process: customMode ? "CNC_3AXIS" : (variant?.process || "TBD"), quantity: qty,
      unitPrice: quote.unitPrice, totalPrice: quote.totalPrice,
      leadTimeDays: quote.leadTimeDays, isEstimate: quote.priceStatus !== "firm",
      quoteId: quote.quoteId || null, quoteSource: quote.source,
    });
    setAddedToCart(true);
  };

  const yearDisplay = part.year_start && part.year_end ? `${part.year_start}–${part.year_end}` : part.year_start ? `${part.year_start}+` : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm" />
      <div className="relative bg-charcoal-900 border border-charcoal-800/60 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto card-glow" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-charcoal-900 border-b border-charcoal-800/50 px-6 py-4 flex items-start justify-between z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-white">{part.name}</h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${FITMENT_COLORS[part.fitment_status] || ""}`}>
                {FITMENT_LABELS[part.fitment_status]}
              </span>
            </div>
            <p className="text-sm text-emerald-400/70">
              {part.make && `${part.make} `}{part.model && `${part.model} `}{yearDisplay && `(${yearDisplay})`}
            </p>
            <p className="text-xs text-charcoal-300 mt-0.5">{part.application}</p>
          </div>
          <button onClick={onClose} className="text-charcoal-400 hover:text-charcoal-300 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Photos + 3D view */}
          {photos.length > 0 && (
            <div>
              {/* Main photo */}
              <div className="relative">
                {(() => {
                  const p = photos[activePhoto] || photos[0];
                  const cl = fileChip(p.file_type, p.file_name);
                  const tc = tierChip(p.tier);
                  return (
                    <>
                      <img src={p.file_url} alt={part.name} className="w-full rounded-lg object-cover max-h-80" />
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className={`${cl.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm`}>
                          {cl.label}
                        </span>
                        {tc && (
                          <span className={`${tc.color} text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm`}>
                            {tc.label}
                          </span>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
              {/* Thumbnails */}
              {photos.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto mt-2">
                  {photos.map((f, i) => {
                    const cl = fileChip(f.file_type, f.file_name);
                    const tc = tierChip(f.tier);
                    return (
                      <button key={f.id} onClick={() => setActivePhoto(i)} className={`relative flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${activePhoto === i ? "border-emerald-500" : "border-transparent hover:border-charcoal-600"}`}>
                        <img src={f.thumbnail_url || f.file_url!} alt="" className="w-16 h-16 object-cover" loading="lazy" />
                        <div className="absolute bottom-0 left-0 right-0 flex">
                          <span className={`flex-1 ${cl.color} text-white text-[7px] font-semibold text-center py-px`}>
                            {cl.label}
                          </span>
                          {tc && (
                            <span className={`${tc.color} text-white text-[7px] font-semibold text-center px-1 py-px`}>
                              {tc.label}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          {part.description && !part.description.startsWith("Published") && !part.description.startsWith("New scan") && (
            <p className="text-sm text-charcoal-300 leading-relaxed">{part.description}</p>
          )}

          {/* Contributor credit */}
          {part.contributor_name && (
            <p className="text-xs text-charcoal-300 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Scanned from donor by {part.contributor_name}
            </p>
          )}

          {/* Tier selector */}
          {hasVariants && (
            <div>
              <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-3">Material Tiers</p>
              <div className="space-y-2">
                {part.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => { setActiveTier(i); setActivePhoto(0); setQuote(null); setAddedToCart(false); setCustomMode(false); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${activeTier === i ? "border-emerald-500/25 bg-emerald-500/3" : "border-charcoal-800/40 hover:border-charcoal-700/50"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{TIER_LABELS_FULL[v.tier] || v.tier}</span>
                      <span className={`text-sm font-bold ${v.resolvedPrice ? "text-white" : "text-charcoal-500"}`}>
                        {v.resolvedPrice ? (v.pricingStatus !== "firm" ? `est. $${v.resolvedPrice}` : `$${v.resolvedPrice}`) : v.quotable ? "Get price" : "Contact us"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-charcoal-300">
                      <span>{v.material}</span>
                      <span>{v.process}</span>
                    </div>
                    {v.lead_time_days && <p className="text-[11px] text-charcoal-300 mt-1">{v.lead_time_days} day lead time</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Material Option */}
          {part.hasStepFile && (
            <div>
              <button
                onClick={() => {
                  setCustomMode(!customMode);
                  setQuote(null); setAddedToCart(false);
                  if (!materialsLoaded) loadMaterials();
                }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${customMode ? "border-amber-500/25 bg-amber-500/3" : "border-charcoal-800/40 hover:border-charcoal-700/50"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white">Custom Material</span>
                    <p className="text-xs text-charcoal-300 mt-0.5">Choose any material from our shop and get a live quote</p>
                  </div>
                  <svg className={`w-4 h-4 text-charcoal-400 transition-transform ${customMode ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </button>

              {customMode && (
                <div className="mt-2 p-4 bg-charcoal-950/40 rounded-xl border border-amber-500/15 space-y-3">
                  {/* Previously quoted custom materials */}
                  {part.customQuotes.length > 0 && (
                    <div>
                      <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-2">Recent Quotes</p>
                      <div className="space-y-1.5">
                        {part.customQuotes.map((cq) => (
                          <div key={cq.material} className="flex items-center justify-between bg-charcoal-950/60 rounded-lg p-2.5 border border-charcoal-800/30">
                            <div>
                              <span className="text-xs text-charcoal-200 font-medium">{cq.material}</span>
                              <span className="text-lg font-bold text-white ml-3">${cq.unitPrice}</span>
                              {cq.leadTimeDays && <span className="text-[10px] text-charcoal-300 ml-2">{cq.leadTimeDays}d lead</span>}
                            </div>
                            <button
                              onClick={() => {
                                addItem({
                                  partId: part.id, partName: part.name, variantId: null,
                                  tier: "custom", material: cq.material,
                                  process: "CNC_3AXIS", quantity: qty,
                                  unitPrice: cq.unitPrice,
                                  totalPrice: (parseFloat(cq.unitPrice) * qty).toFixed(2),
                                  leadTimeDays: cq.leadTimeDays,
                                  isEstimate: true,
                                  quoteId: null, quoteSource: "cached_custom",
                                });
                                setAddedToCart(true);
                              }}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] rounded uppercase tracking-wider transition-colors shrink-0"
                            >
                              Add to Cart
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-charcoal-800/30 mt-3 pt-3">
                        <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-2">Quote a Different Material</p>
                      </div>
                    </div>
                  )}

                  {materials.length > 0 ? (
                    <div>
                      <label className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-1 block">Material</label>
                      <select
                        value={selectedMaterial}
                        onChange={(e) => {
                          setSelectedMaterial(e.target.value);
                          setQuote(null); setAddedToCart(false);
                        }}
                        className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-3 py-2 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                      >
                        {materials.map((m) => (
                          <option key={m.code} value={m.code}>{m.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : materialsLoaded ? (
                    <p className="text-xs text-charcoal-300 text-center py-2">Materials unavailable — try again later.</p>
                  ) : (
                    <div className="flex items-center justify-center py-3 gap-2">
                      <svg className="animate-spin w-4 h-4 text-charcoal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      <span className="text-xs text-charcoal-300">Loading materials...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pricing + Add to Cart */}
          <div className="bg-charcoal-950/40 rounded-xl p-5 border border-charcoal-800/30">
            <div className="flex items-end justify-between mb-4">
              <div>
                {(() => {
                  if (customMode) {
                    const matName = materials.find((m) => m.code === selectedMaterial)?.name || selectedMaterial;
                    return (
                      <>
                        <p className="text-[10px] text-amber-400/80 uppercase tracking-wider">Custom — {matName}</p>
                        <p className="text-sm text-charcoal-300 mt-1">{selectedMaterial ? "Click below to get a live quote" : "Select a material above"}</p>
                      </>
                    );
                  }
                  const tierLabel = variant
                    ? `${TIER_LABELS_FULL[variant.tier] || variant.tier} — ${variant.material}`
                    : "Estimate";
                  if (variant?.resolvedPrice) {
                    return (
                      <>
                        <p className="text-[10px] text-charcoal-300 uppercase tracking-wider">{tierLabel}</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {variant.pricingStatus !== "firm" ? "est. " : ""}${variant.resolvedPrice}
                          <span className="text-xs text-charcoal-300 font-normal ml-1">/ unit</span>
                        </p>
                      </>
                    );
                  }
                  if (variant?.quotable) {
                    return (
                      <>
                        <p className="text-[10px] text-charcoal-300 uppercase tracking-wider">{tierLabel}</p>
                        <p className="text-sm text-charcoal-300 mt-1">Click &quot;Get Live Price&quot; to quote this material</p>
                      </>
                    );
                  }
                  if (!variant && part.estimate) {
                    return (
                      <>
                        <p className="text-[10px] text-charcoal-300 uppercase tracking-wider">Estimate{part.estimate.material ? ` — ${part.estimate.material}` : ""}</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          est. ${part.estimate.price}
                          <span className="text-xs text-charcoal-300 font-normal ml-1">/ unit</span>
                        </p>
                      </>
                    );
                  }
                  return <p className="text-sm text-charcoal-300">Get a price estimate</p>;
                })()}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-charcoal-300 uppercase">Qty</label>
                <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 bg-charcoal-950 border border-charcoal-700/50 rounded px-2 py-2 text-sm text-charcoal-100 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
              </div>
            </div>

            {/* Quote result */}
            {quote && (
              <div className={`rounded-lg p-3 mb-4 ${quote.priceStatus !== "firm" ? "bg-gold-500/5 border border-gold-500/15" : "bg-emerald-500/5 border border-emerald-500/15"}`}>
                {quote.unitPrice ? (
                  <p className="text-lg font-bold text-white">${quote.totalPrice} <span className="text-xs text-charcoal-300 font-normal">(${quote.unitPrice} × {qty})</span></p>
                ) : (
                  <p className="text-sm text-charcoal-300">Contact us for pricing</p>
                )}
                {quote.leadTimeDays && <p className="text-xs text-charcoal-300 mt-1">{quote.leadTimeDays} day lead time</p>}
                {quote.message && <p className="text-[11px] text-charcoal-300 mt-1">{quote.message}</p>}
              </div>
            )}

            {/* Action buttons */}
            {!addedToCart ? (
              <div className="flex gap-2">
                {/* Has price (from catalog cache or live quote) — show Add to Cart as primary */}
                {(variant?.resolvedPrice && !customMode) || quote?.unitPrice ? (
                  <>
                    <button
                      onClick={() => {
                        if (quote?.unitPrice) {
                          handleAddToCart();
                        } else if (variant?.resolvedPrice) {
                          addItem({
                            partId: part.id, partName: part.name, variantId: variant?.id || null,
                            tier: variant?.tier || null, material: variant?.material || part.estimate?.material || "Default",
                            process: variant?.process || "TBD", quantity: qty,
                            unitPrice: variant.resolvedPrice!,
                            totalPrice: (parseFloat(variant.resolvedPrice!) * qty).toFixed(2),
                            leadTimeDays: variant?.lead_time_days || null,
                            isEstimate: variant.pricingStatus !== "firm",
                            quoteId: null, quoteSource: "catalog_cached",
                          });
                          setAddedToCart(true);
                        }
                      }}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                      Add to Cart
                    </button>
                    <button
                      onClick={customMode ? handleCustomQuote : handleQuote}
                      disabled={quoting}
                      className="px-4 py-3 border border-charcoal-700 hover:border-charcoal-600 text-charcoal-400 hover:text-charcoal-300 text-[11px] rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {quoting ? <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : "↻ Refresh"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={customMode ? handleCustomQuote : handleQuote}
                    disabled={quoting || (customMode && !selectedMaterial)}
                    className={`flex-1 py-3 ${customMode ? "bg-amber-500 hover:bg-amber-400" : "bg-emerald-500 hover:bg-emerald-400"} text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
                  >
                    {quoting ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Getting price...</>
                    ) : "Get Live Price"}
                  </button>
                )}
              </div>
            ) : (
              <a href="/cart" className="block w-full py-3 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-sm rounded-lg uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                Added — View Cart
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Catalog Client ─── */
export default function CatalogClient({ initialParts, initialFacets }: {
  initialParts?: CatalogPart[];
  initialFacets?: { makes: Array<{ name: string; count: number }>; models: Array<{ name: string; count: number }>; years: Array<{ start: number; end: number | null; label: string }> };
}) {
  const [parts, setParts] = useState<CatalogPart[]>(initialParts || []);
  const [loading, setLoading] = useState(!initialParts);
  const [error, setError] = useState<string | null>(null);
  const [seg, setSeg] = useState("all");
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [facets, setFacets] = useState<{ makes: Array<{ name: string; count: number }>; models: Array<{ name: string; count: number }>; years: Array<{ start: number; end: number | null; label: string }> }>(initialFacets || { makes: [], models: [], years: [] });
  const [contributeSent, setContributeSent] = useState(false);
  const [selectedPart, setSelectedPart] = useState<CatalogPart | null>(null);
  const [contForm, setContForm] = useState({
    partDescription: "", application: "", name: "", email: "", phone: "", company: "",
    segment: "", make: "", model: "", year: "", condition: "", partNumber: "",
  });
  const [contPhotos, setContPhotos] = useState<File[]>([]);
  const [contCadFiles, setContCadFiles] = useState<File[]>([]);
  const [contSubmitting, setContSubmitting] = useState(false);
  const [bounties, setBounties] = useState<Array<{
    id: string; title: string; description: string | null; segment: string | null;
    make: string | null; model: string | null; year_start: number | null; year_end: number | null;
    reward: string | null; priority: string; status: string;
  }>>([]);
  const [claimingBounty, setClaimingBounty] = useState<string | null>(null);
  const [claimForm, setClaimForm] = useState({ name: "", email: "", notes: "" });
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [claimSent, setClaimSent] = useState(false);

  const fetchParts = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (seg !== "all") params.set("segment", seg);
      if (make) params.set("make", make);
      if (model) params.set("model", model);
      if (year) params.set("year", year);
      if (search) params.set("search", search);
      const res = await fetch(`/api/catalog?${params}`);
      const data = await res.json();
      if (data.success) setParts(data.parts);
      else setError(data.error);
    } catch {
      setError("Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, [seg, make, model, year, search]);

  const fetchFacets = useCallback(async () => {
    const params = new URLSearchParams();
    if (seg !== "all") params.set("segment", seg);
    if (make) params.set("make", make);
    try {
      const res = await fetch(`/api/catalog/facets?${params}`);
      const data = await res.json();
      if (data.success) setFacets(data);
    } catch { /* ignore */ }
  }, [seg, make]);

  const hasInitialData = !!(initialParts && initialParts.length > 0);
  useEffect(() => { fetchParts(!hasInitialData); }, [fetchParts, hasInitialData]);
  useEffect(() => { fetchFacets(); }, [fetchFacets]);
  useEffect(() => {
    fetch("/api/bounties").then((r) => r.json()).then((d) => { if (d.success) setBounties(d.bounties); }).catch(() => {});
  }, []);

  const dbPartsExist = parts.length > 0;

  return (
    <>
      {/* Catalog */}
      <section id="catalog" className="py-16 md:py-24 blueprint-grid">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          {/* Search + filters */}
          <div className="max-w-4xl mx-auto mb-10">
            <div className="relative mb-5">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by part name, make, model..."
                className="w-full bg-charcoal-900 border border-charcoal-800/60 rounded-xl pl-11 pr-4 py-3.5 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40"
              />
            </div>
            {/* Segment chips */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setSeg("all"); setMake(""); setModel(""); setYear(""); }} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${seg === "all" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                All
              </button>
              {SEGMENTS.map((s) => (
                <button key={s.id} onClick={() => { setSeg(s.id); setMake(""); setModel(""); setYear(""); }} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${seg === s.id ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                  {s.label}
                </button>
              ))}
            </div>

            {/* Make chips — show when we have makes */}
            {facets.makes.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-2">Make</p>
                <div className="flex flex-wrap gap-1.5">
                  {make && (
                    <button onClick={() => { setMake(""); setModel(""); setYear(""); }} className="px-2.5 py-1 rounded-full text-[11px] font-medium text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300 transition-all">
                      All Makes
                    </button>
                  )}
                  {facets.makes.map((m) => (
                    <button key={m.name} onClick={() => { setMake(m.name); setModel(""); setYear(""); }} className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${make === m.name ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                      {m.name} <span className="text-charcoal-400 ml-0.5">({m.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Model chips — show when a make is selected and we have models */}
            {make && facets.models.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-2">Model</p>
                <div className="flex flex-wrap gap-1.5">
                  {model && (
                    <button onClick={() => { setModel(""); setYear(""); }} className="px-2.5 py-1 rounded-full text-[11px] font-medium text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300 transition-all">
                      All Models
                    </button>
                  )}
                  {facets.models.map((m) => (
                    <button key={m.name} onClick={() => { setModel(m.name); setYear(""); }} className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${model === m.name ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                      {m.name} <span className="text-charcoal-400 ml-0.5">({m.count})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Year chips — show when we have year ranges */}
            {make && facets.years.length > 1 && (
              <div className="mt-3">
                <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-2">Year</p>
                <div className="flex flex-wrap gap-1.5">
                  {year && (
                    <button onClick={() => setYear("")} className="px-2.5 py-1 rounded-full text-[11px] font-medium text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300 transition-all">
                      All Years
                    </button>
                  )}
                  {facets.years.map((y) => (
                    <button key={y.label} onClick={() => setYear(String(y.start))} className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${year === String(y.start) ? "bg-gold-500/15 text-gold-400 border border-gold-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                      {y.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active filter breadcrumb */}
            {(make || model || year) && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-charcoal-300">Filtering:</span>
                {make && <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">{make}</span>}
                {model && <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">{model}</span>}
                {year && <span className="text-[10px] px-2 py-0.5 rounded bg-gold-500/10 text-gold-400 border border-gold-500/20">{year}</span>}
                <button onClick={() => { setMake(""); setModel(""); setYear(""); }} className="text-[10px] text-charcoal-400 hover:text-red-400 transition-colors">Clear all</button>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400 max-w-2xl mx-auto text-center">
              {error}
              <button onClick={() => fetchParts()} className="ml-3 underline text-xs">Retry</button>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <svg className="animate-spin w-5 h-5 text-charcoal-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              <span className="text-sm text-charcoal-400">Loading catalog...</span>
            </div>
          ) : dbPartsExist ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {parts.map((part) => (
                <div key={part.id} onClick={() => setSelectedPart(part)} className="cursor-pointer">
                  <PartCard part={part} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-lg font-medium text-charcoal-300 mb-2">No parts in the catalog yet</p>
              <p className="text-sm text-charcoal-300 max-w-md mx-auto">
                Parts will appear here as they&apos;re scanned and added through the admin panel.
                In the meantime, you can request a part below.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Bounty Board */}
      {bounties.length > 0 && (
        <section id="bounty" className="py-16 md:py-24 border-t border-charcoal-800/30">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-10">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Bounty Board</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Parts We&apos;re Looking For
              </h2>
              <p className="mt-4 text-charcoal-300 leading-relaxed">
                Have one of these parts sitting in your shop? Send it to us — we&apos;ll 3D-scan it, build the model, and send you a replacement at cost plus the listed reward.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bounties.map((b) => (
                <div key={b.id} className={`bg-charcoal-900/60 border rounded-xl p-5 transition-all ${b.priority === "high" ? "border-gold-500/30" : "border-charcoal-800/50"}`}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-sm font-bold text-white">{b.title}</h3>
                    {b.priority === "high" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold uppercase shrink-0">Urgent</span>
                    )}
                  </div>
                  {b.description && <p className="text-xs text-charcoal-300 leading-relaxed mb-3">{b.description}</p>}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {b.segment && <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-charcoal-300 uppercase">{b.segment}</span>}
                    {b.make && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{b.make}</span>}
                    {b.model && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{b.model}</span>}
                    {b.year_start && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800 text-charcoal-300">
                        {b.year_start === b.year_end || !b.year_end ? b.year_start : `${b.year_start}–${b.year_end}`}
                      </span>
                    )}
                  </div>
                  {b.reward && (
                    <div className="bg-gold-500/5 border border-gold-500/15 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs text-gold-400 font-medium">{b.reward}</p>
                    </div>
                  )}
                  {claimingBounty === b.id ? (
                    <div className="space-y-2">
                      {claimSent ? (
                        <div className="text-center py-3">
                          <p className="text-xs text-emerald-400 font-medium">Claim submitted! We&apos;ll be in touch.</p>
                        </div>
                      ) : (
                        <>
                          <input type="text" value={claimForm.name} onChange={(e) => setClaimForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your name" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded px-3 py-2 text-xs text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                          <input type="email" value={claimForm.email} onChange={(e) => setClaimForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded px-3 py-2 text-xs text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                          <div className="flex gap-2">
                            <button
                              disabled={claimSubmitting || !claimForm.name || !claimForm.email}
                              onClick={async () => {
                                setClaimSubmitting(true);
                                try {
                                  const res = await fetch("/api/bounties", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bountyId: b.id, ...claimForm }) });
                                  const data = await res.json();
                                  if (data.success) { setClaimSent(true); setBounties((prev) => prev.filter((x) => x.id !== b.id)); }
                                } catch { /* ignore */ }
                                finally { setClaimSubmitting(false); }
                              }}
                              className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] rounded uppercase tracking-wider disabled:opacity-50 transition-colors"
                            >
                              {claimSubmitting ? "Submitting..." : "I Have This Part"}
                            </button>
                            <button onClick={() => { setClaimingBounty(null); setClaimSent(false); }} className="px-3 py-2 border border-charcoal-700 text-charcoal-400 text-[10px] rounded uppercase tracking-wider">
                              Cancel
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => { setClaimingBounty(b.id); setClaimForm({ name: "", email: "", notes: "" }); setClaimSent(false); }}
                      className="w-full py-2.5 bg-charcoal-800 hover:bg-charcoal-700 text-emerald-400 font-bold text-[11px] rounded uppercase tracking-wider transition-colors"
                    >
                      I Have This Part
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contributor */}
      <section id="contribute" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Contributor Program</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Send the Broken One.<br /><span className="text-emerald-400">Get the New One at Cost.</span>
              </h2>
              <p className="mt-6 text-charcoal-300 leading-relaxed max-w-md">
                Ship us a worn-out part. We 3D-scan it, build the model, and manufacture a replacement at our cost. Your original comes back too.
              </p>
            </div>

            <div className="bg-charcoal-900 border border-charcoal-800/60 rounded-2xl p-6 sm:p-8 card-glow">
              {!contributeSent ? (
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Submit a Donor Part</h3>
                  {(() => {
                    const cSet = (k: string, v: string) => setContForm((f) => ({ ...f, [k]: v }));
                    const inputCls = "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40";
                    const labelCls = "block text-[11px] font-semibold text-charcoal-300 mb-2 uppercase tracking-wider";
                    return (
                      <>
                        <div>
                          <label className={labelCls}>Part Description *</label>
                          <input type="text" value={contForm.partDescription} onChange={(e) => cSet("partDescription", e.target.value)} placeholder="e.g., Battery tray, throttle bracket" className={inputCls} />
                        </div>
                        <div>
                          <label className={labelCls}>Application / Fitment *</label>
                          <input type="text" value={contForm.application} onChange={(e) => cSet("application", e.target.value)} placeholder="What machine or vehicle does it fit?" className={inputCls} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className={labelCls}>Make</label>
                            <input type="text" value={contForm.make} onChange={(e) => cSet("make", e.target.value)} placeholder="Ford" className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Model</label>
                            <input type="text" value={contForm.model} onChange={(e) => cSet("model", e.target.value)} placeholder="8N" className={inputCls} />
                          </div>
                          <div>
                            <label className={labelCls}>Year(s)</label>
                            <input type="text" value={contForm.year} onChange={(e) => cSet("year", e.target.value)} placeholder="1948-1952" className={inputCls} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelCls}>Segment</label>
                            <select value={contForm.segment} onChange={(e) => cSet("segment", e.target.value)} className={inputCls}>
                              <option value="">Select...</option>
                              {SEGMENTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Condition</label>
                            <select value={contForm.condition} onChange={(e) => cSet("condition", e.target.value)} className={inputCls}>
                              <option value="">Select...</option>
                              <option value="good">Good — minor wear</option>
                              <option value="fair">Fair — usable as reference</option>
                              <option value="poor">Poor — damaged but scannable</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelCls}>Part Number (if known)</label>
                          <input type="text" value={contForm.partNumber} onChange={(e) => cSet("partNumber", e.target.value)} placeholder="OEM part number" className={inputCls} />
                        </div>

                        {/* Photo upload */}
                        <div>
                          <label className={labelCls}>Photos of the Part</label>
                          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-charcoal-700/50 rounded-lg cursor-pointer hover:border-emerald-500/30 transition-colors">
                            <svg className="w-5 h-5 text-charcoal-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.04l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                            <span className="text-sm text-charcoal-400">{contPhotos.length > 0 ? `${contPhotos.length} photo${contPhotos.length > 1 ? "s" : ""} selected` : "Add photos"}</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) setContPhotos(Array.from(e.target.files)); }} />
                          </label>
                          {contPhotos.length > 0 && (
                            <div className="flex gap-2 mt-2 overflow-x-auto">
                              {contPhotos.map((f, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-charcoal-800/50 shrink-0">
                                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                                  <button onClick={() => setContPhotos((p) => p.filter((_, j) => j !== i))} className="absolute top-0 right-0 bg-black/60 text-white w-4 h-4 text-[10px] flex items-center justify-center">×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CAD file upload */}
                        <div>
                          <label className={labelCls}>CAD Files (optional)</label>
                          <p className="text-[10px] text-charcoal-300 mb-2">
                            Already have a model? Upload STEP, STL, IGES, Fusion 360, SolidWorks, or any CAD format.
                          </p>
                          <label className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-charcoal-700/50 rounded-lg cursor-pointer hover:border-blue-500/30 transition-colors">
                            <svg className="w-5 h-5 text-charcoal-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m0 0l2.25-2.25M9.75 15l2.25 2.25M2.25 9v9.75A2.25 2.25 0 004.5 21h15a2.25 2.25 0 002.25-2.25V9M2.25 9V6.75A2.25 2.25 0 014.5 4.5h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H19.5A2.25 2.25 0 0121.75 9v0" /></svg>
                            <span className="text-sm text-charcoal-400">{contCadFiles.length > 0 ? `${contCadFiles.length} CAD file${contCadFiles.length > 1 ? "s" : ""} selected` : "Add CAD files"}</span>
                            <input type="file" accept=".step,.stp,.stl,.iges,.igs,.f3d,.f3z,.sldprt,.sldasm,.x_t,.x_b,.sat,.3mf,.obj,.dxf,.dwg" multiple className="hidden" onChange={(e) => { if (e.target.files) setContCadFiles(Array.from(e.target.files)); }} />
                          </label>
                          {contCadFiles.length > 0 && (
                            <div className="space-y-1 mt-2">
                              {contCadFiles.map((f, i) => (
                                <div key={i} className="flex items-center justify-between bg-charcoal-950/40 rounded px-3 py-1.5 border border-charcoal-800/30">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                                    <span className="text-xs text-charcoal-300 truncate">{f.name}</span>
                                    <span className="text-[10px] text-charcoal-400 shrink-0">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                                  </div>
                                  <button onClick={() => setContCadFiles((p) => p.filter((_, j) => j !== i))} className="text-charcoal-400 hover:text-red-400 text-xs ml-2">×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="border-t border-charcoal-800/40 pt-5">
                          <p className="text-[10px] text-charcoal-300 uppercase tracking-wider font-semibold mb-3">Your Information</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>Name *</label>
                              <input type="text" value={contForm.name} onChange={(e) => cSet("name", e.target.value)} placeholder="Name or shop" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Email *</label>
                              <input type="email" value={contForm.email} onChange={(e) => cSet("email", e.target.value)} placeholder="Email" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Phone</label>
                              <input type="tel" value={contForm.phone} onChange={(e) => cSet("phone", e.target.value)} placeholder="Phone" className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Company / Shop</label>
                              <input type="text" value={contForm.company} onChange={(e) => cSet("company", e.target.value)} placeholder="Company (optional)" className={inputCls} />
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                  <button
                    disabled={contSubmitting || !contForm.partDescription || !contForm.application || !contForm.name || !contForm.email}
                    onClick={async () => {
                      setContSubmitting(true);
                      try {
                        const fd = new FormData();
                        fd.append("data", JSON.stringify(contForm));
                        contPhotos.forEach((f) => fd.append("photos", f));
                        contCadFiles.forEach((f) => fd.append("cadFiles", f));
                        const res = await fetch("/api/contribute", { method: "POST", body: fd });
                        const data = await res.json();
                        if (data.success) {
                          setContributeSent(true);
                          setContForm({ partDescription: "", application: "", name: "", email: "", phone: "", company: "", segment: "", make: "", model: "", year: "", condition: "", partNumber: "" });
                          setContPhotos([]);
                          setContCadFiles([]);
                        }
                      } catch { /* ignore */ }
                      finally { setContSubmitting(false); }
                    }}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wide disabled:opacity-50"
                  >
                    {contSubmitting ? "Submitting..." : "Submit Donor Part"}
                  </button>
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 border border-emerald-500/15">
                    <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Received</h3>
                  <p className="text-sm text-charcoal-300">We&apos;ll follow up within 2 business days.</p>
                  <button onClick={() => setContributeSent(false)} className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-medium">Submit Another</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Part detail modal */}
      {selectedPart && <PartModal part={selectedPart} onClose={() => setSelectedPart(null)} />}
    </>
  );
}
