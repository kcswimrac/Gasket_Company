import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import HowItWorks from "@/components/HowItWorks";
import QuoteBuilder from "@/components/QuoteBuilder";
import PhotoGuide from "@/components/PhotoGuide";
import Materials from "@/components/Materials";
import UseCases from "@/components/UseCases";
import WhyTrust from "@/components/WhyTrust";
import FAQ from "@/components/FAQ";

export const metadata: Metadata = {
  title: "Custom Gaskets — Backyard Restoration",
  description:
    "Upload a DXF or photo to get a custom replacement gasket. Quick-turn manufacturing with next-day shipping available.",
};

function GasketHero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 metal-texture overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/0 via-transparent to-obsidian pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-500/8 text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Most Orders Ship in 1–2 Days
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-charcoal-800/60 text-charcoal-300 border border-charcoal-700/40 uppercase tracking-wider">
              Rush Available
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08]">
            <span className="text-white">Machine Down?</span>
            <br />
            <span className="text-white">Upload Your Gasket.</span>
            <br />
            <span className="text-emerald-400">Back Up and Running Tomorrow.</span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-charcoal-400 max-w-xl leading-relaxed">
            Send us a DXF file or snap a photo of your gasket on 8.5&quot; x 11&quot;
            paper for scale. We cut an exact replacement and ship it — often
            next day.
          </p>

          <p className="mt-5 text-sm sm:text-base text-charcoal-200 font-semibold border-l-2 border-emerald-500 pl-4">
            If it&apos;s leaking, torn, or obsolete — send it. We&apos;ll cut it.
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs text-charcoal-400 bg-charcoal-900/40 rounded-lg px-4 py-2.5 border border-charcoal-800/50 w-fit">
            <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>
              <strong className="text-charcoal-100">Cut to within ±1/32&quot;</strong> — from photo or DXF
            </span>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
            <a href="/catalog#gasket-quote" className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded tracking-wide transition-all shadow-lg shadow-emerald-500/15 uppercase">
              Upload Your Gasket
              <svg className="ml-2.5 w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 border border-charcoal-700 hover:border-emerald-500/30 text-charcoal-300 hover:text-emerald-300 font-medium text-sm rounded tracking-wide transition-all uppercase">
              See How It Works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-charcoal-500">
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />DXF or Photo</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />No Part Number Needed</span>
            <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />One-Off or Batch</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function GasketCTA() {
  return (
    <section className="py-24 md:py-32 metal-texture relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/40 via-charcoal-950/60 to-charcoal-900/40 pointer-events-none" />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
          <span className="text-white">Stop Waiting on a Gasket.</span>
          <br />
          <span className="text-emerald-400">Upload It Now.</span>
        </h2>
        <p className="mt-6 text-charcoal-400 max-w-lg mx-auto text-base leading-relaxed">
          DXF or photo. One gasket or a hundred. Most orders ship in 1–2 days.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/catalog#gasket-quote" className="inline-flex items-center justify-center px-9 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/15 uppercase tracking-wide">
            Upload Your Gasket
          </a>
          <a href="/catalog" className="inline-flex items-center justify-center px-9 py-4 border border-charcoal-700 hover:border-emerald-500/25 text-charcoal-300 hover:text-emerald-300 font-medium text-sm rounded-lg transition-all uppercase tracking-wide">
            Browse Parts Catalog
          </a>
        </div>
      </div>
    </section>
  );
}

export default function GasketsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <GasketHero />
        <HowItWorks />
        <QuoteBuilder />
        <PhotoGuide />
        <Materials />
        <UseCases />
        <WhyTrust />
        <FAQ />
        <GasketCTA />
      </main>
      <SiteFooter />
    </>
  );
}
