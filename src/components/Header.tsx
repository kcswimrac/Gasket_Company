"use client";

import { useState } from "react";

const navItems = [
  { label: "Process", href: "#how-it-works" },
  { label: "Materials", href: "#materials" },
  { label: "Applications", href: "#applications" },
  { label: "FAQ", href: "#faq" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian/85 backdrop-blur-xl border-b border-charcoal-800/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/10">
              <svg
                width="18"
                height="18"
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
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-tight">
                QuickSeal
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold-400/70 font-medium leading-tight">
                Gaskets
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] text-charcoal-400 hover:text-gold-400 transition-colors tracking-wide uppercase font-medium"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <a
              href="#quote"
              className="px-6 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 text-obsidian font-bold text-[13px] rounded tracking-wide transition-all shadow-lg shadow-gold-500/15 uppercase"
            >
              Get Quote
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-charcoal-400 hover:text-gold-400 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="8" x2="21" y2="8" />
                  <line x1="3" y1="16" x2="21" y2="16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav — full screen overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-18 bg-obsidian/98 backdrop-blur-xl z-40">
          <div className="px-6 py-8 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block text-lg text-charcoal-300 hover:text-gold-400 py-4 border-b border-charcoal-800/40 tracking-wide transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-6">
              <a
                href="#quote"
                onClick={() => setMobileOpen(false)}
                className="block px-6 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-obsidian font-bold text-base rounded text-center tracking-wide uppercase shadow-lg shadow-gold-500/15"
              >
                Get Quote
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
