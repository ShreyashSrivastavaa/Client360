"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  Zap,
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
      success("Welcome to ProfitLens as CFO Alex Vance!");
      router.push("/dashboard");
    } catch (err: any) {
      error(err.message || "Failed to start demo");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#121217] selection:bg-[#ffc233] selection:text-[#121217]">
      {/* 1. Announcement Banner (#ffc233 Lemon Zest) */}
      <div className="w-full bg-[#ffc233] py-2.5 px-4 text-[#121217] text-xs sm:text-[14px] font-medium tracking-[2px] uppercase flex items-center justify-between">
        <div className="mx-auto flex items-center gap-2">
          <span className="font-bold">⚡ NEW:</span>
          <span>Automatic Gross Margin Engine & Loss-Maker Detection for B2B Teams</span>
        </div>
        <button
          onClick={handleDemoLaunch}
          disabled={demoLoading}
          className="hidden md:inline-flex items-center gap-1.5 bg-white text-[#121217] px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-[#f7f7f8] transition-colors shadow-sm"
        >
          <span>Try Demo</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Navigation Bar (White #ffffff, 64px, 1px bottom border #d1d1db) */}
      <header className="bg-white border-b border-[#d1d1db] h-16 sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#5423e7] flex items-center justify-center shadow-sm">
            <span className="text-white text-lg font-black tracking-tighter">P</span>
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight text-[#121217]">
            ProfitLens
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 text-[15px] font-medium text-[#6c6c89]">
          <a
            href="#features"
            className="px-4 py-2 rounded-full hover:bg-[#f7f7f8] hover:text-[#121217] transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="px-4 py-2 rounded-full hover:bg-[#f7f7f8] hover:text-[#121217] transition-colors"
          >
            How it Works
          </a>
          <a
            href="#insights"
            className="px-4 py-2 rounded-full hover:bg-[#f7f7f8] hover:text-[#121217] transition-colors"
          >
            Insights Engine
          </a>
        </nav>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-[15px] font-medium text-[#6c6c89] hover:text-[#121217] transition-colors"
          >
            Sign in
          </Link>
          <button
            onClick={handleDemoLaunch}
            disabled={demoLoading}
            className="hidden sm:flex items-center gap-1.5 bg-[#5423e7] hover:bg-[#4518cc] text-white px-4 py-2 rounded-lg text-[14px] font-medium transition-colors shadow-sm"
          >
            {demoLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#ffc233]" />
            )}
            <span>Live CFO Demo</span>
          </button>
          <Link
            href="/signup"
            className="bg-[#121217] hover:bg-[#272730] text-white px-5 py-2 rounded-lg text-[15px] font-medium shadow-sm transition-all"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* 3. Hero Section (Full-Bleed Royal Violet #5423e7) */}
      <section className="bg-[#5423e7] text-white py-20 lg:py-28 px-6 lg:px-12 relative overflow-hidden">
        {/* Subtle decorative purple glow circle */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#7047eb]/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Headline, subtext, actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#ffc233] text-[13px] font-medium uppercase tracking-[2px]">
              <Zap className="w-3.5 h-3.5 text-[#ffc233]" />
              <span>B2B Client Profitability Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-display font-normal text-white leading-[1.13] tracking-[-2.24px]">
              Know which clients make you money — and which quietly drain profits.
            </h1>

            <p className="text-lg text-white/80 font-normal leading-[1.6] max-w-xl">
              Businesses know their total revenue, but not which accounts actually produce profit
              once engineering hours, dedicated support, and real delivery costs are accounted for.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4">
              <button
                onClick={handleDemoLaunch}
                disabled={demoLoading}
                className="bg-white hover:bg-[#f7f7f8] text-[#121217] font-medium px-6 py-3.5 rounded-lg text-[15px] flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {demoLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#5423e7]" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#ffc233]" />
                )}
                <span>Launch Live CFO Demo (1-Click)</span>
                <ArrowRight className="w-4 h-4 text-[#121217]" />
              </button>

              <Link
                href="/signup"
                className="bg-transparent hover:bg-white/10 text-white font-medium border border-white/40 px-6 py-3.5 rounded-lg text-[15px] flex items-center justify-center transition-colors"
              >
                Create Workspace
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-6 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffc233]" />
                <span>Instant 12-month sample dataset</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#ffc233]" />
                <span>No accounting software setup required</span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Angled Tablet Mockup */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">
            <div className="w-full max-w-[560px] transform lg:rotate-[-6deg] hover:rotate-0 transition-transform duration-500 rounded-[28px] p-2 bg-[#121217] tablet-elevation border-4 border-zinc-800">
              {/* Tablet Screen Container */}
              <div className="bg-[#f7f7f8] rounded-[22px] overflow-hidden p-5 text-[#121217] space-y-4">
                {/* Mock Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#d1d1db]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#5423e7] text-white flex items-center justify-center text-xs font-bold">
                      P
                    </div>
                    <span className="font-bold text-xs text-[#121217]">Acme Global Corp</span>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#ffc233]/25 text-[#734d00] px-2.5 py-0.5 rounded-full">
                    Last 12 Months
                  </span>
                </div>

                {/* Mock KPIs */}
                <div className="grid grid-cols-3 gap-2 text-left">
                  <div className="bg-white p-3 rounded-xl border border-[#d1d1db]">
                    <span className="text-[10px] text-[#6c6c89] uppercase tracking-wider block">
                      Revenue
                    </span>
                    <span className="text-base font-bold text-[#121217] tabular-nums">$7.95M</span>
                    <span className="text-[9px] text-[#1e874c] font-bold block">+14.2%</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-[#d1d1db]">
                    <span className="text-[10px] text-[#6c6c89] uppercase tracking-wider block">
                      Gross Profit
                    </span>
                    <span className="text-base font-bold text-[#1e874c] tabular-nums">$1.79M</span>
                    <span className="text-[9px] text-[#1e874c] font-bold block">22.5% Margin</span>
                  </div>
                  <div className="bg-[#d50b3e]/10 p-3 rounded-xl border border-[#d50b3e]/30">
                    <span className="text-[10px] text-[#d50b3e] uppercase tracking-wider block font-bold">
                      Loss Makers
                    </span>
                    <span className="text-base font-bold text-[#d50b3e] tabular-nums">5 Clients</span>
                    <span className="text-[9px] text-[#d50b3e] font-semibold block">
                      -$184k drain
                    </span>
                  </div>
                </div>

                {/* Mock Table Rows */}
                <div className="bg-white rounded-xl border border-[#d1d1db] overflow-hidden text-left text-[11px]">
                  <div className="bg-[#f7f7f8] p-2 font-bold text-[#6c6c89] flex justify-between border-b border-[#d1d1db]">
                    <span>Account</span>
                    <span>Profit</span>
                    <span>Status</span>
                  </div>
                  <div className="divide-y divide-[#d1d1db]">
                    <div className="p-2 flex justify-between items-center">
                      <span className="font-semibold text-[#121217]">Apex Dynamics</span>
                      <span className="text-[#1e874c] font-bold">+$348,000</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#1e874c]/10 text-[#1e874c] font-bold text-[9px]">
                        Profitable
                      </span>
                    </div>
                    <div className="p-2 flex justify-between items-center">
                      <span className="font-semibold text-[#121217]">Global Retail</span>
                      <span className="text-[#996500] font-bold">+$90,000</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#ffc233]/25 text-[#996500] font-bold text-[9px]">
                        Low-Margin
                      </span>
                    </div>
                    <div className="p-2 flex justify-between items-center bg-[#d50b3e]/5">
                      <span className="font-semibold text-[#d50b3e]">Nexus Infra</span>
                      <span className="text-[#d50b3e] font-bold">-$120,000</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#d50b3e]/15 text-[#d50b3e] font-bold text-[9px]">
                        Loss-Making
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. White Content Section: Feature Cards (48px Radius, 40px Padding) */}
      <section id="features" className="py-20 px-6 lg:px-12 max-w-[1200px] mx-auto space-y-16">
        <div className="text-left space-y-2 max-w-xl">
          <div className="eyebrow-label text-[#6c6c89]">Profitability Architecture</div>
          <h2 className="text-3xl sm:text-[38px] font-display font-normal text-[#121217] leading-[1.2] tracking-[-1.52px]">
            Designed for finance leaders who demand operational precision.
          </h2>
          <p className="text-[#6c6c89] text-base leading-[1.7]">
            Transform scattered revenue records and cost spreadsheets into an indisputable single source of truth.
          </p>
        </div>

        {/* 3-Column Card Grid (48px rounded cards with 40px padding) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="lemon-card text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#5423e7]/10 text-[#5423e7] flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="eyebrow-label text-[#6c6c89]">Data Ingestion</div>
            <h3 className="text-[26px] font-display font-normal text-[#121217] leading-[1.25] tracking-[-0.78px]">
              Universal CSV Ingestion
            </h3>
            <p className="text-base text-[#6c6c89] leading-[1.7]">
              Upload combined revenue/cost logs or separate sales and expense files. Auto-detected
              column headers and inline row validation ensure zero bad data enters your ledger.
            </p>
          </div>

          <div className="lemon-card text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1e874c]/10 text-[#1e874c] flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <div className="eyebrow-label text-[#6c6c89]">Classification Engine</div>
            <h3 className="text-[26px] font-display font-normal text-[#121217] leading-[1.25] tracking-[-0.78px]">
              Dynamic Margin Tuning
            </h3>
            <p className="text-base text-[#6c6c89] leading-[1.7]">
              Configure your threshold rules for Profitable (default ≥20%), Low-Margin (5–20%), and
              Loss-Making (&lt;5%). The engine reclassifies your full portfolio book in milliseconds.
            </p>
          </div>

          <div className="lemon-card text-left space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ffc233]/25 text-[#121217] flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="eyebrow-label text-[#6c6c89]">Actionable Logic</div>
            <h3 className="text-[26px] font-display font-normal text-[#121217] leading-[1.25] tracking-[-0.78px]">
              Diagnostic Insights
            </h3>
            <p className="text-base text-[#6c6c89] leading-[1.7]">
              Rule-based alerts surface profit concentration in top accounts, margin degradation alerts,
              and accounts that need price renegotiations or scope corrections.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Full-Bleed Purple Section CTA Band (#5423e7) */}
      <section className="bg-[#5423e7] text-white py-20 px-6 lg:px-12 text-center">
        <div className="max-w-[1200px] mx-auto space-y-6">
          <div className="eyebrow-label text-[#ffc233]">Take Control of Account Margins</div>
          <h2 className="text-3xl sm:text-5xl font-display font-normal text-white tracking-[-1.92px] max-w-2xl mx-auto leading-[1.14]">
            Start seeing true client profitability in less than 2 minutes.
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto leading-[1.6]">
            No credit card required. Explore our live CFO demo with pre-populated multi-month account data.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleDemoLaunch}
              disabled={demoLoading}
              className="bg-white hover:bg-[#f7f7f8] text-[#121217] font-medium px-8 py-4 rounded-[32px] text-base flex items-center gap-2 shadow-xl transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#ffc233]" />
              <span>Launch Live CFO Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/signup"
              className="bg-transparent hover:bg-white/10 text-white font-medium border border-white/40 px-8 py-4 rounded-[32px] text-base transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="bg-white border-t border-[#d1d1db] py-12 px-6 lg:px-12 text-center text-xs text-[#6c6c89]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#5423e7] text-white flex items-center justify-center font-bold text-xs">
              P
            </div>
            <span className="font-display font-bold text-sm text-[#121217]">ProfitLens</span>
          </div>
          <p>© 2026 ProfitLens Technologies. Client Profitability Analytics Platform.</p>
          <div className="flex items-center gap-4 text-xs font-medium">
            <Link href="/login" className="hover:text-[#121217]">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-[#121217]">
              Create Workspace
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
