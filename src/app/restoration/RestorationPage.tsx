"use client";

import { useState } from "react";
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

/* ═══════════════════════════════════════════
   HEADER
   ═══════════════════════════════════════════ */
function BRHeader() {
  const [open, setOpen] = useState(false);
  const links = [
    { label: "Catalog", href: "#catalog" },
    { label: "Contribute", href: "#contribute" },
    { label: "Bounty Board", href: "#bounty" },
    { label: "How It Works", href: "#process" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian/85 backdrop-blur-xl border-b border-charcoal-800/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/restoration" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M11.42 15.17l-5.1-5.1a3 3 0 114.24-4.24l5.1 5.1m-1.41 1.41l5.1 5.1a3 3 0 11-4.24 4.24l-5.1-5.1" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-tight">Backyard Restoration</span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/70 font-medium leading-tight">Scan-Verified Parts</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-[13px] text-charcoal-400 hover:text-emerald-400 transition-colors tracking-wide uppercase font-medium">{l.label}</a>
            ))}
            <a href="/" className="text-[13px] text-charcoal-600 hover:text-charcoal-400 transition-colors font-medium">QuickSeal</a>
          </nav>

          <a href="#catalog" className="hidden md:inline-flex px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[13px] rounded tracking-wide transition-all shadow-lg shadow-emerald-500/15 uppercase">
            Browse Parts
          </a>

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-charcoal-400" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {open ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" /></>)}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-40" style={{ backgroundColor: "rgba(8,9,13,0.99)" }}>
          <div className="px-6 py-8 space-y-1 bg-charcoal-950 min-h-full">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-lg text-charcoal-300 hover:text-emerald-400 py-4 border-b border-charcoal-800/40">{l.label}</a>
            ))}
            <a href="/" className="block text-lg text-charcoal-500 hover:text-charcoal-300 py-4 border-b border-charcoal-800/40">← QuickSeal Gaskets</a>
            <div className="pt-6">
              <a href="#catalog" onClick={() => setOpen(false)} className="block py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded text-center uppercase">Browse Parts</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ═══════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════ */
function BRHero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 metal-texture overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/0 via-transparent to-obsidian pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-500/8 text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Scan-Verified Library
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gold-500/8 text-gold-400 border border-gold-500/15 uppercase tracking-wider">
              Contributor Royalties
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-copper-500/8 text-copper-400 border border-copper-500/15 uppercase tracking-wider">
              No Minimums
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08]">
            <span className="text-white">The Parts Nobody</span>
            <br />
            <span className="text-white">Makes Anymore.</span>
            <br />
            <span className="text-emerald-400">We Do.</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-charcoal-400 max-w-xl leading-relaxed">
            A growing library of 3D-scanned reproduction parts for classic tractors, outboards,
            automobiles, motorcycles, and industrial machinery. Browse the catalog, pick your
            material tier, and we fabricate it on demand.
          </p>

          <p className="mt-5 text-sm sm:text-base text-charcoal-200 font-semibold border-l-2 border-emerald-500 pl-4">
            Send us the broken one. Get a new one free. Earn royalties forever.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
            <a href="#catalog" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded tracking-wide transition-all shadow-lg shadow-emerald-500/15 uppercase">
              Browse the Library
              <svg className="ml-2.5 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a href="#contribute" className="inline-flex items-center justify-center px-8 py-4 border border-charcoal-700 hover:border-emerald-500/30 text-charcoal-300 hover:text-emerald-300 font-medium text-sm rounded tracking-wide transition-all uppercase">
              Become a Contributor
            </a>
          </div>

          {/* Segment chips */}
          <div className="mt-10 flex flex-wrap gap-2.5">
            {SEGMENTS.map((s) => (
              <a key={s.id} href="#catalog" className="px-3 py-1.5 rounded-full text-[11px] font-medium text-charcoal-500 bg-charcoal-900/40 border border-charcoal-800/50 hover:text-emerald-400 hover:border-emerald-500/20 transition-all">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FITMENT BADGE
   ═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   PART CARD (with tier selector)
   ═══════════════════════════════════════════ */
function PartCard({ part }: { part: CatalogEntry }) {
  const [activeTier, setActiveTier] = useState(0);
  const tier = part.tiers[activeTier];

  return (
    <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl overflow-hidden hover:border-emerald-500/12 transition-all group">
      {/* 3D placeholder + badges */}
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
              {t.tier === "oem" ? "OEM" : t.tier === "improved" ? "Improved" : t.tier === "fitment_check" ? "3D Test-Fit" : "Custom"}
            </button>
          ))}
        </div>

        {/* Tier details */}
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

        {/* Fitment check callout */}
        {tier.tier === "fitment_check" && (
          <div className="bg-blue-500/4 border border-blue-500/12 rounded-lg p-3 mb-4">
            <p className="text-[11px] text-blue-300/80 leading-relaxed">
              <strong className="text-blue-400">Test-Fit First:</strong> Low-cost 3D-printed mockup to verify fitment before committing to the final part.
              Not for use — dimensional check only.
            </p>
          </div>
        )}

        {/* Contributor credit */}
        {part.contributor && (
          <p className="text-[10px] text-charcoal-600 mb-3 flex items-center gap-1.5">
            <svg className="w-3 h-3 text-emerald-500/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Scanned from donor by {part.contributor.name}
          </p>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-charcoal-800/40">
          <div>
            <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Price</span>
            <p className="text-base font-bold text-white">{tier.price}</p>
          </div>
          {tier.available ? (
            <button className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[11px] rounded transition-all uppercase tracking-wider shadow-lg shadow-emerald-500/10">
              Order
            </button>
          ) : (
            <button className="px-4 py-2 border border-charcoal-700 hover:border-emerald-500/25 text-charcoal-400 hover:text-emerald-300 font-medium text-[11px] rounded transition-all uppercase tracking-wider">
              Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CATALOG
   ═══════════════════════════════════════════ */
function BRCatalog() {
  const [seg, setSeg] = useState<Segment | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = CATALOG.filter((p) => {
    if (seg !== "all" && p.segment !== seg) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.application.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <section id="catalog" className="py-24 md:py-32 blueprint-grid">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Parts Library</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">The Catalog</h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto">
            {CATALOG.filter((p) => p.tiers.some((t) => t.available)).length} parts ready to fabricate across {SEGMENTS.length} segments. New parts added weekly.
          </p>
        </div>

        {/* Verified Fit legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {(Object.entries(FITMENT_BADGES) as [FitmentStatus, typeof FITMENT_BADGES["verified"]][]).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-[11px] text-charcoal-400">
              <FitBadge status={key} />
              <span className="hidden sm:inline text-charcoal-500">— {val.description}</span>
            </div>
          ))}
        </div>

        {/* Search + segment filters */}
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
  );
}

/* ═══════════════════════════════════════════
   CONTRIBUTOR PROGRAM
   ═══════════════════════════════════════════ */
function BRContribute() {
  const [sent, setSent] = useState(false);

  return (
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
              You have a worn-out, cracked, or corroded part sitting in a box. You can&apos;t use it.
              Send it to us. We scan it, model it, manufacture a fresh replacement, and send both back.
              You get a perfect part — and 5% of every future sale, perpetually.
            </p>

            <div className="mt-8 space-y-5">
              {[
                { title: "Zero cost to you", desc: "Ship us the original. We cover scanning and first-article production. You get a free reproduction." },
                { title: "5% royalty — forever", desc: "Every time someone orders that part, you earn. Passive income from a broken bracket." },
                { title: "Named credit", desc: "Your name (or shop name) on the part page. \"Scanned from donor contributed by...\"" },
                { title: "Broken is fine", desc: "Cracked, corroded, worn. As long as we can scan the geometry, we can reproduce it." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/8 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/12">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-charcoal-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-charcoal-900 border border-charcoal-800/60 rounded-2xl p-6 sm:p-8 card-glow">
            {!sent ? (
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
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Condition</label>
                  <select className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 appearance-none">
                    <option>Intact but worn</option>
                    <option>Cracked or broken</option>
                    <option>Heavily corroded</option>
                    <option>Missing pieces — partial</option>
                  </select>
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
                <button onClick={() => setSent(true)} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wide">
                  Submit Donor Part
                </button>
                <p className="text-[11px] text-charcoal-600 text-center">We&apos;ll send you a prepaid shipping label within 2 business days.</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 border border-emerald-500/15">
                  <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Submission Received</h3>
                <p className="text-sm text-charcoal-400 max-w-xs mx-auto">We&apos;ll evaluate your donor part and send a prepaid shipping label within 2 business days.</p>
                <button onClick={() => setSent(false)} className="mt-6 text-xs text-emerald-400 hover:text-emerald-300 uppercase tracking-wider font-medium">Submit Another</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   BOUNTY BOARD
   ═══════════════════════════════════════════ */
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

function BRBounty() {
  return (
    <section id="bounty" className="py-24 md:py-32">
      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">Community Wanted</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">Bounty Board</h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto">
            Parts the community needs. Provide a donor and earn a free reproduction plus perpetual royalties.
          </p>
        </div>
        <div className="space-y-4">
          {BOUNTY_BOARD.map((b) => <BountyCard key={b.id} bounty={b} />)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════ */
function BRProcess() {
  const steps = [
    { num: "01", title: "We Scan Originals", desc: "We source original parts from contributors, junkyards, and swap meets. Each part is precision 3D-scanned to capture every dimension." },
    { num: "02", title: "We Build the Package", desc: "From the scan: CAD model, manufacturing instructions, tooling list, setup sheet, inspection plan. A complete reproduction package." },
    { num: "03", title: "You Browse & Order", desc: "Pick your part, choose OEM Spec, Improved, or Custom material tier. No minimums — one part or a hundred." },
    { num: "04", title: "We Fabricate & Ship", desc: "Your part is made from the validated manufacturing package, inspected, and shipped with a Certificate of Authenticity and material traceability." },
  ];

  return (
    <section id="process" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">The Process</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">Scan. Model. Fabricate. Ship.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={s.num} className="relative bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl p-6 hover:border-emerald-500/12 transition-all group">
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-charcoal-700/50" />}
              <span className="text-[11px] font-mono font-bold text-emerald-500/40 mb-4 block">{s.num}</span>
              <h3 className="text-base font-bold text-white mb-2.5">{s.title}</h3>
              <p className="text-[13px] text-charcoal-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Tier explanation */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {[
            { tier: "3D Test-Fit", desc: "Low-cost 3D-printed mockup. Verify fitment before ordering the real thing. Available on unverified parts.", badge: "Check First", color: "blue" },
            { tier: "OEM Spec", desc: "Same material and process as the original. For concours and originality-focused restorations.", badge: "Authentic", color: "emerald" },
            { tier: "Improved", desc: "Upgraded material or process. Same fitment, better durability. For daily drivers and \"better than new.\"", badge: "Upgraded", color: "emerald" },
            { tier: "Custom", desc: "Your choice of material, finish, and modifications. For hot rods, race builds, and one-off projects.", badge: "Your Spec", color: "emerald" },
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
  );
}

/* ═══════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════ */
function BRCTA() {
  return (
    <section className="py-24 md:py-32 metal-texture relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/40 via-charcoal-950/60 to-charcoal-900/40 pointer-events-none" />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
          <span className="text-white">If It Existed Once,</span><br />
          <span className="text-emerald-400">We Can Make It Again.</span>
        </h2>
        <p className="mt-6 text-charcoal-400 max-w-lg mx-auto text-base leading-relaxed">
          Browse the catalog. Request what&apos;s missing. Contribute a donor part and earn royalties.
          The library grows every week.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#catalog" className="inline-flex items-center justify-center px-9 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/15 uppercase tracking-wide">Browse Parts</a>
          <a href="#contribute" className="inline-flex items-center justify-center px-9 py-4 border border-charcoal-700 hover:border-emerald-500/25 text-charcoal-300 hover:text-emerald-300 font-medium text-sm rounded-lg transition-all uppercase tracking-wide">Contribute a Part</a>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════ */
function BRFooter() {
  return (
    <footer className="border-t border-charcoal-800/40 py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M11.42 15.17l-5.1-5.1a3 3 0 114.24-4.24l5.1 5.1m-1.41 1.41l5.1 5.1a3 3 0 11-4.24 4.24l-5.1-5.1" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">Backyard Restoration</span>
            </div>
            <p className="text-xs text-charcoal-500 leading-relaxed max-w-xs">
              On-demand reproduction of hardware parts. 3D-scanned from originals. Fabricated when ordered.
              Classic tractors, outboards, automobiles, motorcycles, and industrial machinery.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {[["Catalog", "#catalog"], ["Contribute a Part", "#contribute"], ["Bounty Board", "#bounty"], ["How It Works", "#process"], ["QuickSeal Gaskets", "/"], ["PartVault", "/parts"]].map(([l, h]) => (
                <li key={h}><a href={h} className="text-xs text-charcoal-500 hover:text-emerald-400 transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              <li><a href="tel:+15551234567" className="hover:text-emerald-400 transition-colors">(555) 123-4567</a></li>
              <li><a href="mailto:parts@backyardrestoration.com" className="hover:text-emerald-400 transition-colors">parts@backyardrestoration.com</a></li>
              <li className="text-charcoal-600">Mon–Fri, 8 AM – 5 PM CT</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Segments</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              {SEGMENTS.map((s) => <li key={s.id}>{s.label}</li>)}
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-charcoal-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-charcoal-600">&copy; {new Date().getFullYear()} Backyard Restoration. All rights reserved.</p>
          <p className="text-[11px] text-charcoal-700">Scan-verified reproduction parts fabricated in the USA.</p>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════ */
export default function RestorationPage() {
  return (
    <>
      <BRHeader />
      <main>
        <BRHero />
        <BRCatalog />
        <BRContribute />
        <BRBounty />
        <BRProcess />
        <BRCTA />
      </main>
      <BRFooter />
    </>
  );
}
