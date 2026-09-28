"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  AlertTriangle,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
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
      success("Welcome to Client360 as CFO Alex Vance!");
      router.push("/dashboard");
    } catch (err: any) {
      error(err.message || "Failed to start demo");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#823513] text-[#faae33] selection:bg-[#faae33] selection:text-[#281006] botanical-bg">
      {/* 1. Announcement Banner (#402011 Dark Spice with dotted divider) */}
      <div className="w-full bg-[#281006] py-2.5 px-4 text-[#faae33] text-xs font-salmond tracking-[2px] uppercase flex items-center justify-between border-b border-[#6b2e12]">
        <div className="mx-auto flex items-center gap-2">
          <span className="font-bold text-[#faae33]">⚡ TURSO POWERED:</span>
          <span className="opacity-90">AUTOMATIC GROSS MARGIN ENGINE & LOSS-MAKER DETECTION</span>
        </div>
        <button
          onClick={handleDemoLaunch}
          disabled={demoLoading}
          className="btn-ghost-outline hidden md:inline-flex items-center gap-1.5 py-1 px-3 text-xs"
        >
          <span>TRY DEMO</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 2. Navigation Bar (Charred Clove #281006) */}
      <header className="bg-[#281006] border-b border-[#6b2e12] h-18 sticky top-0 z-50 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#faae33] text-[#281006] flex items-center justify-center font-salmond font-bold text-lg">
            HT
          </div>
          <span className="font-salmond text-2xl font-bold tracking-tight text-[#faae33]">
            CLIENT360
          </span>
        </div>

        {/* Center Nav Links - Ghost Outline Buttons */}
        <nav className="hidden md:flex items-center gap-2">
          <a href="#features" className="btn-ghost-outline">
            FEATURES
          </a>
          <a href="#how-it-works" className="btn-ghost-outline">
            HOW IT WORKS
          </a>
          <a href="#insights" className="btn-ghost-outline">
            INSIGHTS ENGINE
          </a>
        </nav>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost-outline hidden sm:inline-flex">
            SIGN IN
          </Link>
          <button
            onClick={handleDemoLaunch}
            disabled={demoLoading}
            className="btn-primary-filled flex items-center gap-1.5"
          >
            {demoLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#281006]" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#281006]" />
            )}
            <span>LIVE CFO DEMO</span>
          </button>
        </div>
      </header>

      {/* Dotted divider */}
      <div className="dotted-divider opacity-60" />

      {/* 3. Hero Section (Maximalist Poster Headline, Ember Rust canvas) */}
      <section className="py-20 lg:py-28 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1440px] mx-auto space-y-8">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#402011] border border-[#6b2e12] text-[#faae33] text-xs font-salmond tracking-[2px] uppercase">
            <Zap className="w-3.5 h-3.5 text-[#faae33]" />
            <span>FIRE-ROASTED B2B CLIENT PROFITABILITY</span>
          </div>

          {/* Absurdly oversized display type (Hungry Tiger signature) */}
          <div className="space-y-2">
            <h1 className="text-6xl sm:text-8xl lg:text-[130px] xl:text-[160px] font-salmond font-bold text-[#faae33] leading-[0.85] tracking-[-0.02em] uppercase">
              STOP THE PROFIT DRAIN
            </h1>
            <p className="text-xl sm:text-2xl font-salmond text-[#faae33]/80 tracking-wide max-w-3xl pt-4 uppercase">
              Know exactly which clients make you money — and which quietly bleed margin. Clean CSV ingestion, instant P&L analytics, and actionable pricing insights.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={handleDemoLaunch}
              disabled={demoLoading}
              className="btn-primary-filled text-base px-8 py-3.5 flex items-center gap-2"
            >
              <span>EXPLORE LIVE CFO DEMO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/signup" className="btn-ghost-outline text-base px-6 py-3">
              CREATE FREE WORKSPACE
            </Link>
          </div>

          {/* Poster Feature Stats Grid: 3 Step Brown Depth */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            <div className="tiger-card">
              <span className="text-xs font-salmond tracking-widest text-[#faae33]/70 uppercase block mb-1">
                DISCOVERY 01
              </span>
              <div className="text-4xl font-salmond font-bold text-[#faae33] mb-2">
                TOP 20% CLIENT CONCENTRATION
              </div>
              <p className="text-xs text-[#faae33]/70 leading-relaxed font-graphikx">
                Uncover if 80% of your earnings come from just 3 clients while the rest run near break-even.
              </p>
            </div>

            <div className="tiger-card">
              <span className="text-xs font-salmond tracking-widest text-[#faae33]/70 uppercase block mb-1">
                PROTECTION 02
              </span>
              <div className="text-4xl font-salmond font-bold text-[#d1255c] mb-2">
                HIDDEN LOSS-MAKING LEAKS
              </div>
              <p className="text-xs text-[#faae33]/70 leading-relaxed font-graphikx">
                Flag unbilled hours, scope creep, and expensive customer support overhead destroying net margins.
              </p>
            </div>

            <div className="tiger-card">
              <span className="text-xs font-salmond tracking-widest text-[#faae33]/70 uppercase block mb-1">
                AGILITY 03
              </span>
              <div className="text-4xl font-salmond font-bold text-[#faae33] mb-2">
                CLOUD SYNC TO TURSO
              </div>
              <p className="text-xs text-[#faae33]/70 leading-relaxed font-graphikx">
                Sub-millisecond query latency powered by serverless libSQL database and automated Prisma migrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dotted divider */}
      <div className="dotted-divider opacity-60" />

      {/* 4. Features Section */}
      <section id="features" className="py-20 px-6 lg:px-12 bg-[#281006]">
        <div className="max-w-[1440px] mx-auto space-y-12">
          <div className="space-y-2">
            <span className="text-xs font-salmond tracking-[2px] uppercase text-[#faae33]/60">
              CAPABILITIES
            </span>
            <h2 className="text-5xl sm:text-7xl font-salmond font-bold text-[#faae33] uppercase leading-[0.9]">
              ENGINEERED FOR MODERN CFOS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileSpreadsheet,
                title: "UNIVERSAL CSV INGESTION",
                desc: "Auto-detect columns for client name, amount, date, and transaction classification.",
              },
              {
                icon: Percent,
                title: "GROSS MARGIN ENGINE",
                desc: "Automatic monthly period rollups calculating gross profit, margins, and period-over-period variance.",
              },
              {
                icon: AlertTriangle,
                title: "LOSS IDENTIFICATION",
                desc: "Real-time alerts for clients dropping under threshold margin so your team can intervene immediately.",
              },
              {
                icon: BarChart3,
                title: "CLIENT HEALTH RADAR",
                desc: "Visual quadrant ranking top contributors against bottom drains with one-click drilldowns.",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="tiger-card p-6 flex flex-col justify-between">
                  <div className="w-10 h-10 rounded-full bg-[#281006] border border-[#6b2e12] flex items-center justify-center mb-4 text-[#faae33]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-salmond font-bold text-[#faae33] mb-2">{f.title}</h3>
                    <p className="text-xs text-[#faae33]/70 font-graphikx leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dotted divider */}
      <div className="dotted-divider opacity-60" />

      {/* 5. Footer */}
      <footer className="py-12 px-6 lg:px-12 bg-[#281006] text-[#faae33]/60 text-xs">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-salmond text-lg font-bold text-[#faae33]">CLIENT360</span>
            <span>•</span>
            <span className="font-graphikx">HUNGRY TIGER POSTER THEME</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 font-salmond uppercase tracking-wider text-[#faae33]">
            <Link href="/privacy" className="hover:underline">PRIVACY</Link>
            <Link href="/terms" className="hover:underline">TERMS</Link>
            <Link href="/login" className="hover:underline">LOGIN</Link>
            <Link href="/signup" className="hover:underline">REGISTER</Link>
            <button onClick={handleDemoLaunch} className="hover:underline">DEMO</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
