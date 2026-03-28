const materials = [
  {
    name: "Paper Gasket",
    description:
      "General-purpose sealing. Economical choice for low-pressure covers, housings, and non-critical joints where fast replacement matters most.",
    properties: ["Low cost", "Easy to cut", "Low-pressure"],
    accent: false,
  },
  {
    name: "Cork",
    description:
      "Excellent oil resistance and compressibility. The classic choice for engine valve covers, gear housings, and timing covers.",
    properties: ["Oil resistant", "Compressible", "Vibration dampening"],
    accent: false,
  },
  {
    name: "Rubber",
    description:
      "Versatile sealing for maintenance and repair. Available in various durometers to match your exact application requirements.",
    properties: ["Flexible", "Water resistant", "Durable"],
    accent: false,
  },
  {
    name: "Fiber",
    description:
      "Engineered for tougher service conditions. Handles higher temperatures and pressures than paper or cork alternatives.",
    properties: ["Heat resistant", "Higher pressure", "Rigid"],
    accent: false,
  },
  {
    name: "Neoprene",
    description:
      "Superior resistance to fluids, weather, and moderate chemicals. Ideal for outdoor applications and wet environments.",
    properties: ["Chemical resistant", "Weatherproof", "Flexible"],
    accent: false,
  },
  {
    name: "Not Sure?",
    description:
      "Describe your application and operating conditions. We'll recommend the right material — no charge for consultation.",
    properties: ["Free consultation", "Application review", "Expert guidance"],
    accent: true,
  },
];

export default function Materials() {
  return (
    <section id="materials" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal-950/50 via-charcoal-900/30 to-charcoal-950/50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            Materials
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white leading-tight">
            Premium Gasket Materials
          </h2>
          <p className="mt-5 text-charcoal-400 max-w-xl mx-auto leading-relaxed">
            We stock proven gasket sheet materials ready for precision cutting.
            Each selected for reliable, real-world performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((mat) => (
            <div
              key={mat.name}
              className={`rounded-2xl p-6 sm:p-7 transition-all duration-300 group ${
                mat.accent
                  ? "bg-gold-500/3 border border-gold-500/15 hover:border-gold-500/30"
                  : "bg-charcoal-900/40 border border-charcoal-800/60 hover:border-gold-500/10"
              }`}
            >
              <h3
                className={`text-lg font-bold mb-3 transition-colors ${
                  mat.accent
                    ? "text-gold-400"
                    : "text-white group-hover:text-gold-300"
                }`}
              >
                {mat.name}
              </h3>
              <p className="text-[13px] text-charcoal-400 leading-relaxed mb-5">
                {mat.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {mat.properties.map((prop) => (
                  <span
                    key={prop}
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                      mat.accent
                        ? "bg-gold-500/8 text-gold-400 border border-gold-500/12"
                        : "bg-charcoal-800/50 text-charcoal-400 border border-charcoal-700/40"
                    }`}
                  >
                    {prop}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
