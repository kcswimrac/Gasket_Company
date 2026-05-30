"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdminAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Don't gate the login page itself
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/admin/login");
    }
    // If authenticated and on login page, redirect to admin
    if (status === "authenticated" && isLoginPage) {
      router.push("/admin");
    }
  }, [status, router, isLoginPage]);

  // Login page always renders immediately
  if (isLoginPage) {
    if (status === "authenticated") {
      return (
        <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
          <div className="text-charcoal-400 text-sm">Redirecting...</div>
        </div>
      );
    }
    return <>{children}</>;
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-charcoal-400 text-sm">
          Checking authentication...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-charcoal-400 text-sm">Redirecting to login...</div>
      </div>
    );
  }

  return <>{children}</>;
}
