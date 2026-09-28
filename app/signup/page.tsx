"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Sparkles,
  UploadCloud,
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
    <div className="min-h-screen bg-[#f7f7f8] text-[#121217] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-body">
      {/* Decorative subtle brand background circle */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5423e7]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#ffc233]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <div className="w-9 h-9 rounded-2xl bg-[#ffc233] flex items-center justify-center shadow-sm text-lg group-hover:scale-105 transition-transform">
            🍋
          </div>
          <span className="font-display text-2xl font-normal tracking-tight text-[#121217]">
            profitlens
          </span>
        </Link>

        <h2 className="text-center font-display text-2xl sm:text-3xl font-normal tracking-tight text-[#121217]">
          {step === 1 ? "Create your company workspace" : "How would you like to start?"}
        </h2>
        <p className="mt-1.5 text-center text-xs text-[#6c6c89]">
          {step === 1 ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#5423e7] hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            "Step 2 of 2: Ingest your initial client financial data"
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-[#d1d1db] shadow-[0_4px_24px_rgba(18,18,23,0.06)] space-y-6">
          {authError && (
            <div className="p-3.5 rounded-xl border border-[#d50b3e]/20 bg-[#d50b3e]/5 text-xs text-[#d50b3e] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#d50b3e] shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#121217] mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#121217] mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
                    placeholder="jane@company.com"
                  />
                </div>
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
                  minLength={6}
                  className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
                  placeholder="•••••••• (min 6 characters)"
                />
              </div>

              <div className="pt-2 border-t border-[#d1d1db]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#121217] mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
                      placeholder="Acme Global Inc"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#121217] mb-1.5">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full text-xs bg-white border border-[#d1d1db] rounded-lg p-2.5 text-[#121217] focus:outline-none focus:border-[#5423e7] focus:ring-1 focus:ring-[#5423e7]"
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
              <div className="p-4 rounded-2xl bg-[#f7f7f8] border border-[#d1d1db] space-y-2.5">
                <span className="text-[11px] font-semibold text-[#121217] block">
                  Default Gross Margin Classification Rules:
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#1e874c] font-bold block">
                      Profitable (≥ %)
                    </span>
                    <input
                      type="number"
                      value={profitableThreshold}
                      onChange={(e) => setProfitableThreshold(e.target.value)}
                      className="w-full bg-white border border-[#d1d1db] rounded-lg p-2 text-[#121217] text-xs mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#121217] font-bold block">
                      Low-Margin Floor (≥ %)
                    </span>
                    <input
                      type="number"
                      value={lowMarginThreshold}
                      onChange={(e) => setLowMarginThreshold(e.target.value)}
                      className="w-full bg-white border border-[#d1d1db] rounded-lg p-2 text-[#121217] text-xs mt-1"
                    />
                  </div>
                </div>
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
                    <span>Continue to Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2 Onboarding */
            <div className="space-y-4">
              <div
                onClick={handleChooseSampleData}
                className="p-5 rounded-2xl border border-[#5423e7] bg-[#5423e7]/5 hover:bg-[#5423e7]/10 cursor-pointer transition-all space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#121217] font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-[#5423e7]" />
                    <span>Explore with Sample Data (Recommended)</span>
                  </div>
                  <span className="text-[10px] bg-[#ffc233] text-[#121217] px-2 py-0.5 rounded-full font-bold">
                    Instant Setup
                  </span>
                </div>
                <p className="text-xs text-[#6c6c89] leading-relaxed">
                  Populate your dashboard with 18 realistic B2B accounts across 12 months. Test all
                  charts, margin insights, and filters immediately. Can be cleared at any time in
                  Settings.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-[#5423e7] group-hover:underline">
                  <span>Populate & Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={handleChooseUploadNow}
                className="p-5 rounded-2xl border border-[#d1d1db] bg-[#f7f7f8] hover:bg-white cursor-pointer transition-all space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#121217] font-bold text-sm">
                    <UploadCloud className="w-4 h-4 text-[#6c6c89]" />
                    <span>Upload Your Own CSV Files</span>
                  </div>
                </div>
                <p className="text-xs text-[#6c6c89] leading-relaxed">
                  Skip demo data and jump straight to the upload wizard to ingest your company&apos;s
                  actual revenue and expense files.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-semibold text-[#121217] group-hover:underline">
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
