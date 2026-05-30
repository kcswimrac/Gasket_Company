"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "_backyard_salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AdminLoginPage() {
  const [mode, setMode] = useState<"user" | "bootstrap">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrapLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const hashed = await hashPassword(password);
      document.cookie = `admin_token=${hashed};path=/;max-age=86400;SameSite=Strict;Secure`;
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.ok) {
        window.location.href = "/admin";
      } else {
        document.cookie = "admin_token=;path=/;max-age=0;SameSite=Strict";
        setError("Invalid admin password");
      }
    } catch {
      document.cookie = "admin_token=;path=/;max-age=0;SameSite=Strict";
      setError("Connection error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <form
          onSubmit={mode === "user" ? handleUserLogin : handleBootstrapLogin}
          className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-8 shadow-xl"
        >
          <h2 className="text-lg font-semibold text-charcoal-100 mb-1">Admin Login</h2>
          <p className="text-sm text-charcoal-400 mb-6">
            {mode === "user" ? "Sign in with your admin account." : "First-time setup — enter your admin password."}
          </p>

          {error && (
            <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
              {error}
            </div>
          )}

          {mode === "user" && (
            <>
              <label className="block text-sm text-charcoal-300 mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-4"
                placeholder="admin@backyardrestorations.com" autoFocus required
              />
            </>
          )}

          <label className="block text-sm text-charcoal-300 mb-1.5">Password</label>
          <input
            type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-4"
            placeholder="Password" autoFocus={mode === "bootstrap"} required
          />

          <button
            type="submit" disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium text-sm rounded px-4 py-2 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4 text-center">
          {mode === "user" ? (
            <button onClick={() => { setMode("bootstrap"); setError(""); }} className="text-xs text-charcoal-400 hover:text-charcoal-300">
              First time? Use admin password instead
            </button>
          ) : (
            <button onClick={() => { setMode("user"); setError(""); }} className="text-xs text-charcoal-400 hover:text-charcoal-300">
              Have an account? Sign in with email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
