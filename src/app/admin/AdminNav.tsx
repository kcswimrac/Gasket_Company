"use client";

import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: "grid" },
  { href: "/admin/parts", label: "Parts", icon: "box" },
  { href: "/admin/orders", label: "Orders", icon: "cart" },
  { href: "/admin/scans", label: "Scan Queue", icon: "scan" },
  { href: "/admin/bounties", label: "Bounties", icon: "bounty" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
];

function Icon({ name }: { name: string }) {
  const cls = "w-4 h-4";
  switch (name) {
    case "grid":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>;
    case "box":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" /></svg>;
    case "cart":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>;
    case "scan":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
    case "bounty":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>;
    case "users":
      return <svg className={cls} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;
    default:
      return null;
  }
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 bg-charcoal-900 border-r border-charcoal-800/50 flex-col z-40">
        <div className="p-5 border-b border-charcoal-800/50">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <path d="M11.42 15.17l-5.1-5.1a3 3 0 114.24-4.24l5.1 5.1m-1.41 1.41l5.1 5.1a3 3 0 11-4.24 4.24l-5.1-5.1" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-tight">Backyard</p>
              <p className="text-[10px] text-emerald-400/70 uppercase tracking-wider leading-tight">Admin</p>
            </div>
          </a>
        </div>

        <div className="flex-1 py-4 px-3 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-charcoal-400 hover:text-white hover:bg-charcoal-800/50"
                }`}
              >
                <Icon name={link.icon} />
                {link.label}
              </a>
            );
          })}
        </div>

        <div className="p-3 border-t border-charcoal-800/50 space-y-1">
          <a href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-charcoal-500 hover:text-charcoal-300 transition-colors">
            ← Back to site
          </a>
          <button
            onClick={() => {
              document.cookie = "admin_token=;path=/;max-age=0;SameSite=Strict";
              window.location.href = "/admin";
            }}
            className="flex items-center gap-2 px-3 py-2 text-xs text-red-400/70 hover:text-red-400 transition-colors w-full text-left"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile top bar */}
      <nav className="md:hidden fixed top-0 left-0 right-0 bg-charcoal-900 border-b border-charcoal-800/50 z-40">
        <div className="flex items-center gap-4 px-4 py-3 overflow-x-auto">
          <a href="/" className="text-xs text-charcoal-500 shrink-0">←</a>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                className={`text-xs font-medium whitespace-nowrap px-2 py-1 rounded transition-colors ${
                  active
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-charcoal-400"
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <button
            onClick={() => {
              document.cookie = "admin_token=;path=/;max-age=0;SameSite=Strict";
              window.location.href = "/admin";
            }}
            className="text-xs font-medium whitespace-nowrap px-2 py-1 rounded text-red-400/70 hover:text-red-400 transition-colors shrink-0"
          >
            Logout
          </button>
        </div>
      </nav>
    </>
  );
}
