"use client";

import { useEffect, useState } from "react";

export default function AdminAuthGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if we already have a valid admin_token cookie
    fetch("/api/admin/stats", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setStatus("unauthenticated");
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Set the cookie
    document.cookie = `admin_token=${password};path=/;max-age=86400;SameSite=Strict`;

    // Verify the token works
    fetch("/api/admin/stats", { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          setStatus("authenticated");
        } else {
          // Clear the bad cookie
          document.cookie = "admin_token=;path=/;max-age=0;SameSite=Strict";
          setError("Invalid admin password");
        }
      })
      .catch(() => {
        document.cookie = "admin_token=;path=/;max-age=0;SameSite=Strict";
        setError("Connection error");
      });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
        <div className="text-charcoal-400 text-sm">Checking authentication...</div>
      </div>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-8 w-full max-w-sm shadow-xl"
      >
        <h2 className="text-lg font-semibold text-charcoal-100 mb-1">
          Admin Login
        </h2>
        <p className="text-sm text-charcoal-400 mb-6">
          Enter the admin password to continue.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm text-charcoal-300 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-4"
          placeholder="Admin secret"
          autoFocus
          required
        />

        <button
          type="submit"
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm rounded px-4 py-2 transition-colors"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
