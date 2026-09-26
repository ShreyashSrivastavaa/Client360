"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ShieldCheck,
  FileSpreadsheet,
  Users,
  Percent,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function LandingPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { success, error } = useToast();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLaunch = async () => {
    setDemoLoading(true);
    try {
      await apiFetch("/api/auth/demo", { method: "POST" });
      await refreshAuth();
      success("Welcome to ProfitLens Demo as Alex Vance (CFO)!");
      router.push("/dashboard");
    } catch (err: any) {
      error(err.message || "Failed to start demo");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <header className="border-b border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-xl sticky top-0 z-50 px-6 lg:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">ProfitLens</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDemoLaunch}
            disabled={demoLoading}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700/80 hover:border-zinc-600 text-xs font-semibold text-zinc-200 transition-colors"
          >
            {demoLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>Live Demo</span>
          </button>
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 lg:px-12 max-w-6xl mx-auto text-center space-y-8 overflow-hidden">
        {/* Ambient glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Client Profitability Analytics Platform (MVP)</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Know which clients make you money — and which{" "}
          <span className="bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
            quietly drain your profits.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Most companies know their top-line revenue, but not which accounts are actually profitable
          once engineering, support, discounts, and real service delivery costs are accounted for.
        </p>

        {/* Hero CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDemoLaunch}
            disabled={demoLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5"
          >
            {demoLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>Launch Live CFO Demo (1-Click)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-sm font-semibold border border-zinc-700/80 transition-all flex items-center justify-center gap-2"
          >
            <span>Create Company Workspace</span>
          </Link>
        </div>

        {/* Interactive Hero Mockup Card */}
        <div className="pt-8">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-700/80 shadow-2xl max-w-4xl mx-auto text-left space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-400 font-mono ml-2">profitlens.io/dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Last 12 Months
                </span>
              </div>
            </div>

            {/* Quick KPI Preview Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block">Total Revenue</span>
                <span className="text-xl font-bold text-white tabular-nums">$632,500</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                  +14.2% YoY
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block">Total Cost</span>
                <span className="text-xl font-bold text-white tabular-nums">$418,200</span>
                <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                  +8.5% YoY
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-[11px] text-zinc-400 block">Gross Profit</span>
                <span className="text-xl font-bold text-emerald-400 tabular-nums">+$214,300</span>
                <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                  33.9% Margin
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30">
                <span className="text-[11px] text-rose-300 block">Loss-Makers Alert</span>
                <span className="text-xl font-bold text-rose-400 tabular-nums">4 Clients</span>
                <span className="text-[10px] text-rose-300 font-semibold block mt-0.5">
                  -$48,200 profit drain
                </span>
              </div>
            </div>

            {/* Mock Client Table preview */}
            <div className="rounded-xl border border-zinc-800 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-900 text-zinc-400 text-[11px] uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3 text-right">Revenue</th>
                    <th className="py-2.5 px-3 text-right">Cost</th>
                    <th className="py-2.5 px-3 text-right">Gross Profit</th>
                    <th className="py-2.5 px-3 text-right">Margin %</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">CloudScale Tech</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300 tabular-nums">$504,000</td>
                    <td className="py-2.5 px-3 text-right text-zinc-400 tabular-nums">$198,000</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-bold tabular-nums">
                      +$306,000
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 tabular-nums font-semibold">
                      60.7%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Profitable
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-semibold text-white">Global Retail Partners</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300 tabular-nums">$1,008,000</td>
                    <td className="py-2.5 px-3 text-right text-zinc-400 tabular-nums">$918,000</td>
                    <td className="py-2.5 px-3 text-right text-amber-400 font-bold tabular-nums">
                      +$90,000
                    </td>
                    <td className="py-2.5 px-3 text-right text-amber-400 tabular-nums font-semibold">
                      8.9%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Low-Margin
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-rose-950/10">
                    <td className="py-2.5 px-3 font-semibold text-rose-300">
                      Nexus Infrastructure
                    </td>
                    <td className="py-2.5 px-3 text-right text-zinc-300 tabular-nums">$408,000</td>
                    <td className="py-2.5 px-3 text-right text-zinc-400 tabular-nums">$528,000</td>
                    <td className="py-2.5 px-3 text-right text-rose-400 font-bold tabular-nums">
                      -$120,000
                    </td>
                    <td className="py-2.5 px-3 text-right text-rose-400 tabular-nums font-semibold">
                      -29.4%
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Loss-Making
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 px-6 lg:px-12 max-w-6xl mx-auto border-t border-zinc-800">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Finance Leaders & Operators
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Eliminate hours of manual spreadsheet merging and discover account health in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Universal CSV Mapping</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Upload separate sales or cost CSVs or combined transaction logs. Our parser matches
              headers and catches malformed rows before import.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dynamic Classification Rules</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Define your own thresholds for Profitable (default ≥20%), Low-Margin (5–20%), and
              Loss-Making (&lt;5%). Re-classifies your entire historical book of business instantly.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-zinc-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Diagnostic Insights</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Rule-based alerts surface profit concentration risks, margin degradation alerts, and
              loss-making accounts that require contract renegotiation.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 py-8 px-6 text-center text-xs text-zinc-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
            PL
          </div>
          <span className="font-semibold text-zinc-300">ProfitLens</span>
        </div>
        <p>© 2026 ProfitLens Technologies. Client Profitability Analytics Platform.</p>
      </footer>
    </div>
  );
}
