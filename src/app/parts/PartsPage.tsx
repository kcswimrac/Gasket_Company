"use client";

import { useState } from "react";
import {
  CATALOG,
  CATEGORIES,
  type PartCategory,
  type CatalogPart,
} from "@/lib/partvault/catalog";

/* ─── Header ─── */
function PVHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { label: "Catalog", href: "#catalog" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Request a Part", href: "#request" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian/85 backdrop-blur-xl border-b border-charcoal-800/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/parts" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-tight">PartVault</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-blue-400/70 font-medium leading-tight">Restoration Parts</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-10">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-[13px] text-charcoal-400 hover:text-blue-400 transition-colors tracking-wide uppercase font-medium">
                {l.label}
              </a>
            ))}
            <a href="/" className="text-[13px] text-charcoal-600 hover:text-charcoal-400 transition-colors tracking-wide font-medium">
              QuickSeal Gaskets
            </a>
          </nav>

          <a href="#catalog" className="hidden md:inline-flex px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-[13px] rounded tracking-wide transition-all shadow-lg shadow-blue-500/15 uppercase">
            Browse Parts
          </a>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-charcoal-400 hover:text-blue-400" aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" /></>)}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40" style={{ backgroundColor: "rgba(8, 9, 13, 0.99)" }}>
          <div className="px-6 py-8 space-y-1 bg-charcoal-950 min-h-full">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-lg text-charcoal-300 hover:text-blue-400 py-4 border-b border-charcoal-800/40">
                {l.label}
              </a>
            ))}
            <a href="/" className="block text-lg text-charcoal-500 hover:text-charcoal-300 py-4 border-b border-charcoal-800/40">
              ← QuickSeal Gaskets
            </a>
            <div className="pt-6">
              <a href="#catalog" onClick={() => setMobileOpen(false)} className="block px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-base rounded text-center uppercase">
                Browse Parts
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─── */
function PVHero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 metal-texture overflow-hidden">
      <div className="gasket-ring w-[500px] h-[500px] -top-40 -right-40 opacity-30" style={{ borderColor: "rgba(59,130,246,0.08)" }} />

      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/0 via-transparent to-obsidian pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-blue-500/8 text-blue-400 border border-blue-500/15 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Digital Parts Library
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-500/8 text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">
              Fabricated On Demand
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08]">
            <span className="text-white">The Part You Need.</span>
            <br />
            <span className="text-white">Scanned. Modeled.</span>
            <br />
            <span className="text-blue-400">Fabricated.</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-charcoal-400 max-w-xl leading-relaxed">
            We maintain a growing digital library of 3D-scanned hard-to-find parts.
            When you order, we fabricate it fresh — precision-made from the original spec.
            Classic cars, motorcycles, tractors, marine, industrial equipment.
          </p>

          <p className="mt-5 text-sm sm:text-base text-charcoal-200 font-semibold border-l-2 border-blue-500 pl-4">
            If it&apos;s discontinued, obsolete, or unobtainable — check the vault.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
            <a href="#catalog" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm rounded tracking-wide transition-all shadow-lg shadow-blue-500/15 uppercase">
              Browse the Catalog
              <svg className="ml-2.5 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a href="#request" className="inline-flex items-center justify-center px-8 py-4 border border-charcoal-700 hover:border-blue-500/30 text-charcoal-300 hover:text-blue-300 font-medium text-sm rounded tracking-wide transition-all uppercase">
              Request a Part
            </a>
          </div>

          <div className="mt-10 gold-divider max-w-sm" style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)" }} />

          <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-charcoal-500">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />3D-Scanned Originals</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Precision Fabricated</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" />No Minimum Order</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */
function PVHowItWorks() {
  const steps = [
    { num: "01", title: "We Scan", desc: "We source original parts and create precision 3D scans — preserving every dimension, curve, and mounting point in a digital model." },
    { num: "02", title: "You Browse", desc: "Search our growing catalog by vehicle, category, or part name. Every listing includes specs, compatibility, and material options." },
    { num: "03", title: "You Order", desc: "Select your part and material. No minimum quantities. One-off or small batch — same precision, same price per unit." },
    { num: "04", title: "We Fabricate & Ship", desc: "Your part is fabricated from the 3D model, inspected, and shipped. Most parts in 5–10 business days." },
  ];

  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">The Process</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">From Scan to Part</h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto">We do the hard work of sourcing and scanning. You just order what you need.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {steps.map((s, i) => (
            <div key={s.num} className="relative bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl p-6 sm:p-7 hover:border-blue-500/15 transition-all group">
              {i < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t border-dashed border-charcoal-700/50" />}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[11px] font-mono font-bold text-blue-500/40">{s.num}</span>
                <div className="w-11 h-11 rounded-xl bg-charcoal-800/60 flex items-center justify-center text-charcoal-400 group-hover:text-blue-400 transition-all border border-charcoal-700/30">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    {s.num === "01" && <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />}
                    {s.num === "02" && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />}
                    {s.num === "03" && <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />}
                    {s.num === "04" && <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />}
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-2.5">{s.title}</h3>
              <p className="text-[13px] text-charcoal-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Part Card ─── */
function PartCard({ part }: { part: CatalogPart }) {
  const isAvailable = part.status === "available";

  return (
    <div className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl overflow-hidden hover:border-blue-500/15 transition-all group">
      {/* 3D render placeholder */}
      <div className="bg-charcoal-950 border-b border-charcoal-800/40 p-6 flex items-center justify-center h-44 relative">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="text-charcoal-700 group-hover:text-charcoal-600 transition-colors">
          <rect x="10" y="20" width="60" height="40" rx="4" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
          <path d="M10 20 L25 8 H85 V48 L70 60" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <line x1="70" y1="60" x2="85" y2="48" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.5" />
          <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="1" />
          <circle cx="40" cy="40" r="3" fill="currentColor" opacity="0.3" />
        </svg>
        <span className="absolute top-3 left-3 text-[9px] font-mono text-charcoal-600 uppercase">{part.id}</span>
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${isAvailable ? "bg-emerald-500/8 text-emerald-400 border border-emerald-500/15" : "bg-gold-500/8 text-gold-400 border border-gold-500/15"}`}>
          <span className={`w-1 h-1 rounded-full ${isAvailable ? "bg-emerald-400" : "bg-gold-400"}`} />
          {isAvailable ? "Available" : "Coming Soon"}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{part.name}</h3>
        <p className="text-[11px] text-blue-400/70 font-medium mb-3">{part.compatibleWith}</p>
        <p className="text-xs text-charcoal-400 leading-relaxed mb-4 line-clamp-2">{part.description}</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
            <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Material</span>
            <p className="text-xs text-charcoal-200 font-medium mt-0.5 truncate">{part.material}</p>
          </div>
          <div className="bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30">
            <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Lead Time</span>
            <p className="text-xs text-charcoal-200 font-medium mt-0.5">{part.leadTime}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-charcoal-800/40">
          <div>
            <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">Price Range</span>
            <p className="text-base font-bold text-white">{part.priceRange}</p>
          </div>
          {isAvailable ? (
            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-[11px] rounded transition-all uppercase tracking-wider shadow-lg shadow-blue-500/10">
              Order
            </button>
          ) : (
            <button className="px-4 py-2 border border-charcoal-700 hover:border-blue-500/25 text-charcoal-400 hover:text-blue-300 font-medium text-[11px] rounded transition-all uppercase tracking-wider">
              Notify Me
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Catalog ─── */
function PVCatalog() {
  const [activeCategory, setActiveCategory] = useState<PartCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = CATALOG.filter((p) => {
    if (activeCategory !== "all" && p.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.compatibleWith.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const availableCount = CATALOG.filter((p) => p.status === "available").length;

  return (
    <section id="catalog" className="py-24 md:py-32 blueprint-grid relative">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">Parts Library</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">The Vault</h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto">
            {availableCount} parts ready to fabricate. New parts added weekly as we scan and model more originals.
          </p>
        </div>

        {/* Search + filters */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="relative mb-5">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by part name, vehicle, or material..."
              className="w-full bg-charcoal-900 border border-charcoal-800/60 rounded-xl pl-11 pr-4 py-3.5 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${activeCategory === "all" ? "bg-blue-500/15 text-blue-400 border border-blue-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}
            >
              All ({CATALOG.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = CATALOG.filter((p) => p.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-all ${activeCategory === cat.id ? "bg-blue-500/15 text-blue-400 border border-blue-500/25" : "bg-charcoal-900/40 text-charcoal-500 border border-charcoal-800/50 hover:text-charcoal-300"}`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((part) => (
              <PartCard key={part.id} part={part} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-charcoal-500">No parts match your search.</p>
            <button onClick={() => { setSearchQuery(""); setActiveCategory("all"); }} className="mt-3 text-sm text-blue-400 hover:text-blue-300">
              Clear filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Request a Part ─── */
function PVRequest() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="request" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">Can&apos;t Find It?</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">Request a Part</h2>
            <p className="mt-5 text-charcoal-400 leading-relaxed max-w-md">
              If the part you need isn&apos;t in the vault yet, tell us about it. We&apos;ll
              evaluate whether we can source an original, scan it, and add it to the library.
              You&apos;ll be first in line when it&apos;s ready.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Describe the part and what it fits",
                "We evaluate sourcing and scan feasibility",
                "You get notified when it's modeled and ready to order",
                "No commitment until you place the order",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-400 flex-shrink-0 mt-0.5 border border-blue-500/15">
                    {i + 1}
                  </span>
                  <p className="text-sm text-charcoal-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-charcoal-900 border border-charcoal-800/60 rounded-2xl p-6 sm:p-8 card-glow">
            {!submitted ? (
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Part Description</label>
                  <textarea rows={3} placeholder="What part do you need? Include any markings, measurements, or details you have..." className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Vehicle / Equipment</label>
                  <input type="text" placeholder="Year, make, model, engine — as specific as possible" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Your Name</label>
                    <input type="text" placeholder="Name" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider">Email</label>
                    <input type="email" placeholder="Email" className="w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500/40" />
                  </div>
                </div>
                <button
                  onClick={() => setSubmitted(true)}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-blue-500/10 uppercase tracking-wide"
                >
                  Submit Request
                </button>
                <p className="text-[11px] text-charcoal-600 text-center">No commitment. We&apos;ll follow up within 2 business days.</p>
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-5 border border-emerald-500/15">
                  <svg className="w-7 h-7 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Request Submitted</h3>
                <p className="text-sm text-charcoal-400 max-w-xs mx-auto">We&apos;ll evaluate your request and follow up within 2 business days.</p>
                <button onClick={() => setSubmitted(false)} className="mt-6 text-xs text-blue-400 hover:text-blue-300 uppercase tracking-wider font-medium">Submit Another</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Final CTA ─── */
function PVCTA() {
  return (
    <section className="py-24 md:py-32 metal-texture relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/40 via-charcoal-950/60 to-charcoal-900/40 pointer-events-none" />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
          <span className="text-white">Stop Searching.</span>
          <br />
          <span className="text-blue-400">Start Restoring.</span>
        </h2>
        <p className="mt-6 text-charcoal-400 max-w-lg mx-auto text-base leading-relaxed">
          If the part exists, we&apos;ve probably scanned it. If we haven&apos;t, request it and we&apos;ll add it to the vault.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#catalog" className="inline-flex items-center justify-center px-9 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-blue-500/15 uppercase tracking-wide">
            Browse Parts
          </a>
          <a href="#request" className="inline-flex items-center justify-center px-9 py-4 border border-charcoal-700 hover:border-blue-500/25 text-charcoal-300 hover:text-blue-300 font-medium text-sm rounded-lg transition-all uppercase tracking-wide">
            Request a Part
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function PVFooter() {
  return (
    <footer className="border-t border-charcoal-800/40 py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">PartVault</span>
            </div>
            <p className="text-xs text-charcoal-500 leading-relaxed max-w-xs">
              Hard-to-find restoration parts, 3D-scanned from originals and fabricated on demand. Classic cars, motorcycles, tractors, marine, and industrial equipment.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {[["Catalog", "#catalog"], ["How It Works", "#how-it-works"], ["Request a Part", "#request"], ["QuickSeal Gaskets", "/"]].map(([label, href]) => (
                <li key={href}><a href={href} className="text-xs text-charcoal-500 hover:text-blue-400 transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              <li><a href="tel:+15551234567" className="hover:text-blue-400 transition-colors">(555) 123-4567</a></li>
              <li><a href="mailto:parts@partvault.com" className="hover:text-blue-400 transition-colors">parts@partvault.com</a></li>
              <li className="text-charcoal-600">Mon–Fri, 8 AM – 5 PM CT</li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Turnaround</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              <li>Most parts: 5–10 business days</li>
              <li>Complex fabrication: 10–15 days</li>
              <li>Rush available on select parts</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-charcoal-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-charcoal-600">&copy; {new Date().getFullYear()} PartVault. All rights reserved.</p>
          <p className="text-[11px] text-charcoal-700">Precision restoration parts fabricated in the USA.</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page Composition ─── */
export default function PartsPage() {
  return (
    <>
      <PVHeader />
      <main>
        <PVHero />
        <PVHowItWorks />
        <PVCatalog />
        <PVRequest />
        <PVCTA />
      </main>
      <PVFooter />
    </>
  );
}
