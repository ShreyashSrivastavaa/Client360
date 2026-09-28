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
    <div className="min-h-screen bg-[#ffffff] text-[#1a1a1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#fff6d4] selection:text-[#1a1a1a]">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffb84d]" />
          <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">
            Client360
          </span>
        </Link>

        <h2 className="text-center text-rows-heading">
          {step === 1 ? "Create your company workspace" : "How would you like to start?"}
        </h2>
        <p className="mt-2 text-center text-xs text-[#6f6f6f]">
          {step === 1 ? (
            <>
              Already have an account?{" "}
              <Link href="/login" className="text-[#1a1a1a] font-bold hover:underline">
                Sign in
              </Link>
            </>
          ) : (
            "Step 2 of 2: Ingest your initial client financial data"
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white p-6 sm:p-8 rounded-[8px] border border-[#eaeaea] space-y-6">
          {authError && (
            <div className="p-3 rounded-[4px] border border-[#e11d48] bg-white text-xs text-[#e11d48] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-rows-caption block mb-1.5">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="input-rows-default w-full text-xs"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="text-rows-caption block mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-rows-default w-full text-xs"
                    placeholder="jane@company.com"
                  />
                </div>
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
                  minLength={6}
                  className="input-rows-default w-full text-xs"
                  placeholder="•••••••• (min 6 characters)"
                />
              </div>

              <div className="pt-2 border-t border-[#eaeaea]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-rows-caption block mb-1.5">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="input-rows-default w-full text-xs"
                      placeholder="Acme Global Inc"
                    />
                  </div>
                  <div>
                    <label className="text-rows-caption block mb-1.5">
                      Industry
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="input-rows-default w-full text-xs"
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
              <div className="p-3.5 rounded-[4px] bg-[#f7f7f7] border border-[#eaeaea] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.21px] text-[#1a1a1a] block">
                  Default Gross Margin Classification Rules:
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#16a34a] font-bold block">
                      Profitable (≥ %)
                    </span>
                    <input
                      type="number"
                      value={profitableThreshold}
                      onChange={(e) => setProfitableThreshold(e.target.value)}
                      className="input-rows-default w-full text-xs mt-1"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#6f6f6f] font-bold block">
                      Low-Margin Floor (≥ %)
                    </span>
                    <input
                      type="number"
                      value={lowMarginThreshold}
                      onChange={(e) => setLowMarginThreshold(e.target.value)}
                      className="input-rows-default w-full text-xs mt-1"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-rows-primary w-full text-xs py-2 justify-center"
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
            <div className="space-y-3">
              <div
                onClick={handleChooseSampleData}
                className="p-4 rounded-[4px] border border-[#1a1a1a] bg-white hover:bg-[#f7f7f7] cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1a1a1a] font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#ffb84d]" />
                    <span>Explore with Sample Data (Recommended)</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.21px] text-[#838383]">
                    Instant Setup
                  </span>
                </div>
                <p className="text-xs text-[#6f6f6f] leading-relaxed">
                  Populate your dashboard with 18 realistic B2B accounts across 12 months. Test all
                  charts, margin insights, and filters immediately.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-bold text-[#1a1a1a]">
                  <span>Populate & Open Dashboard</span>
                  <span>→</span>
                </div>
              </div>

              <div
                onClick={handleChooseUploadNow}
                className="p-4 rounded-[4px] border border-[#eaeaea] bg-white hover:border-[#1a1a1a] cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#1a1a1a] font-bold text-xs">
                    <UploadCloud className="w-3.5 h-3.5 text-[#838383]" />
                    <span>Upload Your Own CSV Files</span>
                  </div>
                </div>
                <p className="text-xs text-[#6f6f6f] leading-relaxed">
                  Skip demo data and jump straight to the upload wizard to ingest your company&apos;s
                  actual revenue and expense files.
                </p>
                <div className="pt-1 flex items-center gap-1.5 text-xs font-normal text-[#6f6f6f]">
                  <span>Go to Upload Wizard</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
