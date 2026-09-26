"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Layers,
  ArrowRight,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { success, error } = useToast();

  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("B2B SaaS & Professional Services");
  const [profitableThreshold, setProfitableThreshold] = useState("20.0");
  const [lowMarginThreshold, setLowMarginThreshold] = useState("5.0");

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Handle Step 1 Submit
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      await apiFetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          fullName,
          email,
          password,
          companyName,
          industry,
          profitableMarginThreshold: profitableThreshold,
          lowMarginThreshold,
        }),
      });

      await refreshAuth();
      success(`Organization "${companyName}" created!`, "Workspace Ready");
      setStep(2);
    } catch (err: any) {
      setAuthError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Choose sample data or fresh upload
  const handleChooseSampleData = async () => {
    setLoading(true);
    try {
      await apiFetch("/api/demo/load", { method: "POST" });
      success("Sample data loaded! Welcome to your dashboard.");
      router.push("/dashboard");
    } catch (err: any) {
      error(err.message || "Failed to load sample data");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleChooseUploadNow = () => {
    router.push("/uploads");
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-zinc-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">ProfitLens</span>
        </div>

        <h2 className="text-center text-xl font-bold tracking-tight text-white">
          {step === 1 ? "Create your company workspace" : "How would you like to start?"}
        </h2>
        <p className="mt-2 text-center text-xs text-zinc-400">
          {step === 1 ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Log in
              </Link>
            </>
          ) : (
            "Step 2 of 2: Ingest your initial client financial data"
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-zinc-800 shadow-2xl space-y-6">
          {authError && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="jane@company.com"
                  />
                </div>
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
                  minLength={6}
                  className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="•••••••• (min 6 characters)"
                />
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                      placeholder="Acme Global Inc"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full text-xs bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="B2B SaaS & Professional Services">
                        B2B SaaS & Services
                      </option>
                      <option value="Agency & Consulting">Agency & Consulting</option>
                      <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                      <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                      <option value="Financial & Legal Services">Financial & Legal Services</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Thresholds setup */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <span className="text-[11px] font-semibold text-zinc-300 block">
                  Default Gross Margin Thresholds:
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-400 font-medium block">
                      Profitable (≥ %)
                    </span>
                    <input
                      type="number"
                      value={profitableThreshold}
                      onChange={(e) => setProfitableThreshold(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-white text-xs mt-0.5"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 font-medium block">
                      Low-Margin Floor (≥ %)
                    </span>
                    <input
                      type="number"
                      value={lowMarginThreshold}
                      onChange={(e) => setLowMarginThreshold(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded p-1.5 text-white text-xs mt-0.5"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>Continue to Step 2</span>
              </button>
            </form>
          ) : (
            /* Step 2 Onboarding */
            <div className="space-y-4">
              <div
                onClick={handleChooseSampleData}
                className="p-5 rounded-2xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/15 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Explore with Sample Data (Recommended)</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-semibold">
                    Instant Setup
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Populate your dashboard with 18 realistic B2B accounts across 12 months. Test all
                  charts, margin insights, and filters immediately. Can be cleared at any time in
                  Settings.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                  <span>Populate & Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={handleChooseUploadNow}
                className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
                    <UploadCloud className="w-4 h-4 text-zinc-400" />
                    <span>Upload Your Own CSV Files</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Skip demo data and jump straight to the upload wizard to ingest your company&apos;s
                  actual revenue and expense files.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-zinc-300 group-hover:text-white">
                  <span>Go to Upload Wizard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
