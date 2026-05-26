import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 metal-texture overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/0 via-transparent to-obsidian pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-500/8 text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              On-Demand Manufacturing
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-charcoal-800/60 text-charcoal-300 border border-charcoal-700/40 uppercase tracking-wider">
              No Minimums
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08]">
            <span className="text-white">If It Existed Once,</span>
            <br />
            <span className="text-emerald-400">We Can Make It Again.</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-charcoal-400 max-w-xl leading-relaxed">
            Custom gaskets cut from DXF or photo. Reproduction parts fabricated from
            3D-scanned originals. Classic cars, tractors, outboards, motorcycles,
            industrial equipment — if the part is gone, we bring it back.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
            <a
              href="/gaskets"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded tracking-wide transition-all shadow-lg shadow-emerald-500/15 uppercase"
            >
              Custom Gaskets
              <svg className="ml-2.5 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href="/catalog"
              className="inline-flex items-center justify-center px-8 py-4 border border-charcoal-700 hover:border-emerald-500/30 text-charcoal-300 hover:text-emerald-300 font-medium text-sm rounded tracking-wide transition-all uppercase"
            >
              Browse Parts Catalog
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    {
      title: "Custom Gaskets",
      description: "Upload a DXF or snap a photo on 8.5\" x 11\" paper. We cut an exact replacement in paper, cork, rubber, fiber, or neoprene. Most orders ship in 1–2 days.",
      href: "/gaskets",
      cta: "Upload Your Gasket",
      stats: [
        { label: "Turnaround", value: "1–2 days" },
        { label: "Accuracy", value: "±1/32\"" },
      ],
    },
    {
      title: "Reproduction Parts",
      description: "A growing library of 3D-scanned hard-to-find parts. Pick your material tier — OEM Spec, Improved, or Custom. Fabricated on demand, no minimums.",
      href: "/catalog",
      cta: "Browse Catalog",
      stats: [
        { label: "Parts", value: "15+" },
        { label: "Segments", value: "5" },
      ],
    },
    {
      title: "Contributor Program",
      description: "Send us a broken or worn part. We scan it, model it, and send you a free reproduction. Plus 5% royalty on every future sale — forever.",
      href: "/catalog#contribute",
      cta: "Learn More",
      stats: [
        { label: "Your Cost", value: "$0" },
        { label: "Royalty", value: "5%" },
      ],
    },
  ];

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">What We Do</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">Two Services. One Mission.</h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto">
            Keep machines running. Bring restorations to life. Make the parts nobody else will.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-charcoal-900/40 border border-charcoal-800/60 rounded-2xl p-7 hover:border-emerald-500/12 transition-all group flex flex-col">
              <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">{s.title}</h3>
              <p className="text-[13px] text-charcoal-400 leading-relaxed mb-6 flex-1">{s.description}</p>

              <div className="flex gap-4 mb-6">
                {s.stats.map((stat) => (
                  <div key={stat.label} className="bg-charcoal-950/40 rounded-lg px-3 py-2 border border-charcoal-800/30 flex-1">
                    <span className="text-[9px] text-charcoal-500 uppercase tracking-wider">{stat.label}</span>
                    <p className="text-sm text-white font-bold mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

              <a
                href={s.href}
                className="inline-flex items-center justify-center py-3 bg-charcoal-800/60 hover:bg-emerald-500/10 border border-charcoal-700/40 hover:border-emerald-500/20 text-charcoal-300 hover:text-emerald-400 font-semibold text-[12px] rounded-lg transition-all uppercase tracking-wider"
              >
                {s.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Segments() {
  const segments = [
    "Classic Automotive", "Vintage Tractors", "Marine & Outboard",
    "Vintage Motorcycles", "Industrial Machinery",
  ];

  return (
    <section className="py-20 md:py-28 blueprint-grid">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">Segments</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">Built for Real Restoration</h2>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {segments.map((s) => (
            <a key={s} href="/catalog" className="px-5 py-3 rounded-xl bg-charcoal-900/40 border border-charcoal-800/50 text-sm text-charcoal-300 hover:text-emerald-400 hover:border-emerald-500/20 transition-all font-medium">
              {s}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function HomeCTA() {
  return (
    <section className="py-24 md:py-32 metal-texture relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/40 via-charcoal-950/60 to-charcoal-900/40 pointer-events-none" />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
          <span className="text-white">Need a Part?</span>
          <br />
          <span className="text-emerald-400">Let&apos;s Make It.</span>
        </h2>
        <p className="mt-6 text-charcoal-400 max-w-lg mx-auto text-base leading-relaxed">
          Upload a gasket for a fast quote. Browse the catalog for reproduction parts.
          Or contribute a donor and earn royalties.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/gaskets" className="inline-flex items-center justify-center px-9 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/15 uppercase tracking-wide">
            Custom Gaskets
          </a>
          <a href="/catalog" className="inline-flex items-center justify-center px-9 py-4 border border-charcoal-700 hover:border-emerald-500/25 text-charcoal-300 hover:text-emerald-300 font-medium text-sm rounded-lg transition-all uppercase tracking-wide">
            Parts Catalog
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Services />
        <Segments />
        <HomeCTA />
      </main>
      <SiteFooter />
    </>
  );
}
