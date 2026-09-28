"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Search,
  Sparkles,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  UploadCloud,
  FileSpreadsheet,
  Layers,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";

export default function LandingPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { success, error } = useToast();
  const [demoLoading, setDemoLoading] = useState(false);
  const [promptValue, setPromptValue] = useState("");

  const handleDemoLaunch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // 4-column Discovery Template Categories
  const templateCategories = [
    {
      header: "ANALYSIS TEMPLATES",
      items: [
        { label: "Gross Margin Diagnostic", dot: "#34d399" }, // Mint
        { label: "Loss-Making Client Audit", dot: "#f472b6" }, // Soft Pink
        { label: "Pareto 80/20 Profit Distribution", dot: "#38bdf8" }, // Sky Blue
        { label: "Account Tier Profitability", dot: "#fbbf24" }, // Amber
      ],
    },
    {
      header: "LEDGER IMPORTS",
      items: [
        { label: "QuickBooks Online Sales & Expense", dot: "#34d399" },
        { label: "Xero Invoices & Bill Line Items", dot: "#38bdf8" },
        { label: "Stripe Recurring Subscription CSV", dot: "#a78bfa" }, // Violet
        { label: "Custom 3-Column CSV (Date, Client, Amount)", dot: "#fbbf24" },
      ],
    },
    {
      header: "EXECUTIVE REPORTS",
      items: [
        { label: "Quarterly Board Revenue & Cost Deck", dot: "#38bdf8" },
        { label: "Account Manager Profit Scorecard", dot: "#fbbf24" },
        { label: "Churn Risk & Low-Margin Early Warning", dot: "#f472b6" },
        { label: "Contract Renewal Pricing Calculator", dot: "#a78bfa" },
      ],
    },
    {
      header: "FINANCIAL AUTOMATIONS",
      items: [
        { label: "Automated Formula Sanitization", dot: "#34d399" },
        { label: "Multi-Tenant Cloud Sync (Turso)", dot: "#38bdf8" },
        { label: "Monthly Margin Drift Tracker", dot: "#fbbf24" },
        { label: "Direct Invoicing Cost Attribution", dot: "#a78bfa" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#1a1a1a] selection:bg-[#fff6d4] selection:text-[#1a1a1a]">
      {/* Top Bar — Minimal app chrome */}
      <header className="h-14 border-b border-[#eaeaea] bg-[#ffffff] sticky top-0 z-40 px-4 sm:px-8">
        <div className="max-w-[1080px] h-full mx-auto flex items-center justify-between">
          {/* Left: Brand Workspace */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ffb84d]" />
            <span className="text-sm font-bold text-[#1a1a1a] tracking-tight">Client360</span>
            <span className="text-xs text-[#838383] hidden sm:inline ml-2 pl-2 border-l border-[#eaeaea]">
              Spreadsheet-Speed Profitability
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-[#989898] hover:text-[#1a1a1a] transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn-rows-outlined text-xs py-1.5 px-3"
            >
              Free sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 max-w-[1080px] w-full mx-auto px-4 sm:px-8 pt-20 pb-24 flex flex-col">
        {/* Hero Stack */}
        <div className="w-full max-w-[960px] mx-auto space-y-6">
          {/* Hero Greeting: 24px/700, -0.043em tracking */}
          <div>
            <h1 className="text-rows-heading">
              Hi, what client margins do you want to inspect?
            </h1>
            <p className="text-sm text-[#6f6f6f] mt-2">
              Tabular clarity on gross profit, cost attribution, and drain accounts across your portfolio.
            </p>
          </div>

          {/* Primary Input — The Single Marigold Accent per screen */}
          <form onSubmit={handleDemoLaunch} className="relative">
            <input
              type="text"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              placeholder="Audit Acme Corp profitability, upload CSV ledger, or run Pareto..."
              className="input-rows-marigold w-full pr-32"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="submit"
                disabled={demoLoading}
                className="btn-rows-primary py-2 px-3 text-xs"
              >
                {demoLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Launch</span>
              </button>
            </div>
          </form>

          {/* Ghost link below input */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-[#838383]">
              Tip: Press enter to test with 18 pre-loaded enterprise accounts.
            </span>
            <button
              onClick={() => handleDemoLaunch()}
              disabled={demoLoading}
              className="btn-rows-ghost text-xs"
            >
              <span>Explore live demo environment</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Discovery Template Grid — 4 columns, 24px gap, 8px row gap, NO card chrome */}
        <div className="w-full max-w-[960px] mx-auto mt-20 pt-10 border-t border-[#eaeaea]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
            {templateCategories.map((category) => (
              <div key={category.header} className="space-y-3">
                {/* Column Header: 10px/700 Graphite, positively tracked */}
                <h3 className="text-rows-caption">
                  {category.header}
                </h3>

                {/* Template Items */}
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setPromptValue(item.label);
                        handleDemoLaunch();
                      }}
                      className="w-full text-left py-2.5 flex items-center gap-2 text-sm text-[#1a1a1a] hover:text-[#6f6f6f] transition-colors group cursor-pointer"
                    >
                      {/* 6px Solid Category Dot */}
                      <span
                        className="w-[6px] h-[6px] rounded-full shrink-0"
                        style={{ backgroundColor: item.dot }}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Value Proposition — Tabular density with hairline dividers */}
        <div className="w-full max-w-[960px] mx-auto mt-24 pt-12 border-t border-[#eaeaea]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-2">
              <div className="text-rows-caption">01 / MARGIN DISCOVERY</div>
              <h4 className="font-bold text-[#1a1a1a]">Stop subsidizing unprofitable accounts</h4>
              <p className="text-[#6f6f6f] text-xs leading-relaxed">
                Most B2B portfolios suffer from the top 20% of clients funding the bottom 20%. Client360 classifies every account into Profitable, Low-Margin, or Loss-Making tiers.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-rows-caption">02 / CSV LEDGER PARSER</div>
              <h4 className="font-bold text-[#1a1a1a]">Zero-friction ingest with formula sanitization</h4>
              <p className="text-[#6f6f6f] text-xs leading-relaxed">
                Drag and drop QuickBooks, Xero, or Stripe exports. The parser auto-detects date formats, parenthesized negatives, and strips spreadsheet injection formulas before storage.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-rows-caption">03 / DRIFT & CONCENTRATION</div>
              <h4 className="font-bold text-[#1a1a1a]">Continuous margin health warnings</h4>
              <p className="text-[#6f6f6f] text-xs leading-relaxed">
                Real-time rule engines detect revenue concentration risk, chronic loss streaks, and margin degradation before quarterly reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Start from blank CTA */}
        <div className="w-full max-w-[960px] mx-auto mt-20 pt-8 border-t border-[#eaeaea] flex items-center justify-between">
          <span className="text-xs text-[#838383]">
            No credit card required. Works offline with local SQLite or cloud Turso.
          </span>
          <button
            onClick={() => handleDemoLaunch()}
            className="btn-rows-ghost text-sm font-normal"
          >
            <span>Start from blank spreadsheet</span>
            <span>→</span>
          </button>
        </div>
      </main>

      {/* Minimal Footer — Centered row at the bottom of the canvas */}
      <footer className="border-t border-[#eaeaea] py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-6 text-sm text-[#6f6f6f]">
          <Link href="/login" className="hover:text-[#1a1a1a] transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-[#1a1a1a] transition-colors">
            Sign up
          </Link>
          <Link href="/privacy" className="hover:text-[#1a1a1a] transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#1a1a1a] transition-colors">
            Terms
          </Link>
          <a
            href="https://github.com/ShreyashSrivastavaa/Client360"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#1a1a1a] transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
