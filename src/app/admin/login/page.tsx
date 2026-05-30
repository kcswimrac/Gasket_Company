"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

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

  return (
    <div className="min-h-screen bg-charcoal-950 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-charcoal-900 border border-charcoal-700 rounded-lg p-8 w-full max-w-sm shadow-xl"
      >
        <h2 className="text-lg font-semibold text-charcoal-100 mb-1">
          Admin Login
        </h2>
        <p className="text-sm text-charcoal-400 mb-6">
          Sign in with your admin account.
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">
            {error}
          </div>
        )}

        <label className="block text-sm text-charcoal-300 mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-4"
          placeholder="admin@backyardrestorations.com"
          autoFocus
          required
        />

        <label className="block text-sm text-charcoal-300 mb-1.5">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-charcoal-800 border border-charcoal-600 rounded px-3 py-2 text-charcoal-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 mb-4"
          placeholder="Password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium text-sm rounded px-4 py-2 transition-colors"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
