export default function PhotoGuide() {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Visual: mock photo illustration */}
          <div className="relative mx-auto lg:mx-0 w-full max-w-md">
            {/* Paper sheet */}
            <div className="relative bg-white rounded-sm aspect-[8.5/11] w-full max-w-[320px] mx-auto shadow-2xl shadow-black/40">
              {/* Paper lines for realism */}
              <div className="absolute inset-4 border border-charcoal-200/40 rounded-sm" />

              {/* Gasket shape on paper */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  width="180"
                  height="180"
                  viewBox="0 0 180 180"
                  fill="none"
                  className="drop-shadow-sm"
                >
                  {/* Gasket body */}
                  <circle cx="90" cy="90" r="75" fill="#2a2a2a" fillOpacity="0.85" />
                  <circle cx="90" cy="90" r="35" fill="white" />
                  {/* Bolt holes */}
                  <circle cx="90" cy="25" r="7" fill="white" />
                  <circle cx="90" cy="155" r="7" fill="white" />
                  <circle cx="25" cy="90" r="7" fill="white" />
                  <circle cx="155" cy="90" r="7" fill="white" />
                </svg>
              </div>

              {/* Dimension arrows */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                <span className="text-[10px] font-mono text-charcoal-400 bg-white px-1.5 py-0.5 rounded">
                  8.5&quot; x 11&quot; paper
                </span>
              </div>

              {/* "Top-down view" label */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-charcoal-900 border border-charcoal-700/50 rounded-md px-3 py-1.5 text-[10px] font-semibold text-gold-400 uppercase tracking-wider whitespace-nowrap card-glow">
                Top-Down Photo — For Scale
              </div>
            </div>

            {/* Annotation callouts */}
            <div className="absolute -right-2 top-1/4 sm:-right-4 bg-charcoal-900 border border-charcoal-700/50 rounded-lg px-3 py-2 card-glow max-w-[160px]">
              <p className="text-[11px] text-charcoal-300 leading-snug">
                <strong className="text-gold-400">Step 1:</strong> Place gasket flat on white paper
              </p>
            </div>
            <div className="absolute -left-2 bottom-1/4 sm:-left-4 bg-charcoal-900 border border-charcoal-700/50 rounded-lg px-3 py-2 card-glow max-w-[160px]">
              <p className="text-[11px] text-charcoal-300 leading-snug">
                <strong className="text-gold-400">Step 2:</strong> Photo from directly above, all edges visible
              </p>
            </div>
          </div>

          {/* Right: explanation */}
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
              No DXF? No Problem.
            </span>
            <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Snap a Photo.<br />We&apos;ll Do the Rest.
            </h2>
            <p className="mt-5 text-charcoal-400 leading-relaxed">
              Don&apos;t have a CAD file? Place your gasket on a standard
              8.5&quot; x 11&quot; sheet of paper and take a photo from directly
              above. The paper gives us the scale reference to recreate your
              gasket accurately.
            </p>

            <div className="mt-6 space-y-3">
              {[
                "Use flat, unwrinkled white paper",
                "Make sure all four paper edges are visible",
                "Shoot straight down — avoid angles",
                "We trace and cut to within ±1/32\" accuracy",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-charcoal-300">{tip}</span>
                </div>
              ))}
            </div>

            <a
              href="#quote"
              className="inline-flex items-center justify-center mt-8 px-7 py-3.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian font-bold text-sm rounded tracking-wide transition-all shadow-lg shadow-gold-500/15 uppercase"
            >
              Upload a Photo Now
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
          </div>
        </div>
      </div>
    </section>
  );
}
