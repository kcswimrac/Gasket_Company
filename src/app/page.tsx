"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SiteHeader from "@/components/SiteHeader";

/* ─── Animation helpers ─── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Service list items ─── */
const services = [
  { num: "01", label: "Custom Cut Gaskets", href: "/gaskets", desc: "DXF or photo. Cut same day. Ship tomorrow." },
  { num: "02", label: "Classic Car Restoration Parts", href: "/catalog", desc: "Brackets, trim, linkages, covers — fabricated from 3D scans." },
  { num: "03", label: "Tractor & Farm Equipment Parts", href: "/catalog", desc: "Ford N-series, Farmall, JD, Massey — the parts dealers can't get." },
  { num: "04", label: "Marine & Industrial Components", href: "/catalog", desc: "Mercury, OMC, Chris-Craft, South Bend — salt-killed and obsolete." },
  { num: "05", label: "Reverse Engineering & 3D Scanning", href: "/catalog#contribute", desc: "Send the broken one. Get a new one. We keep the model." },
];

/* ─── Process steps ─── */
const steps = [
  { num: "01", text: "Send us the original part" },
  { num: "02", text: "We inspect, measure, and 3D scan it" },
  { num: "03", text: "We reverse engineer a clean digital model" },
  { num: "04", text: "We manufacture the replacement" },
  { num: "05", text: "You get the original and new part back" },
  { num: "06", text: "We preserve the model in our restoration library" },
];

/* ═══════════════════════════════════════════
   SECTION 1 — HERO
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="snap-section bg-obsidian">
      {/* Background texture layers */}
      <div className="absolute inset-0 metal-texture" />
      <div className="cinematic-overlay" />
      <div className="shop-light" />
      <div className="grain" />

      {/* Decorative engineering lines */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div className="absolute top-0 left-[10%] w-px h-full bg-gradient-to-b from-transparent via-gold-400/5 to-transparent" />
        <div className="absolute top-0 left-[90%] w-px h-full bg-gradient-to-b from-transparent via-gold-400/5 to-transparent" />
        <div className="absolute top-[30%] left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/5 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: headline */}
          <div>
            <FadeUp>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400/80 mb-6">
                Restoration Manufacturing
              </p>
            </FadeUp>

            <FadeUp delay={0.15}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[0.95] text-white">
                Obsolete
                <br />
                parts,
                <br />
                <span className="text-gold-400">rebuilt.</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="mt-8 text-lg sm:text-xl text-charcoal-300 max-w-md leading-relaxed font-light">
                Send us the part. We scan it, reverse engineer it,
                remake it, and send it back ready to work.
              </p>
            </FadeUp>

            <FadeUp delay={0.45}>
              <div className="mt-10 flex gap-4">
                <a
                  href="#services"
                  className="px-8 py-4 bg-white text-obsidian font-bold text-sm rounded tracking-wide uppercase transition-all hover:bg-gold-400"
                >
                  Start a Part Request
                </a>
                <a
                  href="/catalog#contribute"
                  className="px-8 py-4 border border-charcoal-600 text-charcoal-300 hover:text-white hover:border-charcoal-400 font-medium text-sm rounded tracking-wide uppercase transition-all"
                >
                  Send Us Photos First
                </a>
              </div>
            </FadeUp>
          </div>

          {/* Right: interactive service list */}
          <FadeUp delay={0.4} className="hidden lg:block">
            <nav className="space-y-0">
              {services.map((s) => (
                <a
                  key={s.num}
                  href={s.href}
                  className="group flex items-center gap-6 py-5 border-b border-charcoal-800/40 hover:pl-4 transition-all duration-300"
                >
                  <span className="text-xs font-mono text-gold-400/40 group-hover:text-gold-400 transition-colors">
                    {s.num}
                  </span>
                  <span className="text-lg text-charcoal-400 group-hover:text-white transition-colors font-medium flex-1">
                    {s.label}
                  </span>
                  <svg
                    className="w-5 h-5 text-charcoal-700 group-hover:text-gold-400 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              ))}
            </nav>
          </FadeUp>
        </div>

        {/* Scroll indicator */}
        <FadeUp delay={0.8} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-charcoal-600">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-px h-8 bg-gradient-to-b from-charcoal-600 to-transparent"
            />
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   SERVICE SECTION (reusable per category)
   ═══════════════════════════════════════════ */
function ServiceSection({
  num,
  headline,
  body,
  texture = "metal-texture",
  accent = "from-gold-400/5",
}: {
  num: string;
  headline: string;
  body: string;
  texture?: string;
  accent?: string;
}) {
  return (
    <section id={`service-${num}`} className="snap-section bg-obsidian">
      <div className={`absolute inset-0 ${texture}`} />
      <div className="cinematic-overlay" />
      <div className={`absolute inset-0 bg-gradient-to-br ${accent} to-transparent z-[1] pointer-events-none`} />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <FadeUp>
          <span className="text-xs font-mono text-gold-400/50 tracking-widest">
            {num}
          </span>
        </FadeUp>

        <FadeUp delay={0.15}>
          <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] max-w-3xl">
            {headline}
          </h2>
        </FadeUp>

        <FadeUp delay={0.3}>
          <p className="mt-8 text-lg sm:text-xl text-charcoal-300 max-w-xl leading-relaxed font-light">
            {body}
          </p>
        </FadeUp>

        <FadeUp delay={0.45}>
          <a
            href={num === "01" ? "/gaskets" : "/catalog"}
            className="inline-flex items-center gap-3 mt-10 text-sm text-gold-400/70 hover:text-gold-400 uppercase tracking-widest font-medium transition-colors group"
          >
            {num === "01" ? "Upload a gasket" : "Browse catalog"}
            <svg
              className="w-4 h-4 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </FadeUp>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PROCESS SECTION
   ═══════════════════════════════════════════ */
function ProcessSection() {
  return (
    <section id="process" className="snap-section bg-charcoal-950">
      <div className="absolute inset-0 blueprint-grid" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400/80 mb-4">
            The Process
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] max-w-2xl">
            From broken original
            <br />
            to <span className="text-gold-400">precision replacement.</span>
          </h2>
        </FadeUp>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 max-w-5xl">
          {steps.map((s, i) => (
            <FadeUp key={s.num} delay={0.1 * i}>
              <div className="flex items-start gap-5 group">
                <span className="text-3xl font-extrabold text-charcoal-800 group-hover:text-gold-400/30 transition-colors font-mono leading-none mt-0.5">
                  {s.num}
                </span>
                <p className="text-base text-charcoal-300 leading-relaxed group-hover:text-white transition-colors">
                  {s.text}
                </p>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CONTRIBUTOR CTA SECTION
   ═══════════════════════════════════════════ */
function ContributorSection() {
  return (
    <section className="snap-section bg-obsidian">
      <div className="absolute inset-0 metal-texture" />
      <div className="cinematic-overlay" />
      <div className="shop-light" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <FadeUp>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400/80 mb-6">
              Contributor Program
            </p>
          </FadeUp>

          <FadeUp delay={0.15}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05]">
              Send the broken one.
              <br />
              Get a new one free.
              <br />
              <span className="text-gold-400">Earn royalties forever.</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.3}>
            <p className="mt-8 text-lg text-charcoal-300 max-w-lg mx-auto leading-relaxed font-light">
              You have a worn part in a box. Ship it to us. We scan it, model it,
              make a fresh replacement, and send both back. Plus 5% of every
              future sale — perpetually.
            </p>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/catalog#contribute"
                className="px-10 py-4 bg-white text-obsidian font-bold text-sm rounded tracking-wide uppercase transition-all hover:bg-gold-400"
              >
                Submit a Donor Part
              </a>
              <a
                href="/catalog#bounty"
                className="px-10 py-4 border border-charcoal-600 text-charcoal-300 hover:text-white hover:border-charcoal-400 font-medium text-sm rounded tracking-wide uppercase transition-all"
              >
                View Bounty Board
              </a>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   FINAL CTA
   ═══════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="snap-section bg-obsidian">
      <div className="absolute inset-0 metal-texture" />
      <div className="cinematic-overlay" style={{ background: "linear-gradient(180deg, rgba(8,9,13,0.6) 0%, rgba(8,9,13,0.4) 40%, rgba(8,9,13,0.8) 100%)" }} />
      <div className="grain" />

      {/* Large decorative ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-gold-400/5 pointer-events-none z-[2]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-gold-400/3 pointer-events-none z-[2]" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.0]">
            Have a part
            <br />
            nobody sells
            <br />
            <span className="text-gold-400">anymore?</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalog#contribute"
              className="px-10 py-5 bg-white text-obsidian font-bold text-sm rounded tracking-wide uppercase transition-all hover:bg-gold-400"
            >
              Start a Part Request
            </a>
            <a
              href="mailto:parts@backyardrestoration.com"
              className="px-10 py-5 border border-charcoal-600 text-charcoal-300 hover:text-white hover:border-charcoal-400 font-medium text-sm rounded tracking-wide uppercase transition-all"
            >
              Send Us Photos First
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-charcoal-600">
            <a href="tel:+15551234567" className="hover:text-charcoal-300 transition-colors">(555) 123-4567</a>
            <span className="hidden sm:inline text-charcoal-800">·</span>
            <a href="mailto:parts@backyardrestoration.com" className="hover:text-charcoal-300 transition-colors">parts@backyardrestoration.com</a>
          </div>
        </FadeUp>
      </div>

      {/* Footer bar inside final section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-charcoal-800/30 py-6">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-charcoal-700">
            &copy; {new Date().getFullYear()} Backyard Restoration. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="/gaskets" className="text-[11px] text-charcoal-700 hover:text-charcoal-400 transition-colors">Gaskets</a>
            <a href="/catalog" className="text-[11px] text-charcoal-700 hover:text-charcoal-400 transition-colors">Catalog</a>
            <a href="/catalog#contribute" className="text-[11px] text-charcoal-700 hover:text-charcoal-400 transition-colors">Contribute</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PAGE COMPOSITION
   ═══════════════════════════════════════════ */
export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="snap-container">
        <HeroSection />

        <div id="services">
          <ServiceSection
            num="01"
            headline="Custom gaskets from the part you already have."
            body="Send us the old gasket or a photo on 8.5&quot; x 11&quot; paper. We digitize the profile, clean up the geometry, and laser-cut a replacement in paper, cork, rubber, fiber, or neoprene. Most orders ship in 1–2 days."
          />

          <ServiceSection
            num="02"
            headline="Rare classic car parts, recreated."
            body="When the catalog says unavailable, we build from the part in your hand. Brackets, trim, linkages, handles, covers — 3D-scanned from originals and fabricated in OEM Spec, Improved, or Custom material tiers."
            accent="from-copper-400/3"
          />

          <ServiceSection
            num="03"
            headline="Keep old iron working."
            body="Ford N-series, Farmall, John Deere two-cylinder, Massey, Allis-Chalmers. Instrument panels, battery trays, PTO shields, air cleaners — the parts that don't exist in any catalog. We scan them, model them, and make them."
            texture="blueprint-grid"
          />

          <ServiceSection
            num="04"
            headline="Industrial and marine parts without the OEM runaround."
            body="Mercury Kiekhaefer cowl latches, OMC sterndrive brackets, South Bend lathe gibs, pump housings, corroded hardware. For equipment that still works but no longer has manufacturer support."
            accent="from-blue-400/3"
          />

          <ServiceSection
            num="05"
            headline="Every part becomes part of the library."
            body="Each project builds a searchable archive of hard-to-find parts. Verified Fit badges, manufacturing packages, and full traceability. One scan creates a permanent, reproducible asset for the entire restoration community."
          />
        </div>

        <ProcessSection />
        <ContributorSection />
        <FinalCTA />
      </main>
    </>
  );
}
