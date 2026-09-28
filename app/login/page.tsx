"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";
import { ClayMascot } from "@/components/ui/ClaymationMascots";

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
      success("Welcome back to Client360!");
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
    <div className="min-h-screen bg-[#ffffff] text-[#272727] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#d6e5ff] selection:text-[#7451f2]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo with starburst */}
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-[4px] bg-[#7451f2] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xl font-bold tracking-tight text-[#272727]">
            Client360
          </span>
        </Link>

        <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-1">
          FINANCIAL WORKSPACE ACCESS
        </div>
        <h2 className="font-serif text-3xl font-normal text-[#272727] tracking-tight">
          Sign in to your workspace
        </h2>
        <p className="mt-2 text-xs text-[#5d5d5d]">
          Or{" "}
          <Link href="/signup" className="text-[#7451f2] font-semibold hover:underline">
            create a new company workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-[#ffffff] p-6 sm:p-8 rounded-[4px] border border-[#e0e0e0] space-y-6">
          {/* 1-Click CFO Demo Banner */}
          <div className="p-4 rounded-[4px] border border-[#e0e0e0] bg-[#f6f6f6] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#272727] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#7451f2]" /> Instant Live Evaluation
              </span>
              <span className="badge-pill text-[10px]">
                1-CLICK DEMO
              </span>
            </div>
            <p className="text-xs text-[#5d5d5d] leading-relaxed">
              Explore an executive financial dashboard as CFO Alex Vance with 18 accounts across 12 months.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="btn-primary w-full text-xs"
            >
              {demoLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Launch Live CFO Demo</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#e0e0e0] w-full" />
            <span className="bg-[#ffffff] px-3 font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] shrink-0">
              Or sign in with email
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-[4px] border border-[#e11d48] bg-[#ffffff] text-xs text-[#e11d48] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] block mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-default w-full text-xs"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-default w-full text-xs"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full text-xs py-2 justify-center"
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
