"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  FileSpreadsheet,
  Layers,
  BarChart3,
  UploadCloud,
  ChevronRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { useCurrency } from "@/lib/currency-context";
import { CurrencySelector } from "@/components/ui/CurrencySelector";
import {
  ClayMascot,
  MascotLineup,
  MASCOTS,
  MascotId,
} from "@/components/ui/ClaymationMascots";

export default function LandingPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { success, error } = useToast();
  const { formatAmount } = useCurrency();
  const [demoLoading, setDemoLoading] = useState(false);
  const [activePersona, setActivePersona] = useState<MascotId>("evan");

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

  const personaKeys: MascotId[] = ["evan", "atlas", "nico", "nova", "iris"];

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] text-[#272727] selection:bg-[#d6e5ff] selection:text-[#7451f2]">
      {/* Top Navigation Bar — Sticky header ~64px */}
      <header className="h-16 border-b border-[#e0e0e0] bg-[#ffffff] sticky top-0 z-40 px-6 sm:px-10">
        <div className="max-w-[1200px] h-full mx-auto flex items-center justify-between gap-8">
          {/* Left: Brand mark */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-5 h-5 rounded-[4px] bg-[#7451f2] flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-[#272727]">
              Client360
            </span>
          </Link>

          {/* Center: Ghost nav links with expanded spacing */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <a href="#workers" className="btn-ghost">
              AI Workers
            </a>
            <a href="#integrations" className="btn-ghost">
              Integrations
            </a>
            <a href="#security" className="btn-ghost">
              Security
            </a>
            <Link href="/privacy" className="btn-ghost">
              Trust Center
            </Link>
          </nav>

          {/* Right: Currency Selector + Ghost Log In + Filled Violet CTA with expanded spacing */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <CurrencySelector />

            <Link
              href="/login"
              className="btn-ghost text-xs"
            >
              Log in
            </Link>
            <button
              onClick={() => handleDemoLaunch()}
              disabled={demoLoading}
              className="btn-primary text-xs px-5 py-2.5"
            >
              {demoLoading ? "Starting Demo..." : "Get Early Access"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Hero Section — Two-column split on desktop */}
        <section className="py-20 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center border-b border-[#e0e0e0]">
          {/* Left: Serif Headline + Body + Button Stack */}
          <div className="lg:col-span-7 space-y-6">
            <div className="font-mono-eyebrow">
              AUTONOMOUS PROFITABILITY ENGINE
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[54px] text-[#272727] font-normal leading-[1.1] tracking-[-2.6px]">
              Meet your new AI finance team for client gross margins.
            </h1>
            <p className="text-base sm:text-lg text-[#5d5d5d] leading-[1.6] max-w-[580px]">
              Client360 deploys specialized claymation AI agents to continuously audit client revenue, attribute delivery costs, and stop margin leakage before your board meeting.
            </p>

            {/* Primary CTA + Outlined Secondary Button Stack on 16px gap */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleDemoLaunch()}
                disabled={demoLoading}
                className="btn-primary text-sm px-6 py-3"
              >
                <Sparkles className="w-4 h-4" />
                <span>{demoLoading ? "Launching Demo..." : "Launch Live CFO Demo"}</span>
              </button>

              <Link
                href="/signup"
                className="btn-secondary text-sm px-5 py-3"
              >
                <span>Explore AI Workers</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="pt-2 flex items-center gap-6 text-xs text-[#858585] font-mono">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7451f2]" />
                12-Month Live Dataset
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#7451f2]" />
                Zero Setup Required
              </span>
            </div>
          </div>

          {/* Right: Light-themed Product Preview with Mascot Lineup in front */}
          <div className="lg:col-span-5 relative">
            {/* macOS native style window mock */}
            <div className="rounded-[4px] border border-[#e0e0e0] bg-[#ffffff] shadow-sm overflow-hidden">
              {/* Window Title Bar */}
              <div className="h-9 bg-[#f6f6f6] border-b border-[#e0e0e0] px-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e0e0e0]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e0e0e0]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#e0e0e0]" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22px] text-[#858585]">
                  client360-diagnostic.app
                </span>
                <span className="w-8" />
              </div>

              {/* Chat & Margin Feed Mock */}
              <div className="p-5 space-y-4 bg-[#ffffff]">
                <div className="p-3 rounded-[4px] bg-[#f6f6f6] border border-[#e0e0e0] space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#7451f2] font-semibold uppercase">Evan • Meeting Prep</span>
                    <span className="text-[#858585]">Just now</span>
                  </div>
                  <p className="text-xs text-[#272727] leading-relaxed">
                    &quot;I audited Zenith Dynamics for Thursday&apos;s QBR. Billed {formatAmount(4120000, true)}, incurred {formatAmount(3480000, true)} in costs. Gross margin dropped to 15.5% — {formatAmount(184000, true)} below your 20% target.&quot;
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff]">
                    <span className="font-mono text-[10px] uppercase text-[#858585] block">Audited Revenue</span>
                    <span className="font-semibold text-sm text-[#272727]">{formatAmount(3842500, true)}</span>
                  </div>
                  <div className="p-2.5 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff]">
                    <span className="font-mono text-[10px] uppercase text-[#858585] block">Margin Drain</span>
                    <span className="font-semibold text-sm text-[#e11d48]">-{formatAmount(58400, true)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e0e0e0] flex items-center justify-between text-xs text-[#5d5d5d]">
                  <span className="font-mono text-[11px]">STATUS: 18 ACCOUNTS SYNCED</span>
                  <span className="badge-pill text-[10px]">HEALTHY</span>
                </div>
              </div>
            </div>

            {/* Mascot Lineup standing in front of the preview */}
            <div className="mt-4 pt-2 flex justify-center">
              <MascotLineup />
            </div>
            <div className="text-center font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mt-1">
              Evan • Atlas • Nico • Nova • Iris
            </div>
          </div>
        </section>

        {/* Trust Logo Strip — Social Proof */}
        <section className="py-12 border-b border-[#e0e0e0] text-center space-y-6">
          <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585]">
            TRUSTED BY FINANCE LEADERS AT
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            <span className="font-serif text-lg tracking-tight font-bold text-[#272727]">Notion</span>
            <span className="font-sans text-sm font-semibold tracking-wide text-[#272727]">PERFORM</span>
            <span className="font-mono text-sm tracking-tight text-[#272727]">HUSK</span>
            <span className="font-sans text-base font-bold text-[#272727]">Google Cloud</span>
            <span className="font-serif italic text-base text-[#272727]">espresso</span>
            <span className="font-sans text-xs uppercase font-bold tracking-wider text-[#272727]">Golden Proportions</span>
          </div>
        </section>

        {/* Persona Tab Navigation — showcase the five AI workers */}
        <section id="workers" className="py-20 border-b border-[#e0e0e0] space-y-10">
          <div className="text-center space-y-2 max-w-[640px] mx-auto">
            <div className="font-mono-eyebrow">YOUR NEXT HIRE</div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#272727] tracking-tight font-normal">
              A specialized AI worker for every margin problem.
            </h2>
            <p className="text-sm sm:text-base text-[#5d5d5d]">
              Pick an AI worker to automate audit tasks, contract pricing, and executive briefing notes.
            </p>
          </div>

          {/* 5 Equal-width Persona Tabs */}
          <div className="border border-[#e0e0e0] rounded-[4px] overflow-hidden bg-[#ffffff]">
            <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-[#e0e0e0] border-b border-[#e0e0e0]">
              {personaKeys.map((key) => {
                const persona = MASCOTS[key];
                const isActive = activePersona === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActivePersona(key)}
                    className={`p-4 text-left transition-colors flex flex-col justify-between min-h-[90px] relative ${
                      isActive ? "bg-[#f6f6f6]" : "bg-[#ffffff] hover:bg-[#fafafa]"
                    }`}
                  >
                    {isActive ? (
                      <span className="badge-pill self-start mb-2 bg-[#ffffff] text-[#7451f2] border-[#7451f2]/30">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="badge-pill self-start mb-2 text-[#858585]">
                        COMING SOON
                      </span>
                    )}
                    <div>
                      <div className="font-semibold text-sm text-[#272727] font-sans">
                        {persona.name}
                      </div>
                      <div className="text-xs text-[#858585] font-sans">
                        {persona.role}
                      </div>
                    </div>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7451f2]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Persona Spotlight Feature Box */}
            <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#ffffff]">
              <div className="md:col-span-7 space-y-4">
                <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#7451f2]">
                  {MASCOTS[activePersona].shape} SILHOUETTE • {MASCOTS[activePersona].colorName}
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl text-[#272727] font-normal tracking-tight">
                  {MASCOTS[activePersona].name} — {MASCOTS[activePersona].role}
                </h3>
                <p className="text-base text-[#5d5d5d] leading-relaxed">
                  {MASCOTS[activePersona].description}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => handleDemoLaunch()}
                    className="btn-primary text-xs"
                  >
                    Deploy {MASCOTS[activePersona].name} to Workspace
                  </button>
                  <span className="text-xs font-mono text-[#858585]">
                    CONNECTS WITH: QUICKBOOKS, XERO, STRIPE
                  </span>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center items-center">
                <div className="p-6 rounded-[4px] bg-[#f6f6f6] border border-[#e0e0e0] flex flex-col items-center">
                  <ClayMascot id={activePersona} size={140} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#272727] font-bold mt-2">
                    {MASCOTS[activePersona].name}
                  </span>
                  <span className="text-xs text-[#858585]">
                    {MASCOTS[activePersona].role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Custom Workers Banner */}
        <section className="py-12 border-b border-[#e0e0e0]">
          <div className="p-6 sm:p-8 rounded-[4px] bg-[#f6f6f6] border border-[#e0e0e0] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex items-center justify-center shrink-0">
                <ClayMascot id="nico" size={40} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-base font-semibold text-[#272727]">
                  Custom AI Workers for bespoke billing structures
                </h4>
                <p className="text-sm text-[#5d5d5d]">
                  Need multi-currency blended rate cards or project milestones? Our engineers configure custom workers for your ledger schema.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDemoLaunch()}
              className="btn-primary text-xs shrink-0 self-start sm:self-center"
            >
              Request Custom Worker
            </button>
          </div>
        </section>

        {/* Integrations Grid with Dotted Grid Background */}
        <section id="integrations" className="py-20 border-b border-[#e0e0e0] space-y-10">
          <div className="text-center space-y-2 max-w-[640px] mx-auto">
            <div className="font-mono-eyebrow">INTEGRATIONS</div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#272727] tracking-tight font-normal">
              Connect anything in under 60 seconds.
            </h2>
            <p className="text-sm sm:text-base text-[#5d5d5d]">
              Direct CSV ingestion, cloud accounting APIs, or continuous webhook syncing.
            </p>
          </div>

          {/* Bento-style asymmetric grid on dotted grid background */}
          <div className="p-8 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff] bg-dotted-grid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] space-y-2">
                <span className="font-mono text-[10px] text-[#7451f2] uppercase font-bold tracking-[0.22px]">ACCOUNTING</span>
                <h4 className="font-semibold text-base text-[#272727]">QuickBooks Online</h4>
                <p className="text-xs text-[#5d5d5d]">Automatic invoice line-item extraction with vendor expense matching.</p>
              </div>

              <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] space-y-2">
                <span className="font-mono text-[10px] text-[#7451f2] uppercase font-bold tracking-[0.22px]">ACCOUNTING</span>
                <h4 className="font-semibold text-base text-[#272727]">Xero Cloud Ledger</h4>
                <p className="text-xs text-[#5d5d5d]">Real-time tracking of direct client labor costs against gross revenue.</p>
              </div>

              <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] space-y-2">
                <span className="font-mono text-[10px] text-[#7451f2] uppercase font-bold tracking-[0.22px]">BILLING</span>
                <h4 className="font-semibold text-base text-[#272727]">Stripe Billing & Invoicing</h4>
                <p className="text-xs text-[#5d5d5d]">SaaS recurring subscription fees, refund adjustments, and processor fees.</p>
              </div>

              {/* Center Prominent Card */}
              <div className="sm:col-span-2 lg:col-span-3 p-8 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] text-center space-y-4 my-2">
                <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585]">
                  UNIVERSAL ADAPTER
                </div>
                <h3 className="font-heading text-2xl sm:text-3xl text-[#272727] font-normal">
                  Universal CSV & Spreadsheet Ingestion
                </h3>
                <p className="text-sm text-[#5d5d5d] max-w-[500px] mx-auto">
                  Drag and drop any 3-column CSV (Date, Client, Amount) with automatic BOM stripping, integer-cents math, and formula injection sanitization.
                </p>
                <div className="pt-2">
                  <Link
                    href="/uploads"
                    className="btn-secondary text-xs"
                  >
                    Explore Integrations
                  </Link>
                </div>
              </div>

              <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] space-y-2">
                <span className="font-mono text-[10px] text-[#7451f2] uppercase font-bold tracking-[0.22px]">CRM</span>
                <h4 className="font-semibold text-base text-[#272727]">HubSpot & Salesforce</h4>
                <p className="text-xs text-[#5d5d5d]">Link contract deal size and account owner directly to margin performance.</p>
              </div>

              <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] space-y-2">
                <span className="font-mono text-[10px] text-[#7451f2] uppercase font-bold tracking-[0.22px]">STORAGE</span>
                <h4 className="font-semibold text-base text-[#272727]">Turso Cloud libSQL</h4>
                <p className="text-xs text-[#5d5d5d]">Distributed AWS edge database with encrypted SQLite architecture.</p>
              </div>

              <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] space-y-2">
                <span className="font-mono text-[10px] text-[#7451f2] uppercase font-bold tracking-[0.22px]">EXPORT</span>
                <h4 className="font-semibold text-base text-[#272727]">Executive Board Decks</h4>
                <p className="text-xs text-[#5d5d5d]">1-click sanitized CSV exports and margin diagnostic scorecards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Trust Card */}
        <section id="security" className="py-20 border-b border-[#e0e0e0]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 rounded-[4px] bg-[#f6f6f6] border border-[#e0e0e0]">
            <div className="lg:col-span-7 space-y-4">
              <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585]">
                SECURITY & ENTERPRISE COMPLIANCE
              </div>
              <h3 className="font-display text-3xl sm:text-4xl text-[#272727] font-normal tracking-tight">
                No training on your financial data.
              </h3>
              <p className="text-base text-[#5d5d5d] leading-relaxed">
                Your company financials are strictly isolated in single-tenant workspaces with client-side integer-cents arithmetic. We never train generative AI models on your private general ledger.
              </p>
              <div className="pt-2">
                <Link
                  href="/privacy"
                  className="btn-secondary text-xs"
                >
                  Visit Trust Center
                </Link>
              </div>
            </div>

            {/* 4 Circular Compliance Seals in brand colors */}
            <div className="lg:col-span-5 flex flex-wrap items-center justify-center lg:justify-end gap-4">
              {/* AICPA SOC 2 */}
              <div className="w-20 h-20 rounded-full border border-[#0072c6] bg-[#ffffff] flex flex-col items-center justify-center text-center p-2 shadow-sm">
                <span className="font-mono text-[9px] uppercase font-bold text-[#0072c6]">AICPA</span>
                <span className="font-bold text-xs text-[#272727]">SOC 2</span>
                <span className="font-mono text-[8px] text-[#858585]">Type II</span>
              </div>

              {/* GDPR */}
              <div className="w-20 h-20 rounded-full border border-[#003399] bg-[#ffffff] flex flex-col items-center justify-center text-center p-2 shadow-sm">
                <span className="font-mono text-[9px] uppercase font-bold text-[#003399]">EU</span>
                <span className="font-bold text-xs text-[#272727]">GDPR</span>
                <span className="font-mono text-[8px] text-[#858585]">Compliant</span>
              </div>

              {/* HIPAA */}
              <div className="w-20 h-20 rounded-full border border-[#00a86b] bg-[#ffffff] flex flex-col items-center justify-center text-center p-2 shadow-sm">
                <span className="font-mono text-[9px] uppercase font-bold text-[#00a86b]">HEALTH</span>
                <span className="font-bold text-xs text-[#272727]">HIPAA</span>
                <span className="font-mono text-[8px] text-[#858585]">Ready</span>
              </div>

              {/* CCPA */}
              <div className="w-20 h-20 rounded-full border border-[#f59e0b] bg-[#ffffff] flex flex-col items-center justify-center text-center p-2 shadow-sm">
                <span className="font-mono text-[9px] uppercase font-bold text-[#f59e0b]">STATE</span>
                <span className="font-bold text-xs text-[#272727]">CCPA</span>
                <span className="font-mono text-[8px] text-[#858585]">Verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Hero Band */}
        <section className="py-20 text-center space-y-6">
          <div className="font-mono-eyebrow">GET STARTED TODAY</div>
          <h2 className="font-display text-4xl sm:text-5xl text-[#272727] tracking-tight font-normal">
            Ready to audit your client margins?
          </h2>
          <p className="text-base text-[#5d5d5d] max-w-[520px] mx-auto">
            Test drive the full 12-month platform right now with our 1-click live demo, or sign up for your private workspace.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleDemoLaunch()}
              disabled={demoLoading}
              className="btn-primary text-sm px-6 py-3"
            >
              <Sparkles className="w-4 h-4" />
              <span>{demoLoading ? "Starting Demo..." : "Launch Live CFO Demo"}</span>
            </button>

            <Link
              href="/signup"
              className="btn-secondary text-sm px-5 py-3"
            >
              Create Account
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e0e0e0] py-8 px-4 sm:px-8 bg-[#ffffff]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#858585]">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-[2px] bg-[#7451f2]" />
            <span className="font-semibold text-[#272727]">Client360</span>
            <span>—</span>
            <span>Whimsical claymation precision for client profitability.</span>
          </div>
          <div className="flex items-center gap-6 text-[#5d5d5d]">
            <Link href="/privacy" className="hover:text-[#7451f2] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#7451f2] transition-colors">
              Terms of Service
            </Link>
            <Link href="/login" className="hover:text-[#7451f2] transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
