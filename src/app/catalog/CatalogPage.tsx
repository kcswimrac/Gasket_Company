"use client";

import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import {
  CATALOG,
  BOUNTY_BOARD,
  SEGMENTS,
  FITMENT_BADGES,
  type Segment,
  type CatalogEntry,
  type FitmentStatus,
  type BountyEntry,
} from "@/lib/restoration/catalog";

/* ─── Fitment Badge ─── */
function FitBadge({ status }: { status: FitmentStatus }) {
  const b = FITMENT_BADGES[status];
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/8 text-emerald-400 border-emerald-500/15",
    gold: "bg-gold-500/8 text-gold-400 border-gold-500/15",
    copper: "bg-copper-500/8 text-copper-400 border-copper-500/15",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${colors[b.color]}`} title={b.description}>
      <span className={`w-1 h-1 rounded-full ${b.color === "emerald" ? "bg-emerald-400" : b.color === "gold" ? "bg-gold-400" : "bg-copper-400"}`} />
      {b.label}
    </span>
  );
}

/* ─── Part Card ─── */
function PartCard({ part }: { part: CatalogEntry }) {
  const [activeTier, setActiveTier] = useState(0);
  const tier = part.tiers[activeTier];

  return (
    <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl overflow-hidden hover:border-emerald-500/12 transition-all group">
      <div className="bg-charcoal-950 border-b border-charcoal-800/40 p-5 h-36 flex items-center justify-center relative">
        <svg width="64" height="64" viewBox="0 0 80 80" fill="none" className="text-charcoal-700 group-hover:text-charcoal-600 transition-colors">
          <rect x="10" y="20" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
          <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="1" />
          <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.3" />
        </svg>
        <span className="absolute top-3 left-3 text-[9px] font-mono text-charcoal-600 uppercase">{part.id}</span>
        <div className="absolute top-3 right-3"><FitBadge status={part.fitment} /></div>
      </div>

      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-0.5 group-hover:text-emerald-300 transition-colors">{part.name}</h3>
        <p className="text-[11px] text-emerald-400/70 font-medium mb-2">{part.application}</p>
        <p className="text-xs text-charcoal-400 leading-relaxed mb-4 line-clamp-2">{part.description}</p>

        {/* Tier tabs */}
        <div className="flex rounded-lg bg-charcoal-950/60 p-0.5 mb-4 border border-charcoal-800/30">
          {part.tiers.map((t, i) => (
            <button key={t.tier} onClick={() => setActiveTier(i)} className={`flex-1 py-1.5 text-[10px] font-semibold rounded-md uppercase tracking-wider transition-all ${activeTier === i ? (t.tier === "fitment_check" ? "bg-blue-500/15 text-blue-400 shadow-sm" : "bg-charcoal-800 text-white shadow-sm") : "text-charcoal-500 hover:text-charcoal-300"}`}>
              {t.tier === "oem" ? "OEM" : t.tier === "improved" ? "Improved" : t.tier === "fitment_check" ? "3D Fit" : "Custom"}
            </button>
          ))}
        </div>

        <div className="bg-charcoal-950/40 rounded-lg p-3 mb-4 border border-charcoal-800/30 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-charcoal-500">Material</span>
            <span className="text-charcoal-200 font-medium text-right max-w-[60%] truncate">{tier.material}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-charcoal-500">Process</span>
            <span className="text-charcoal-200 font-medium text-right max-w-[60%] truncate">{tier.process}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-charcoal-500">Lead Time</span>
            <span className="text-charcoal-200 font-medium">{part.leadTime}</span>
          </div>
        </div>

        {tier.tier === "fitment_check" && (
          <div className="bg-blue-500/4 border border-blue-500/12 rounded-lg p-2.5 mb-4">
            <p className="text-[10px] text-blue-300/80 leading-relaxed">
              <strong className="text-blue-400">Test-Fit:</strong> 3D-printed mockup for dimensional check only.
            </p>
          </div>
        )}

        {part.contributor && (
          <p className="text-[10px] text-charcoal-600 mb-3 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-emerald-500/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Scanned from donor by {part.contributor.name}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-charcoal-800/40">
          <div>
            <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Price</span>
            <p className="text-base font-bold text-white">{tier.price}</p>
          </div>
          {tier.available ? (
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[11px] rounded transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/10">Order</button>
          ) : (
            <button className="px-4 py-2 border border-charcoal-700 hover:border-emerald-500/25 text-charcoal-400 hover:text-emerald-300 font-medium text-[11px] rounded transition-all uppercase tracking-wider">Notify Me</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Bounty Card ─── */
function BountyCard({ bounty }: { bounty: BountyEntry }) {
  const statusLabel = { seeking_donor: "Seeking Donor", scanning: "Scanning", modeling: "Modeling" };
  const statusColor = { seeking_donor: "text-gold-400 bg-gold-500/8 border-gold-500/15", scanning: "text-blue-400 bg-blue-500/8 border-blue-500/15", modeling: "text-copper-400 bg-copper-500/8 border-copper-500/15" };

  return (
    <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-xl p-5 hover:border-emerald-500/10 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-white">{bounty.partName}</h4>
          <p className="text-[11px] text-charcoal-400 mt-0.5">{bounty.application}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusColor[bounty.status]}`}>
          {statusLabel[bounty.status]}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px] text-charcoal-500">
          <span>{bounty.requestedBy} requests</span>
          <span className="text-emerald-400 font-semibold">{bounty.bounty}</span>
        </div>
        {bounty.status === "seeking_donor" && (
          <button className="px-3 py-1.5 bg-emerald-500/8 hover:bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold rounded uppercase tracking-wider transition-colors border border-emerald-500/15">
            I Have This Part
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function CatalogPage() {
  const [seg, setSeg] = useState<Segment | "all">("all");
  const [search, setSearch] = useState("");
  const [contributeSent, setContributeSent] = useState(false);

  const filtered = CATALOG.filter((p) => {
    if (seg !== "all" && p.segment !== seg) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.application.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const availableCount = CATALOG.filter((p) => p.tiers.some((t) => t.available)).length;

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
                <br />
                <span className="text-emerald-400">We Do.</span>
              </h1>
              <p className="mt-6 text-base text-charcoal-400 max-w-xl leading-relaxed">
                {availableCount} parts ready to fabricate across {SEGMENTS.length} segments.
                3D-scanned from originals. OEM Spec, Improved, or Custom material tiers.
                New parts added weekly.
              </p>
            </div>
          </div>
        </section>

        {/* Verified Fit legend */}
        <section className="py-6 border-b border-charcoal-800/40">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {(Object.entries(FITMENT_BADGES) as [FitmentStatus, typeof FITMENT_BADGES["verified"]][]).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-[11px] text-charcoal-400">
                  <FitBadge status={key} />
                  <span className="hidden sm:inline text-charcoal-500">{val.description}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Catalog */}
        <section id="catalog" className="py-16 md:py-24 blueprint-grid">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto mb-10">
              <div className="relative mb-5">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by part name, year/make/model..." className="w-full bg-charcoal-900 border border-charcoal-800/60 rounded-xl pl-11 pr-4 py-3.5 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40" />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSeg("all")} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${seg === "all" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                  All ({CATALOG.length})
                </button>
                {SEGMENTS.map((s) => {
                  const count = CATALOG.filter((p) => p.segment === s.id).length;
                  return (
                    <button key={s.id} onClick={() => setSeg(s.id)} className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${seg === s.id ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}>
                      {s.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((part) => <PartCard key={part.id} part={part} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-charcoal-500">No parts match your search.</p>
                <button onClick={() => { setSearch(""); setSeg("all"); }} className="mt-3 text-sm text-emerald-400 hover:text-emerald-300">Clear filters</button>
              </div>
            )}
          </div>
        </section>

        {/* Contributor Program */}
        <section id="contribute" className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Contributor Royalty Program</span>
                <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                  Send the Broken One.<br />Get a New One Free.<br />
                  <span className="text-emerald-400">Earn Royalties Forever.</span>
                </h2>
                <p className="mt-6 text-charcoal-400 leading-relaxed max-w-md">
                  You have a worn-out part sitting in a box. Send it to us. We scan it, model it,
                  and manufacture a fresh replacement. You get a perfect part — and 5% of every
                  future sale, perpetually.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    { title: "Zero cost to you", desc: "Ship us the original. We cover scanning and first-article production." },
                    { title: "5% royalty — forever", desc: "Every time someone orders that part, you earn." },
                    { title: "Named credit", desc: "Your name on the part page. \"Scanned from donor contributed by...\"" },
                    { title: "Broken is fine", desc: "Cracked, corroded, worn. As long as we can scan the geometry." },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/8 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/12">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-xs text-charcoal-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-charcoal-900 border border-charcoal-800/60 rounded-2xl p-6 sm:p-8 card-glow">
                {!contributeSent ? (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Submit a Donor Part</h3>
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">What Part?</label>
                      <input type="text" placeholder="e.g., Battery tray, throttle linkage bracket" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">What Does It Fit?</label>
                      <input type="text" placeholder="Year, make, model — as specific as possible" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Your Name</label>
                        <input type="text" placeholder="Name or shop" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Email</label>
                        <input type="email" placeholder="Email" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                      </div>
                    </div>
                    <button onClick={() => setContributeSent(true)} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wide">
                      Submit Donor Part
                    </button>
                    <p className="text-[11px] text-charcoal-600 text-center">We&apos;ll send a prepaid shipping label within 2 business days.</p>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 border border-emerald-500/15">
                      <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Submission Received</h3>
                    <p className="text-sm text-charcoal-400 max-w-xs mx-auto">We&apos;ll evaluate and send a prepaid label within 2 business days.</p>
                    <button onClick={() => setContributeSent(false)} className="mt-6 text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-medium">Submit Another</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Bounty Board */}
        <section id="bounty" className="py-24 md:py-32 blueprint-grid">
          <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Community Wanted</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">Bounty Board</h2>
              <p className="mt-5 text-charcoal-400 max-w-xl mx-auto">
                Parts the community needs. Provide a donor part and earn a free reproduction plus perpetual royalties.
              </p>
            </div>
            <div className="space-y-4">
              {BOUNTY_BOARD.map((b) => <BountyCard key={b.id} bounty={b} />)}
            </div>
          </div>
        </section>

        {/* Process + Tiers */}
        <section className="py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Material Tiers</span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">Three Options Per Part</h2>
              <p className="mt-5 text-charcoal-400 max-w-xl mx-auto">Same scan, same fitment — different materials for different needs.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {[
                { tier: "3D Test-Fit", desc: "Low-cost 3D-printed mockup. Verify fitment before committing.", badge: "Check First", color: "blue" },
                { tier: "OEM Spec", desc: "Same material and process as the original. Concours-grade authenticity.", badge: "Authentic", color: "emerald" },
                { tier: "Improved", desc: "Upgraded material. Same fitment, better durability. Better than new.", badge: "Upgraded", color: "emerald" },
                { tier: "Custom", desc: "Your choice of material, finish, and modifications.", badge: "Your Spec", color: "emerald" },
              ].map((t) => (
                <div key={t.tier} className="bg-charcoal-900/30 border border-charcoal-800/50 rounded-xl p-5 text-center">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-3 border ${t.color === "blue" ? "bg-blue-500/8 text-blue-400 border-blue-500/15" : "bg-emerald-500/8 text-emerald-400 border-emerald-500/15"}`}>{t.badge}</span>
                  <h4 className="text-sm font-bold text-white mb-2">{t.tier}</h4>
                  <p className="text-xs text-charcoal-400 leading-relaxed">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
