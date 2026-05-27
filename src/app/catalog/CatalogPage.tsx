"use client";

import { useState, useEffect, useCallback } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const SEGMENTS = [
  { id: "tractor", label: "Vintage Tractors" },
  { id: "marine", label: "Marine & Outboard" },
  { id: "automotive", label: "Classic Automotive" },
  { id: "motorcycle", label: "Vintage Motorcycle" },
  { id: "industrial", label: "Industrial & Machinery" },
];

const FITMENT_COLORS: Record<string, string> = {
  verified: "bg-emerald-500/8 text-emerald-400 border-emerald-500/15",
  scan_verified: "bg-gold-500/8 text-gold-400 border-gold-500/15",
  reference: "bg-copper-500/8 text-copper-400 border-copper-500/15",
};
const FITMENT_LABELS: Record<string, string> = {
  verified: "Verified Fit",
  scan_verified: "Scan Verified",
  reference: "Reference",
};

interface Variant {
  id: string;
  tier: string;
  material: string;
  process: string;
  base_price: string | null;
  lead_time_days: number | null;
  available: boolean;
  displayPrice: string | null;
  priceIsEstimate: boolean;
}

interface CatalogPart {
  id: string;
  name: string;
  segment: string;
  make: string | null;
  model: string | null;
  year_start: number | null;
  year_end: number | null;
  application: string;
  description: string | null;
  fitment_status: string;
  contributor_name: string | null;
  variants: Variant[];
  files: Array<{
    id: string;
    file_type: string;
    file_name: string;
    file_url: string;
    is_step_file: boolean;
  }>;
}

interface CartQuote {
  variantId: string;
  unitPrice: string | null;
  totalPrice: string | null;
  leadTimeDays: number | null;
  isEstimate: boolean;
  source: string;
  message?: string;
  quoteId?: string;
}

/* ─── Part Card ─── */
function PartCard({ part }: { part: CatalogPart }) {
  const [activeTier, setActiveTier] = useState(0);
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [qty, setQty] = useState(1);

  const variant = part.variants[activeTier] || null;
  const hasVariants = part.variants.length > 0;

  const handleAddToCart = async () => {
    setQuoting(true);
    setQuote(null);
    try {
      const res = await fetch("/api/cart/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: variant.id, quantity: qty }),
      });
      const data = await res.json();
      if (data.success) {
        setQuote(data.quote);
      }
    } catch {
      setQuote({
        variantId: variant.id,
        unitPrice: variant.base_price,
        totalPrice: variant.base_price ? (parseFloat(variant.base_price) * qty).toFixed(2) : null,
        leadTimeDays: variant.lead_time_days,
        isEstimate: true,
        source: "error",
        message: "Could not reach pricing service. Showing estimate.",
      });
    } finally {
      setQuoting(false);
    }
  };

  const yearDisplay = part.year_start && part.year_end
    ? `${part.year_start}–${part.year_end}`
    : part.year_start ? `${part.year_start}+` : "";

  const tierLabels: Record<string, string> = {
    fitment_check: "3D Fit",
    oem: "OEM",
    improved: "Improved",
    custom: "Custom",
  };

  const photos = part.files?.filter((f) => f.file_type.startsWith("photo")) || [];
  const heroPhoto = photos[0];

  return (
    <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl overflow-hidden hover:border-emerald-500/12 transition-all group">
      {/* Photo or placeholder */}
      {heroPhoto ? (
        <div className="relative h-40 bg-charcoal-950 border-b border-charcoal-800/40 overflow-hidden">
          <img src={heroPhoto.file_url} alt={part.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-sm ${FITMENT_COLORS[part.fitment_status] || ""}`}>
              {FITMENT_LABELS[part.fitment_status] || part.fitment_status}
            </span>
          </div>
          {photos.length > 1 && (
            <span className="absolute bottom-2 right-2 text-[9px] text-white/60 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded">
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
          <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{part.name}</h3>
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
        <p className="text-[11px] text-charcoal-500 mt-0.5">{part.application}</p>
        {part.description && !part.description.startsWith("Published from") && !part.description.startsWith("New scan version") && !part.description.startsWith("Revision scan") && (
          <p className="text-xs text-charcoal-400 leading-relaxed mb-4 line-clamp-2">{part.description}</p>
        )}

        {/* Tier tabs */}
        {hasVariants && part.variants.length > 1 && (
          <div className="flex rounded-lg bg-charcoal-950/60 p-0.5 mb-4 border border-charcoal-800/30">
            {part.variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => { setActiveTier(i); setQuote(null); }}
                className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md uppercase tracking-wider transition-all ${
                  activeTier === i
                    ? v.tier === "fitment_check" ? "bg-blue-500/15 text-blue-400" : "bg-charcoal-800 text-white"
                    : "text-charcoal-500 hover:text-charcoal-300"
                }`}
              >
                {tierLabels[v.tier] || v.tier}
              </button>
            ))}
          </div>
        )}

        {/* Variant details */}
        {variant ? (
          <div className="bg-charcoal-950/40 rounded-lg p-3 mb-4 border border-charcoal-800/30 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-charcoal-500">Material</span>
              <span className="text-charcoal-200 font-medium text-right max-w-[60%] truncate">{variant.material}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-charcoal-500">Process</span>
              <span className="text-charcoal-200 font-medium text-right max-w-[60%] truncate">{variant.process}</span>
            </div>
            {variant.lead_time_days && (
              <div className="flex justify-between text-[11px]">
                <span className="text-charcoal-500">Lead Time</span>
                <span className="text-charcoal-200 font-medium">{variant.lead_time_days} days</span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-charcoal-950/40 rounded-lg p-3 mb-4 border border-charcoal-800/30">
            <p className="text-[11px] text-charcoal-500">Material tiers coming soon — contact us for pricing.</p>
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
          <p className="text-[10px] text-charcoal-600 mb-3">
            Scanned from donor by {part.contributor_name}
          </p>
        )}

        {/* Price + Add to Cart */}
        <div className="pt-3 border-t border-charcoal-800/40">
          {!variant ? (
            <a href={`mailto:parts@backyardrestoration.com?subject=Quote request: ${encodeURIComponent(part.name)}&body=${encodeURIComponent(`Part: ${part.name}\nApplication: ${part.application}\nQuantity: 1\n\nPlease provide a quote for this part.`)}`} className="inline-flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
              Request a quote
            </a>
          ) : !quote ? (
            <div className="flex items-end justify-between">
              <div>
                {variant.displayPrice ? (
                  <>
                    <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">
                      {variant.priceIsEstimate ? "Est. from" : "Price"}
                    </span>
                    <p className="text-lg font-bold text-white">${variant.displayPrice}</p>
                  </>
                ) : (
                  <span className="text-xs text-charcoal-500">Request estimate</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="1" max="999" value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 bg-charcoal-950 border border-charcoal-700/50 rounded px-2 py-1.5 text-xs text-charcoal-100 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                />
                <button
                  onClick={handleAddToCart}
                  disabled={quoting}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[11px] rounded transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/10 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {quoting ? (
                    <>
                      <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Quoting...
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Live quote result */}
              <div className={`rounded-lg p-3 ${quote.isEstimate ? "bg-gold-500/5 border border-gold-500/15" : "bg-emerald-500/5 border border-emerald-500/15"}`}>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-charcoal-500">
                      {quote.isEstimate ? "Estimated price" : "Quoted price"}
                    </span>
                    {quote.unitPrice ? (
                      <p className="text-xl font-bold text-white">
                        ${quote.totalPrice}
                        <span className="text-xs text-charcoal-400 font-normal ml-1.5">
                          (${quote.unitPrice} × {qty})
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-charcoal-400">Contact us for pricing</p>
                    )}
                  </div>
                  {quote.leadTimeDays && (
                    <span className="text-xs text-charcoal-300">{quote.leadTimeDays} day lead</span>
                  )}
                </div>

                {quote.message && (
                  <p className="text-[11px] text-charcoal-400 leading-relaxed">{quote.message}</p>
                )}

                {!quote.isEstimate && (
                  <p className="text-[10px] text-emerald-400/70 mt-1">
                    Live price from AutoQuote • {quote.source === "autoquote_cached" ? "Cached" : "Fresh"}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                {quote.unitPrice && (
                  <button className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[11px] rounded uppercase tracking-wider transition-colors">
                    Proceed to Checkout
                  </button>
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
  const [activeTier, setActiveTier] = useState(0);
  const [quoting, setQuoting] = useState(false);
  const [quote, setQuote] = useState<CartQuote | null>(null);
  const [qty, setQty] = useState(1);
  const variant = part.variants[activeTier];

  const handleQuote = async () => {
    if (!variant) return;
    setQuoting(true); setQuote(null);
    try {
      const res = await fetch("/api/cart/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId: variant.id, quantity: qty }) });
      const data = await res.json();
      if (data.success) setQuote(data.quote);
    } catch { /* fallback handled in PartCard */ }
    finally { setQuoting(false); }
  };

  const yearDisplay = part.year_start && part.year_end ? `${part.year_start}–${part.year_end}` : part.year_start ? `${part.year_start}+` : "";
  const tierLabels: Record<string, string> = { fitment_check: "3D Test-Fit", oem: "OEM Spec", improved: "Improved", custom: "Custom" };

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
            <p className="text-xs text-charcoal-500 mt-0.5">{part.application}</p>
          </div>
          <button onClick={onClose} className="text-charcoal-500 hover:text-charcoal-300 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          {part.description && <p className="text-sm text-charcoal-300 leading-relaxed">{part.description}</p>}

          {/* Contributor credit */}
          {part.contributor_name && (
            <p className="text-xs text-charcoal-500 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-emerald-500/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Scanned from donor by {part.contributor_name}
            </p>
          )}

          {/* Tier selector */}
          {part.variants.length > 0 && (
            <div>
              <p className="text-[10px] text-charcoal-500 uppercase tracking-wider font-semibold mb-3">Material Tiers</p>
              <div className="space-y-2">
                {part.variants.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => { setActiveTier(i); setQuote(null); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${activeTier === i ? "border-emerald-500/25 bg-emerald-500/3" : "border-charcoal-800/40 hover:border-charcoal-700/50"}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-white">{tierLabels[v.tier] || v.tier}</span>
                      <span className="text-sm font-bold text-white">
                        {v.displayPrice ? (v.priceIsEstimate ? `est. $${v.displayPrice}` : `$${v.displayPrice}`) : "Request quote"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-charcoal-400">
                      <span>{v.material}</span>
                      <span>{v.process}</span>
                    </div>
                    {v.lead_time_days && <p className="text-[11px] text-charcoal-500 mt-1">{v.lead_time_days} day lead time</p>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quote + order section */}
          {variant && (
            <div className="bg-charcoal-950/40 rounded-xl p-5 border border-charcoal-800/30">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-[10px] text-charcoal-500 uppercase tracking-wider">
                    {tierLabels[variant.tier]} — {variant.material}
                  </p>
                  {variant.displayPrice && (
                    <p className="text-2xl font-bold text-white mt-1">
                      {variant.priceIsEstimate ? "est. " : ""}${variant.displayPrice}
                      <span className="text-xs text-charcoal-500 font-normal ml-1">/ unit</span>
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-charcoal-500 uppercase">Qty</label>
                  <input type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="w-16 bg-charcoal-950 border border-charcoal-700/50 rounded px-2 py-2 text-sm text-charcoal-100 text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                </div>
              </div>

              {quote && (
                <div className={`rounded-lg p-3 mb-4 ${quote.isEstimate ? "bg-gold-500/5 border border-gold-500/15" : "bg-emerald-500/5 border border-emerald-500/15"}`}>
                  {quote.unitPrice ? (
                    <p className="text-lg font-bold text-white">${quote.totalPrice} <span className="text-xs text-charcoal-400 font-normal">(${quote.unitPrice} × {qty})</span></p>
                  ) : (
                    <p className="text-sm text-charcoal-400">Contact us for pricing</p>
                  )}
                  {quote.leadTimeDays && <p className="text-xs text-charcoal-400 mt-1">{quote.leadTimeDays} day lead time</p>}
                  {quote.message && <p className="text-[11px] text-charcoal-500 mt-1">{quote.message}</p>}
                </div>
              )}

              <button
                onClick={handleQuote}
                disabled={quoting}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-lg uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {quoting ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Getting live price...</>
                ) : quote ? "Update Quote" : "Get Live Price & Add to Cart"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Catalog Page ─── */
export default function CatalogPage() {
  const [parts, setParts] = useState<CatalogPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seg, setSeg] = useState("all");
  const [search, setSearch] = useState("");
  const [contributeSent, setContributeSent] = useState(false);
  const [selectedPart, setSelectedPart] = useState<CatalogPart | null>(null);
  const [contForm, setContForm] = useState({ partDescription: "", application: "", name: "", email: "" });
  const [contSubmitting, setContSubmitting] = useState(false);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (seg !== "all") params.set("segment", seg);
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
  }, [seg, search]);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  const dbPartsExist = parts.length > 0;

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 metal-texture overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/0 via-transparent to-obsidian pointer-events-none" />
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Parts Library</span>
              <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-white leading-[1.1]">
                The Parts Nobody Makes Anymore.
                <br /><span className="text-emerald-400">We Do.</span>
              </h1>
              <p className="mt-6 text-base text-charcoal-400 max-w-xl leading-relaxed">
                {dbPartsExist
                  ? `${parts.length} parts in the library. 3D-scanned from originals. OEM, Improved, or Custom tiers. New parts added as we scan.`
                  : "Our parts library is being built. Check back soon or submit a part request below."
                }
              </p>
            </div>
          </div>
        </section>

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
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSeg("all")} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${seg === "all" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                  All
                </button>
                {SEGMENTS.map((s) => (
                  <button key={s.id} onClick={() => setSeg(s.id)} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${seg === s.id ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4 mb-6 text-sm text-red-400 max-w-2xl mx-auto text-center">
                {error}
                <button onClick={fetchParts} className="ml-3 underline text-xs">Retry</button>
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
                <p className="text-sm text-charcoal-500 max-w-md mx-auto">
                  Parts will appear here as they&apos;re scanned and added through the admin panel.
                  In the meantime, you can request a part below.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contributor */}
        <section id="contribute" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Contributor Program</span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Send the Broken One.<br /><span className="text-emerald-400">Get the New One at Cost.</span>
                </h2>
                <p className="mt-6 text-charcoal-400 leading-relaxed max-w-md">
                  Ship us a worn-out part. We 3D-scan it, build the model, and manufacture a replacement at our cost. Your original comes back too.
                </p>
              </div>

              <div className="bg-charcoal-900 border border-charcoal-800/60 rounded-2xl p-6 sm:p-8 card-glow">
                {!contributeSent ? (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Submit a Donor Part</h3>
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">What Part?</label>
                      <input type="text" value={contForm.partDescription} onChange={(e) => setContForm((f) => ({ ...f, partDescription: e.target.value }))} placeholder="e.g., Battery tray, throttle bracket" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">What Does It Fit?</label>
                      <input type="text" value={contForm.application} onChange={(e) => setContForm((f) => ({ ...f, application: e.target.value }))} placeholder="Year, make, model" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Name</label>
                        <input type="text" value={contForm.name} onChange={(e) => setContForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name or shop" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Email</label>
                        <input type="email" value={contForm.email} onChange={(e) => setContForm((f) => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                      </div>
                    </div>
                    <button
                      disabled={contSubmitting}
                      onClick={async () => {
                        setContSubmitting(true);
                        try {
                          const res = await fetch("/api/contribute", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contForm) });
                          const data = await res.json();
                          if (data.success) { setContributeSent(true); setContForm({ partDescription: "", application: "", name: "", email: "" }); }
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
                    <p className="text-sm text-charcoal-400">We&apos;ll follow up within 2 business days.</p>
                    <button onClick={() => setContributeSent(false)} className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-medium">Submit Another</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Part detail modal */}
        {selectedPart && <PartModal part={selectedPart} onClose={() => setSelectedPart(null)} />}
      </main>
      <SiteFooter />
    </>
  );
}
