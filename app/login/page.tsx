"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { success } = useToast();

  const [email, setEmail] = useState("demo@profitlens.io");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refreshAuth();
      success("Welcome back to ProfitLens!");
      router.push("/dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setAuthError(null);
    try {
      await apiFetch("/api/auth/demo", { method: "POST" });
      await refreshAuth();
      success("Signed in as Alex Vance (CFO) with populated 12-month dataset!");
      router.push("/dashboard");
    } catch (err: any) {
      setAuthError(err.message || "Failed to launch demo account");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#121217] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-body">
      {/* Decorative subtle brand background circle */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5423e7]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#ffc233]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <div className="w-9 h-9 rounded-2xl bg-[#ffc233] flex items-center justify-center shadow-sm text-lg group-hover:scale-105 transition-transform">
            🍋
          </div>
          <span className="font-display text-2xl font-normal tracking-tight text-[#121217]">
            profitlens
          </span>
        </Link>

        <h2 className="text-center font-display text-2xl font-normal tracking-tight text-[#121217]">
          Sign in to your organization
        </h2>
        <p className="mt-1.5 text-center text-xs text-[#6c6c89]">
          Or{" "}
          <Link href="/signup" className="font-medium text-[#5423e7] hover:underline">
            create a new company workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-[#d1d1db] shadow-[0_4px_24px_rgba(18,18,23,0.06)] space-y-6">
          {/* 1-Click CFO Demo Banner */}
          <div className="p-4 rounded-2xl border border-[#ffc233] bg-[#ffc233]/15 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#121217] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#5423e7]" /> Instant Live Evaluation
              </span>
              <span className="text-[10px] uppercase font-bold text-[#121217] px-2 py-0.5 rounded-full bg-[#ffc233]">
                1-Click
              </span>
            </div>
            <p className="text-[11px] text-[#6c6c89] leading-relaxed">
              Explore an executive financial dashboard as CFO Alex Vance with 18 accounts across 12 months.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#121217] hover:bg-black text-white text-xs font-medium shadow-sm transition-all disabled:opacity-50"
            >
              {demoLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#ffc233]" />
              )}
              <span>Try Live CFO Demo Account</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#d1d1db] w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#6c6c89] shrink-0 font-medium">
              Or sign in with email
            </span>
          </div>

          {authError && (
            <div className="p-3.5 rounded-xl border border-[#d50b3e]/20 bg-[#d50b3e]/5 text-xs text-[#d50b3e] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#d50b3e] shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#121217] mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7] transition-colors"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121217] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-[#121217] hover:bg-black text-white text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
