const applications = [
  {
    title: "Pumps",
    description: "Centrifugal, gear, and reciprocating pump housing seals.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
      </svg>
    ),
  },
  {
    title: "Gearboxes",
    description: "Transmission covers, gear housing plates, inspection doors.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L6.75 2.906m9.944 18.08l-1.15-.964M5.463 5.142l-1.15-.964m17.094 5.13l-1.41-.514M5.463 18.858l-1.41-.513" />
      </svg>
    ),
  },
  {
    title: "Engine Covers",
    description: "Valve covers, timing covers, oil pans, accessory housings.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    title: "Compressors",
    description: "Head, valve plate, and crankcase seals for air and gas units.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: "Flanges",
    description: "Pipe flange gaskets for process piping and pressure vessels.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeLinecap="round" />
        <circle cx="12" cy="12" r="4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Legacy Machinery",
    description: "Replacements for discontinued or obsolete equipment parts.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Industrial MRO",
    description: "On-demand gaskets for plant maintenance and emergency repairs.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1a3 3 0 114.24-4.24l5.1 5.1m1.418 1.418l-1.418-1.418M14.5 17l-.354-.354m0 0a3 3 0 01-4.243-4.243m4.243 4.243L21 21" />
      </svg>
    ),
  },
  {
    title: "Auto Restoration",
    description: "Precision gaskets for classic cars, customs, and specialty builds.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-1.5-1.5V18a1.5 1.5 0 011.5-1.5h.75a1.5 1.5 0 011.5 1.5v.75m-3 0h3m4.5 0a1.5 1.5 0 01-1.5-1.5V18a1.5 1.5 0 011.5-1.5h.75a1.5 1.5 0 011.5 1.5v.75m-3 0h3" />
      </svg>
    ),
  },
];

export default function UseCases() {
  return (
    <section id="applications" className="py-24 md:py-32">
      <div className="gold-divider max-w-xs mx-auto mb-16" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            Applications
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight">
            Built for Real Applications
          </h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto leading-relaxed">
            From restoration shops to plant floors — if it needs a gasket, we
            cut it to spec.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {applications.map((app) => (
            <div
              key={app.title}
              className="bg-charcoal-900/30 border border-charcoal-800/50 rounded-2xl p-5 sm:p-6 hover:border-gold-500/10 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-charcoal-800/50 flex items-center justify-center text-charcoal-500 group-hover:text-gold-400 group-hover:bg-gold-500/5 transition-all duration-300 border border-charcoal-700/30 mb-4">
                {app.icon}
              </div>
              <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-gold-300 transition-colors">
                {app.title}
              </h3>
              <p className="text-xs text-charcoal-500 leading-relaxed">
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
