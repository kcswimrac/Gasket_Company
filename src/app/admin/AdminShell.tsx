"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import AdminNav from "./AdminNav";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const isLoginPage = pathname === "/admin/login";
  const [bootstrapOk, setBootstrapOk] = useState(false);

  useEffect(() => {
    if (status === "authenticated" || isLoginPage) return;
    if (document.cookie.includes("admin_token=")) {
      setBootstrapOk(true);
    }
  }, [status, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  const showNav = status === "authenticated" || bootstrapOk;
  if (!showNav) return <>{children}</>;

  return (
    <div className="min-h-screen bg-charcoal-950 text-charcoal-200">
      <AdminNav />
      <main className="pl-0 md:pl-56 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
