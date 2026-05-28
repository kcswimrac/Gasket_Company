"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import SiteHeader from "@/components/SiteHeader";

/* ─── Animation ─── */
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
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BgImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="100vw"
      quality={75}
    />
  );
}

const images = {
  hero: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1920&q=80&auto=format&fit=crop",
  capabilities: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1920&q=80&auto=format&fit=crop",
  contributor: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80&auto=format&fit=crop",
  cta: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=1920&q=80&auto=format&fit=crop",
};

/* ═══════════════════════════════════════════
   HERO — Say what you do in one breath
   ═══════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="snap-section bg-obsidian">
      <div className="absolute inset-0">
        <BgImage src={images.hero} alt="Machine shop" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 to-obsidian/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/40" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-3xl">
          <FadeUp>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-extrabold tracking-tight leading-[0.92] text-white">
              Send us the part.
              <br />
              <span className="text-gold-400">We make a new one.</span>
            </h1>
          </FadeUp>

          <FadeUp delay={0.15}>
            <div className="mt-10 grid sm:grid-cols-2 gap-6 max-w-2xl">
              <div className="border-l-2 border-gold-400/40 pl-5">
                <h2 className="text-base font-bold text-white mb-1.5">Reproduction Parts</h2>
                <p className="text-sm text-charcoal-300 leading-relaxed">
                  Obsolete, discontinued, or unobtainable — send us the original.
                  We 3D-scan it, reverse engineer it, and fabricate an exact replacement.
                </p>
              </div>
              <div className="border-l-2 border-gold-400/40 pl-5">
                <h2 className="text-base font-bold text-white mb-1.5">Custom Gaskets</h2>
                <p className="text-sm text-charcoal-300 leading-relaxed">
                  Upload a DXF or snap a photo on paper for scale.
                  We laser-cut your replacement in cork, rubber, neoprene, fiber, or paper. Ships in 24 hours.
                </p>
              </div>
            </div>
          </FadeUp>

          {/* Authority stats bar */}
          <FadeUp delay={0.3}>
            <div className="mt-10 flex flex-wrap gap-8 sm:gap-12">
              {[
                { value: "±1/32\"", label: "Accuracy" },
                { value: "24hr", label: "Gasket turnaround" },
                { value: "5–7 day", label: "Parts turnaround" },
                { value: "0", label: "Minimum order" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-extrabold text-white leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-charcoal-400 uppercase tracking-widest mt-1.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="mt-12 flex flex-wrap gap-4">
              <a
                href="/gaskets#quote"
                className="px-9 py-4 bg-white text-obsidian font-bold text-sm rounded tracking-wide uppercase transition-all hover:bg-gold-400"
              >
                Upload a Gasket
              </a>
              <a
                href="/catalog"
                className="px-9 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-sm rounded tracking-wide uppercase transition-all hover:bg-white/20"
              >
                Browse Parts Catalog
              </a>
              <a
                href="/catalog#contribute"
                className="px-9 py-4 border border-white/10 text-white/60 hover:text-white hover:border-white/25 font-medium text-sm rounded tracking-wide uppercase transition-all"
              >
                Send Us a Part
              </a>
            </div>
          </FadeUp>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent"
          />
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   WHAT WE MAKE — one section, clear grid
   ═══════════════════════════════════════════ */
function CapabilitiesSection() {
  const capabilities = [
    {
      title: "Custom Gaskets",
      desc: "Upload a DXF or photo. We laser-cut paper, cork, rubber, fiber, or neoprene. Ships in 1–2 days.",
      href: "/gaskets",
      cta: "Upload now",
      lead: "1–2 days",
    },
    {
      title: "Classic Car Parts",
      desc: "Brackets, trim, linkages, covers. 3D-scanned from originals. OEM Spec, Improved, or Custom material.",
      href: "/catalog",
      cta: "Browse catalog",
      lead: "5–7 days",
    },
    {
      title: "Tractor & Farm",
      desc: "Ford N-series, Farmall, JD, Massey, AC. Instrument panels, battery trays, PTO shields, air cleaners.",
      href: "/catalog",
      cta: "Browse catalog",
      lead: "5–7 days",
    },
    {
      title: "Marine & Industrial",
      desc: "Mercury cowl latches, OMC brackets, South Bend lathe gibs, pump housings. Salt-killed and obsolete.",
      href: "/catalog",
      cta: "Browse catalog",
      lead: "5–10 days",
    },
    {
      title: "Vintage Motorcycles",
      desc: "Honda CB, Yamaha XS, BMW airhead, Triumph. Side covers, brackets, footpeg mounts, ignition covers.",
      href: "/catalog",
      cta: "Browse catalog",
      lead: "5–7 days",
    },
    {
      title: "Reverse Engineering",
      desc: "Send us any part. We 3D-scan it, model it, and add it to the library. You get a replacement at cost.",
      href: "/catalog#contribute",
      cta: "Submit a part",
      lead: "10–15 days",
    },
  ];

  return (
    <section className="snap-section bg-obsidian">
      <div className="absolute inset-0">
        <BgImage src={images.capabilities} alt="Precision tools and manufacturing" />
      </div>
      <div className="absolute inset-0 bg-obsidian/90" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <FadeUp>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400/80 mb-3">
            Capabilities
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.0] max-w-xl">
            What we make.
          </h2>
        </FadeUp>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
          {capabilities.map((cap, i) => (
            <FadeUp key={cap.title} delay={0.05 * i}>
              <a
                href={cap.href}
                className="block bg-obsidian p-7 hover:bg-charcoal-950 transition-colors group h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-white group-hover:text-gold-400 transition-colors">
                    {cap.title}
                  </h3>
                  <span className="text-[10px] font-mono text-charcoal-500 uppercase tracking-wider">
                    {cap.lead}
                  </span>
                </div>
                <p className="text-sm text-charcoal-400 leading-relaxed mb-5">
                  {cap.desc}
                </p>
                <span className="text-xs text-gold-400/60 group-hover:text-gold-400 uppercase tracking-widest font-medium transition-colors flex items-center gap-2">
                  {cap.cta}
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </a>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PROCESS — tight, punchy, numbered
   ═══════════════════════════════════════════ */
function ProcessSection() {
  const steps = [
    "Send us the original — broken, corroded, worn, doesn't matter",
    "We 3D-scan and reverse engineer a clean digital model",
    "We manufacture the replacement — CNC, laser, water jet",
    "You get both parts back — original and new",
    "The model enters our library for future orders",
  ];

  return (
    <section className="snap-section bg-charcoal-950">
      <div className="absolute inset-0 blueprint-grid" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <FadeUp>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400/80 mb-3">
                How it works
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-[1.0]">
                Five steps.
                <br />
                <span className="text-gold-400">No runaround.</span>
              </h2>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="mt-4 flex items-center gap-3 text-xs text-charcoal-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  CO2 Laser
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  Water Jet
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  CNC Mill & Lathe
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                  3D Scanner
                </span>
              </div>
            </FadeUp>
          </div>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <FadeUp key={i} delay={0.1 * i}>
                <div className="flex gap-6 py-5 border-b border-white/5 group">
                  <span className="text-2xl font-extrabold text-white/8 group-hover:text-gold-400/30 transition-colors font-mono leading-none w-8 shrink-0 pt-0.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-base text-charcoal-300 group-hover:text-white transition-colors leading-relaxed">
                    {step}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   CONTRIBUTOR — the flywheel pitch
   ═══════════════════════════════════════════ */
function ContributorSection() {
  return (
    <section className="snap-section bg-obsidian">
      <div className="absolute inset-0">
        <BgImage src={images.contributor} alt="Worn parts on a workbench" />
      </div>
      <div className="absolute inset-0 bg-obsidian/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-obsidian/50" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <FadeUp>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold-400/80 mb-3">
              Contributor Program
            </p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.0]">
              Send the broken one.
              <br />
              <span className="text-gold-400">Get a new one at cost.</span>
            </h2>
          </FadeUp>

          <FadeUp delay={0.15}>
            <p className="mt-8 text-lg text-charcoal-200 leading-relaxed font-light max-w-lg">
              Ship us a worn-out, cracked, or corroded part. We 3D-scan it,
              build the digital model, and manufacture a fresh replacement.
              You get the new part at our cost — deeply discounted — and your
              original back. We add the model to the library so others can order it too.
            </p>
          </FadeUp>

          <FadeUp delay={0.3}>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-sm">
              {[
                { value: "$0", label: "Scanning cost" },
                { value: "At Cost", label: "Your replacement" },
                { value: "Named", label: "Contributor credit" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px] text-charcoal-400 uppercase tracking-widest mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.45}>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/catalog#contribute"
                className="px-9 py-4 bg-white text-obsidian font-bold text-sm rounded tracking-wide uppercase transition-all hover:bg-gold-400"
              >
                Submit a Donor Part
              </a>
              <a
                href="/catalog#bounty"
                className="px-9 py-4 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium text-sm rounded tracking-wide uppercase transition-all backdrop-blur-sm"
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
   FINAL CTA — close hard
   ═══════════════════════════════════════════ */
function FinalCTA() {
  return (
    <section className="snap-section bg-obsidian">
      <div className="absolute inset-0">
        <BgImage src={images.cta} alt="Workshop with warm lighting" />
      </div>
      <div className="absolute inset-0 bg-obsidian/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/20 to-obsidian/50" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
        <FadeUp>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[0.95]">
            Have a part
            <br />
            nobody makes?
          </h2>
        </FadeUp>

        <FadeUp delay={0.15}>
          <p className="mt-6 text-xl text-charcoal-200 font-light">
            We do.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalog#contribute"
              className="px-10 py-5 bg-white text-obsidian font-bold text-sm rounded tracking-wide uppercase transition-all hover:bg-gold-400"
            >
              Start a Part Request
            </a>
            <a
              href="mailto:parts@backyardrestoration.com"
              className="px-10 py-5 border border-white/20 text-white/80 hover:text-white hover:border-white/40 font-medium text-sm rounded tracking-wide uppercase transition-all backdrop-blur-sm"
            >
              Email Us Photos
            </a>
          </div>
        </FadeUp>

        <FadeUp delay={0.45}>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-white/25">
            <a href="tel:+15551234567" className="hover:text-white/50 transition-colors">(555) 123-4567</a>
            <span className="hidden sm:inline text-white/10">·</span>
            <a href="mailto:parts@backyardrestoration.com" className="hover:text-white/50 transition-colors">parts@backyardrestoration.com</a>
          </div>
        </FadeUp>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/5 py-5">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/15">&copy; {new Date().getFullYear()} Backyard Restoration</p>
          <div className="flex gap-6">
            <a href="/gaskets" className="text-[11px] text-white/15 hover:text-white/30 transition-colors">Gaskets</a>
            <a href="/catalog" className="text-[11px] text-white/15 hover:text-white/30 transition-colors">Catalog</a>
            <a href="/catalog#contribute" className="text-[11px] text-white/15 hover:text-white/30 transition-colors">Contribute</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PAGE — 5 sections, not 9
   ═══════════════════════════════════════════ */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="snap-container">
        <HeroSection />
        <CapabilitiesSection />
        <ProcessSection />
        <ContributorSection />
        <FinalCTA />
      </main>
    </>
  );
}
