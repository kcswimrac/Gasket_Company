"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [bootstrapOk, setBootstrapOk] = useState(false);
  const [checked, setChecked] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) { setChecked(true); return; }

    // If Auth.js says authenticated, we're good
    if (status === "authenticated") { setChecked(true); return; }

    // If Auth.js is still loading, wait
    if (status === "loading") return;

    // Auth.js says unauthenticated — check for bootstrap cookie
    const hasBootstrapCookie = document.cookie.includes("admin_token=");
    if (hasBootstrapCookie) {
      fetch("/api/admin/stats", { credentials: "include" })
        .then((res) => {
          if (res.ok) {
            setBootstrapOk(true);
          } else {
            router.push("/admin/login");
          }
          setChecked(true);
        })
        .catch(() => { router.push("/admin/login"); setChecked(true); });
    } else {
      router.push("/admin/login");
      setChecked(true);
    }
  }, [status, isLoginPage, router]);

  if (isLoginPage) {
    if (status === "authenticated") {
      router.push("/admin");
      return <div className="min-h-screen bg-charcoal-950 flex items-center justify-center"><div className="text-charcoal-400 text-sm">Redirecting...</div></div>;
    }
    return <>{children}</>;
  }

  if (!checked || status === "loading") {
    return <div className="min-h-screen bg-charcoal-950 flex items-center justify-center"><div className="text-charcoal-400 text-sm">Checking authentication...</div></div>;
  }

  if (status === "authenticated" || bootstrapOk) {
    return <>{children}</>;
  }

  return <div className="min-h-screen bg-charcoal-950 flex items-center justify-center"><div className="text-charcoal-400 text-sm">Redirecting to login...</div></div>;
}
