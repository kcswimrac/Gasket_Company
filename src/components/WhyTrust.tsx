const reasons = [
  {
    title: "Quick-Turn Manufacturing",
    description:
      "Most orders ship within 1–2 business days. Rush options available for same-day precision cutting.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "DXF or Photo — Your Choice",
    description:
      "Send a CAD file for exact replication or photograph with a paper reference for accurate scaling.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    title: "Hard-to-Source Parts",
    description:
      "Legacy equipment, discontinued models, obsolete machinery — we cut what you can't buy off the shelf.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
  {
    title: "Premium Materials",
    description:
      "Paper, cork, rubber, fiber, neoprene — each material selected for proven, real-world sealing performance.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
  {
    title: "One-Off Friendly",
    description:
      "No minimums. Whether you need one gasket or a hundred, we'll cut it with the same precision.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    title: "Transparent Pricing",
    description:
      "Know the price, material, and timeline before cutting begins. No hidden fees, no surprises.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function WhyTrust() {
  return (
    <section className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/50 via-charcoal-900/20 to-charcoal-950/50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            Why QuickSeal
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight">
            Precision You Can Count On
          </h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto leading-relaxed">
            When equipment is down and you need a gasket now, every hour
            matters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="flex gap-5 p-6 rounded-2xl border border-charcoal-800/50 hover:border-gold-500/10 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-gold-500/5 flex items-center justify-center text-gold-400/70 flex-shrink-0 border border-gold-500/8 group-hover:border-gold-500/15 group-hover:text-gold-400 transition-all">
                {reason.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  {reason.title}
                </h3>
                <p className="text-xs text-charcoal-400 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
