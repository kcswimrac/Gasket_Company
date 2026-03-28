"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Can I upload a photo instead of a CAD file?",
    a: "Yes. Place your gasket on a standard 8.5\" x 11\" sheet of white paper and take a clear photo from directly above. The paper provides the scale reference we need to accurately size your replacement.",
  },
  {
    q: "How do I make sure the photo is scaled correctly?",
    a: "Use a flat, unwrinkled sheet of standard letter-size paper (8.5\" x 11\"). Place the gasket flat on the paper and photograph it straight-on with all four edges of the paper visible. We use the known paper dimensions to calculate exact gasket geometry.",
  },
  {
    q: "What if I don't know which material I need?",
    a: "Tell us about your application — the equipment type, operating temperature, and what fluids are involved — and we'll recommend a suitable material. Select 'Not Sure' in the quote form and we'll follow up with a recommendation.",
  },
  {
    q: "Can you handle one-off replacement gaskets?",
    a: "Absolutely. No minimum orders. We regularly produce single gaskets for maintenance repairs, legacy equipment, restoration projects, and emergency replacements.",
  },
  {
    q: "Do you offer rush shipping?",
    a: "Yes. Rush turnaround and next-day shipping are available on qualifying orders. Select the rush option in your quote request and we'll prioritize your order for same-day cutting when possible.",
  },
  {
    q: "Is this for prototypes or production runs?",
    a: "Both. We handle everything from a single prototype gasket to recurring production batches. For ongoing orders, we keep your file on record for fast reordering.",
  },
  {
    q: "What file formats do you accept?",
    a: "DXF files (preferred for precision) and DWG files. For photo uploads, JPG and PNG work best. If you have a different format, reach out and we'll work with you.",
  },
  {
    q: "How accurate are gaskets made from photos?",
    a: "Photo-traced gaskets are typically accurate within ±1/32\" for most geometries. For tighter tolerances, we recommend a DXF file. We always send a confirmation drawing before cutting.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="gold-divider max-w-xs mx-auto mb-16" />

      <div className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white">
            Common Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                open === i
                  ? "border-gold-500/15 bg-charcoal-900/30"
                  : "border-charcoal-800/50"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-charcoal-900/20 transition-colors"
              >
                <span className="text-sm font-medium text-charcoal-100 pr-6">
                  {faq.q}
                </span>
                <svg
                  className={`w-4 h-4 text-gold-500/50 flex-shrink-0 transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-60" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5">
                  <div className="gold-divider mb-4" />
                  <p className="text-[13px] text-charcoal-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
