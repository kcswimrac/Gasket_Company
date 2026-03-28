export default function FinalCTA() {
  return (
    <section className="py-24 md:py-32 metal-texture relative overflow-hidden">
      <div className="gasket-ring w-[700px] h-[700px] -bottom-72 -right-72 opacity-20" />
      <div className="gasket-ring w-[500px] h-[500px] -top-40 -left-40 opacity-15" />

      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-900/40 via-charcoal-950/60 to-charcoal-900/40 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center relative z-10">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold bg-gold-500/6 text-gold-400/80 border border-gold-500/12 mb-8 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
          Most orders ship in 1–2 days. Rush available.
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
          <span className="text-white">Don&apos;t Wait on a Gasket.</span>
          <br />
          <span className="text-gold-gradient">Upload It Now.</span>
        </h2>

        <p className="mt-5 text-sm sm:text-base text-charcoal-300 font-semibold">
          If it&apos;s leaking, torn, or obsolete — send it. We&apos;ll cut it.
        </p>

        <p className="mt-4 text-charcoal-400 max-w-lg mx-auto text-base leading-relaxed">
          DXF or photo. One gasket or a hundred. Get your replacement fast.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#quote"
            className="inline-flex items-center justify-center px-9 py-4 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian font-bold text-sm rounded-lg transition-all shadow-lg shadow-gold-500/15 uppercase tracking-wide"
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
            href="mailto:quotes@quicksealgaskets.com"
            className="inline-flex items-center justify-center px-9 py-4 border border-charcoal-700 hover:border-gold-500/25 text-charcoal-300 hover:text-gold-300 font-medium text-sm rounded-lg transition-all uppercase tracking-wide"
          >
            Email Us Directly
          </a>
        </div>

        <div className="mt-12 gold-divider max-w-xs mx-auto" />

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-charcoal-500">
          <a
            href="tel:+15551234567"
            className="flex items-center gap-2.5 hover:text-gold-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            (555) 123-4567
          </a>
          <a
            href="mailto:quotes@quicksealgaskets.com"
            className="flex items-center gap-2.5 hover:text-gold-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            quotes@quicksealgaskets.com
          </a>
        </div>
      </div>
    </section>
  );
}
