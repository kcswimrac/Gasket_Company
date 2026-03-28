export default function Hero() {
  return (
    <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 metal-texture overflow-hidden">
      {/* Decorative gasket rings */}
      <div className="gasket-ring w-[600px] h-[600px] -top-48 -right-48 opacity-40" />
      <div className="gasket-ring w-[400px] h-[400px] -top-32 -right-32 opacity-25" />
      <div className="gasket-ring w-[350px] h-[350px] bottom-0 -left-24 opacity-20" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/0 via-transparent to-obsidian pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: copy */}
          <div>
            {/* Urgency badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gold-500/8 text-gold-400 border border-gold-500/15 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                Most Orders Ship in 1–2 Days
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-copper-500/8 text-copper-400 border border-copper-500/15 uppercase tracking-wider">
                Rush Available
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-extrabold tracking-tight leading-[1.08]">
              <span className="text-white">Machine Down?</span>
              <br />
              <span className="text-white">Upload Your Gasket.</span>
              <br />
              <span className="text-gold-gradient">Back Up and Running Tomorrow.</span>
            </h1>

            <p className="mt-7 text-base sm:text-lg text-charcoal-400 max-w-lg leading-relaxed">
              Send us a DXF file or snap a photo of your gasket on 8.5&quot; x 11&quot;
              paper for scale. We cut an exact replacement and ship it — often
              next day.
            </p>

            {/* Hard-hitting value line */}
            <p className="mt-5 text-sm sm:text-base text-charcoal-200 font-semibold border-l-2 border-gold-500 pl-4">
              If it&apos;s down, fix it now.
            </p>

            {/* Accuracy trust line — KEY SIGNAL */}
            <div className="mt-6 flex items-center gap-2 text-xs text-charcoal-400 bg-charcoal-900/40 rounded-lg px-4 py-2.5 border border-charcoal-800/50 w-fit">
              <svg className="w-4 h-4 text-gold-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>
                <strong className="text-charcoal-100">Cut to within ±1/32&quot;</strong> — from photo or DXF
              </span>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-3.5">
              <a
                href="#quote"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian font-bold text-sm rounded tracking-wide transition-all shadow-lg shadow-gold-500/15 uppercase"
              >
                Upload Your Gasket
                <svg
                  className="ml-2.5 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 border border-charcoal-700 hover:border-gold-500/30 text-charcoal-300 hover:text-gold-300 font-medium text-sm rounded tracking-wide transition-all uppercase"
              >
                See How It Works
              </a>
            </div>

            <div className="mt-10 gold-divider max-w-sm" />

            <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-2 text-[13px] text-charcoal-500">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                DXF or Photo
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                No Part Number Needed
              </span>
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
                One-Off or Batch
              </span>
            </div>
          </div>

          {/* Right: sample quote card */}
          <div className="relative">
            <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl p-7 card-glow">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[11px] font-semibold text-charcoal-400 uppercase tracking-[0.15em]">
                  Sample Quote Preview
                </h3>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/8 text-emerald-400 border border-emerald-500/15 uppercase tracking-wider">
                  Ready
                </span>
              </div>

              {/* Mock gasket technical drawing */}
              <div className="bg-charcoal-950 rounded-xl p-8 flex items-center justify-center border border-charcoal-800/50 mb-5">
                <svg
                  width="140"
                  height="140"
                  viewBox="0 0 140 140"
                  fill="none"
                  className="text-charcoal-600"
                >
                  <circle cx="70" cy="70" r="64" stroke="currentColor" strokeWidth="1" strokeDasharray="5 3" />
                  <circle cx="70" cy="70" r="45" stroke="rgba(212, 160, 23, 0.25)" strokeWidth="1.5" />
                  <circle cx="70" cy="70" r="26" stroke="currentColor" strokeWidth="1" strokeDasharray="5 3" />
                  <circle cx="70" cy="16" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <circle cx="70" cy="124" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <circle cx="16" cy="70" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <circle cx="124" cy="70" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <circle cx="32" cy="32" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <circle cx="108" cy="32" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <circle cx="32" cy="108" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <circle cx="108" cy="108" r="4.5" stroke="rgba(212, 160, 23, 0.2)" strokeWidth="1" fill="rgba(212, 160, 23, 0.04)" />
                  <line x1="5" y1="70" x2="135" y2="70" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.3" />
                  <text x="70" y="85" textAnchor="middle" fill="rgba(212, 160, 23, 0.4)" fontSize="8" fontFamily="monospace">
                    6.250&quot; OD
                  </text>
                </svg>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                <div className="bg-charcoal-950/60 rounded-lg px-4 py-3 border border-charcoal-800/30">
                  <span className="text-charcoal-500 text-[10px] uppercase tracking-wider">Material</span>
                  <p className="text-charcoal-100 font-semibold text-sm mt-0.5">Neoprene</p>
                </div>
                <div className="bg-charcoal-950/60 rounded-lg px-4 py-3 border border-charcoal-800/30">
                  <span className="text-charcoal-500 text-[10px] uppercase tracking-wider">Thickness</span>
                  <p className="text-charcoal-100 font-semibold text-sm mt-0.5">1/16&quot;</p>
                </div>
                <div className="bg-charcoal-950/60 rounded-lg px-4 py-3 border border-charcoal-800/30">
                  <span className="text-charcoal-500 text-[10px] uppercase tracking-wider">Quantity</span>
                  <p className="text-charcoal-100 font-semibold text-sm mt-0.5">4 pcs</p>
                </div>
                <div className="bg-charcoal-950/60 rounded-lg px-4 py-3 border border-charcoal-800/30">
                  <span className="text-charcoal-500 text-[10px] uppercase tracking-wider">Lead Time</span>
                  <p className="text-gold-400 font-semibold text-sm mt-0.5">1–2 days</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-charcoal-800/50">
                <div>
                  <span className="text-[10px] text-charcoal-500 uppercase tracking-wider">Est. Quote</span>
                  <p className="text-3xl font-extrabold text-white mt-0.5">
                    $48<span className="text-lg text-charcoal-500 font-medium">.00</span>
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-semibold bg-gold-500/8 text-gold-400 border border-gold-500/15 uppercase tracking-wider">
                  Rush Available
                </span>
              </div>
            </div>

            {/* Floating chips */}
            <div className="absolute -top-3 -left-3 bg-charcoal-900 border border-charcoal-700/50 rounded-lg px-3.5 py-2 text-[11px] font-semibold text-blue-400 card-glow uppercase tracking-wider">
              DXF Accepted
            </div>
            <div className="absolute -bottom-3 -right-3 bg-charcoal-900 border border-charcoal-700/50 rounded-lg px-3.5 py-2 text-[11px] font-semibold text-gold-400 card-glow uppercase tracking-wider">
              ±1/32" Accuracy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
