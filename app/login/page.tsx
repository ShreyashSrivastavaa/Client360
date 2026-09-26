"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Layers, ArrowRight, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { success, error } = useToast();

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
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">ProfitLens</span>
        </div>

        <h2 className="text-center text-xl font-bold tracking-tight text-white">
          Sign in to your organization
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-400">
          Or{" "}
          <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300">
            create a new company workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
          {/* 1-Click CFO Demo Button */}
          <div className="p-3.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Instant Evaluation
              </span>
              <span className="text-[10px] text-indigo-400 font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20">
                1-Click
              </span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Explore a fully populated dashboard as CFO Alex Vance with 18 clients across 12 months.
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {demoLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Try Live CFO Demo Account</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-[#0f1017] px-3 text-[11px] uppercase tracking-wider text-zinc-400 shrink-0 font-medium">
              Or sign in with email
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold border border-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
              <span>Sign In</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
