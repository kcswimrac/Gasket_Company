"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart";

const navItems = [
  { label: "Gaskets", href: "/gaskets" },
  { label: "Parts Catalog", href: "/catalog" },
  { label: "Contribute", href: "/catalog#contribute" },
  { label: "FAQ", href: "/gaskets#faq" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-obsidian/85 backdrop-blur-xl border-b border-charcoal-800/50">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M11.42 15.17l-5.1-5.1a3 3 0 114.24-4.24l5.1 5.1m-1.41 1.41l5.1 5.1a3 3 0 11-4.24 4.24l-5.1-5.1" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white leading-tight">
                Backyard Restoration
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`text-[13px] tracking-wide uppercase font-medium transition-colors ${
                  pathname === item.href
                    ? "text-emerald-400"
                    : "text-charcoal-400 hover:text-emerald-400"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/cart" className="relative p-2 text-charcoal-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </a>
            <a href="/gaskets#quote" className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-[13px] rounded tracking-wide transition-all shadow-lg shadow-emerald-500/15 uppercase">
              Get a Quote
            </a>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-charcoal-400 hover:text-emerald-400"
            aria-label="Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {open ? (
                <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
              ) : (
                <><line x1="3" y1="8" x2="21" y2="8" /><line x1="3" y1="16" x2="21" y2="16" /></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-16 z-40" style={{ backgroundColor: "rgba(8,9,13,0.99)" }}>
          <div className="px-6 py-8 space-y-1 bg-charcoal-950 min-h-full">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block text-lg text-charcoal-300 hover:text-emerald-400 py-4 border-b border-charcoal-800/40"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-6">
              <a
                href="/gaskets#quote"
                onClick={() => setOpen(false)}
                className="block py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded text-center uppercase"
              >
                Get a Quote
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
