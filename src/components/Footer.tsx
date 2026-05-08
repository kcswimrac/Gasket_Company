export default function Footer() {
  return (
    <footer className="border-t border-charcoal-800/40 py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-sm">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-obsidian"
                >
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
              </div>
              <div>
                <span className="text-sm font-bold text-white">QuickSeal</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-gold-400/50 font-medium ml-1.5">
                  Gaskets
                </span>
              </div>
            </div>
            <p className="text-xs text-charcoal-500 leading-relaxed max-w-xs">
              Precision replacement gaskets from DXF or photo. Quick-turn
              manufacturing for restoration, maintenance, and industrial
              applications.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5">
              {[
                ["Process", "#how-it-works"],
                ["Materials", "#materials"],
                ["Applications", "#applications"],
                ["FAQ", "#faq"],
                ["Get Quote", "#quote"],
                ["PartVault — Restoration Parts", "/parts"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-xs text-charcoal-500 hover:text-gold-400 transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">
              Contact
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              <li>
                <a
                  href="tel:+15551234567"
                  className="hover:text-gold-400 transition-colors"
                >
                  (555) 123-4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:quotes@quicksealgaskets.com"
                  className="hover:text-gold-400 transition-colors"
                >
                  quotes@quicksealgaskets.com
                </a>
              </li>
              <li className="text-charcoal-600">Mon–Fri, 7 AM – 5 PM CT</li>
            </ul>
          </div>

          {/* Turnaround */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">
              Turnaround
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              <li>Standard: 1–2 business days</li>
              <li>Rush: Same-day cutting available</li>
              <li>Next-day shipping on qualifying orders</li>
              <li>UPS and FedEx available</li>
            </ul>
          </div>
        </div>

        <div className="gold-divider mt-12 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-charcoal-600">
            &copy; {new Date().getFullYear()} QuickSeal Gaskets. All rights
            reserved.
          </p>
          <p className="text-[11px] text-charcoal-700">
            Precision gaskets made to order in the USA.
          </p>
        </div>
      </div>
    </footer>
  );
}
