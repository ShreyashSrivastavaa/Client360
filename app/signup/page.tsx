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
  Database,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { apiFetch } from "@/lib/api-client";
import { ClayMascot } from "@/components/ui/ClaymationMascots";

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
      success(`Organization "${companyName}" created!`);
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
    <div className="min-h-screen bg-[#ffffff] text-[#272727] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#d6e5ff] selection:text-[#7451f2]">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
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
          {step === 1 ? "ORG PROVISIONING" : "PORTFOLIO ONBOARDING"}
        </div>
        <h2 className="font-serif text-3xl font-normal text-[#272727] tracking-tight">
          {step === 1 ? "Create your company workspace" : "How would you like to start?"}
        </h2>
        <p className="mt-2 text-xs text-[#5d5d5d]">
          {step === 1 ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-[#7451f2] font-semibold hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            "Choose whether to test-drive with our benchmark dataset or connect your actual ledger."
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-[#ffffff] p-6 sm:p-8 rounded-[4px] border border-[#e0e0e0] space-y-6">
          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              {authError && (
                <div className="p-3 rounded-[4px] border border-[#e11d48] bg-[#ffffff] text-xs text-[#e11d48] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] block mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="input-default w-full text-xs"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] block mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="input-default w-full text-xs"
                    placeholder="Acme Growth Inc."
                  />
                </div>
              </div>

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
                  placeholder="jane@company.com"
                />
              </div>

              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] block mb-1.5">
                  Password (min 8 characters)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="input-default w-full text-xs"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2 border-t border-[#e0e0e0] space-y-3">
                <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585]">
                  Initial Margin Thresholds
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#5d5d5d] block mb-1">
                      Profitable Threshold (≥ %)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profitableThreshold}
                      onChange={(e) => setProfitableThreshold(e.target.value)}
                      className="input-default w-full text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#5d5d5d] block mb-1">
                      Low-Margin Floor (&lt; %)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={lowMarginThreshold}
                      onChange={(e) => setLowMarginThreshold(e.target.value)}
                      className="input-default w-full text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-xs py-2.5 justify-center mt-2"
              >
                {loading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Create Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div
                onClick={handleChooseSampleData}
                className="p-5 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff] hover:border-[#7451f2] hover:bg-[#f6f6f6] cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#272727] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#7451f2]" /> Load 12-Month Sample Dataset
                  </span>
                  <span className="badge-pill text-[10px]">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-[#5d5d5d] leading-relaxed">
                  Populate 18 realistic B2B accounts with seasonal margins, cost attribution, and diagnostic alerts.
                </p>
              </div>

              <div
                onClick={handleChooseUploadNow}
                className="p-5 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff] hover:border-[#272727] hover:bg-[#f6f6f6] cursor-pointer transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-[#272727] flex items-center gap-2">
                    <UploadCloud className="w-4 h-4 text-[#5d5d5d]" /> Upload Live CSV Immediately
                  </span>
                  <span className="badge-pill text-[10px]">
                    FRESH
                  </span>
                </div>
                <p className="text-xs text-[#5d5d5d] leading-relaxed">
                  Start with a clean ledger and import your own QuickBooks, Xero, or custom spreadsheet CSV right away.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
