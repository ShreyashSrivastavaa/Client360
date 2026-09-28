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
    <div className="min-h-screen bg-[#ffffff] text-[#1a1a1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#fff6d4] selection:text-[#1a1a1a]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffb84d]" />
          <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">
            Client360
          </span>
        </Link>

        <h2 className="text-center text-rows-heading">
          Sign in to your workspace
        </h2>
        <p className="mt-2 text-center text-xs text-[#6f6f6f]">
          Or{" "}
          <Link href="/signup" className="text-[#1a1a1a] font-bold hover:underline">
            create a new company workspace
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white p-6 sm:p-8 rounded-[8px] border border-[#eaeaea] space-y-6">
          {/* 1-Click CFO Demo Banner */}
          <div className="p-4 rounded-[4px] border border-[#eaeaea] bg-[#f7f7f7] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1a1a1a] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1a1a1a]" /> Instant Live Evaluation
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.21px] text-[#6f6f6f]">
                1-Click
              </span>
            </div>
            <p className="text-xs text-[#6f6f6f] leading-relaxed">
              Explore an executive financial dashboard as CFO Alex Vance with 18 accounts across 12 months.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="btn-rows-primary w-full text-xs"
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
            <div className="border-t border-[#eaeaea] w-full" />
            <span className="bg-white px-3 text-rows-caption shrink-0">
              Or sign in with email
            </span>
          </div>

          {authError && (
            <div className="p-3 rounded-[4px] border border-[#e11d48] bg-white text-xs text-[#e11d48] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-rows-caption block mb-1.5">
                Work Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-rows-default w-full text-xs"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label className="text-rows-caption block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-rows-default w-full text-xs"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-rows-outlined w-full text-xs py-2 justify-center"
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
