"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Reset failed. The link may have expired.");
        setLoading(false);
        return;
      }

      // Redirect to login with success message
      router.push("/account/login?reset=success");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-charcoal-950 border border-charcoal-700/50 rounded-lg px-4 py-3 text-sm text-charcoal-100 placeholder:text-charcoal-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-colors";
  const labelCls =
    "block text-[11px] font-semibold text-charcoal-400 mb-2 uppercase tracking-wider";

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-400 mb-4">
          Invalid or missing reset token. Please request a new reset link.
        </p>
        <a
          href="/account/forgot-password"
          className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors"
        >
          Request new link
        </a>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-400 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className={labelCls}>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputCls}
            required
            minLength={8}
            autoFocus
          />
        </div>

        <div>
          <label className={labelCls}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            className={inputCls}
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold text-sm rounded-lg transition-all shadow-lg shadow-emerald-500/10 uppercase tracking-wide disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Resetting...
            </>
          ) : (
            "Set New Password"
          )}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen pt-28 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md px-5">
          <div className="bg-charcoal-900 border border-emerald-500/15 rounded-2xl p-8 shadow-2xl shadow-emerald-500/5">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white">
                Set New Password
              </h1>
              <p className="text-sm text-charcoal-400 mt-2">
                Choose a new password for your account
              </p>
            </div>

            <Suspense
              fallback={
                <div className="text-center py-8">
                  <p className="text-sm text-charcoal-400">Loading...</p>
                </div>
              }
            >
              <ResetPasswordForm />
            </Suspense>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
