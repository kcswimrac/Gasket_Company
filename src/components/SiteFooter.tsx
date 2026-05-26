export default function SiteFooter() {
  return (
    <footer className="border-t border-charcoal-800/40 py-14">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M11.42 15.17l-5.1-5.1a3 3 0 114.24-4.24l5.1 5.1m-1.41 1.41l5.1 5.1a3 3 0 11-4.24 4.24l-5.1-5.1" />
                </svg>
              </div>
              <span className="text-sm font-bold text-white">Backyard Restoration</span>
            </div>
            <p className="text-xs text-charcoal-500 leading-relaxed max-w-xs">
              On-demand reproduction parts and custom gaskets. 3D-scanned from originals,
              precision-fabricated when ordered. Classic cars, tractors, outboards, motorcycles,
              and industrial equipment.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Services</h4>
            <ul className="space-y-2.5">
              {[
                ["Custom Gaskets", "/gaskets"],
                ["Parts Catalog", "/catalog"],
                ["Contribute a Part", "/catalog#contribute"],
                ["Bounty Board", "/catalog#bounty"],
              ].map(([label, href]) => (
                <li key={href}>
                  <a href={href} className="text-xs text-charcoal-500 hover:text-emerald-400 transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Contact</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              <li><a href="tel:+15551234567" className="hover:text-emerald-400 transition-colors">(555) 123-4567</a></li>
              <li><a href="mailto:parts@backyardrestoration.com" className="hover:text-emerald-400 transition-colors">parts@backyardrestoration.com</a></li>
              <li className="text-charcoal-600">Mon–Fri, 7 AM – 5 PM CT</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-charcoal-400 mb-4">Turnaround</h4>
            <ul className="space-y-2.5 text-xs text-charcoal-500">
              <li>Gaskets: 1–2 business days</li>
              <li>Parts: 5–10 business days</li>
              <li>Rush available on select items</li>
              <li>UPS and FedEx shipping</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-charcoal-800/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-charcoal-600">
            &copy; {new Date().getFullYear()} Backyard Restoration. All rights reserved.
          </p>
          <p className="text-[11px] text-charcoal-700">
            Precision parts fabricated on demand in the USA.
          </p>
        </div>
      </div>
    </footer>
  );
}
