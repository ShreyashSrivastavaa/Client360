import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#823513] text-[#faae33] p-6 lg:p-12 selection:bg-[#faae33] selection:text-[#281006]">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link href="/" className="btn-ghost-outline inline-flex items-center gap-2 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO HOME</span>
        </Link>

        <div className="tiger-card space-y-6 p-8">
          <div className="flex items-center gap-3 border-b border-[#6b2e12] pb-4">
            <div className="p-2.5 rounded-full bg-[#281006] text-[#faae33] border border-[#6b2e12]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-salmond font-bold text-[#faae33] uppercase">
                TERMS OF SERVICE
              </h1>
              <p className="text-xs text-[#faae33]/60 font-graphikx">Effective Date: September 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-graphikx text-[#faae33]/90 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Client360 (ProfitLens), you agree to be bound by these terms. If you are using this service on behalf of an organization, you represent that you have authority to bind that entity.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                2. User Responsibilities
              </h2>
              <p>
                You are responsible for safeguarding your login credentials and ensuring all financial records uploaded to the service comply with applicable laws and confidentiality obligations.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                3. Service Availability
              </h2>
              <p>
                Client360 provides profitability calculations on an as-is basis for analytical and diagnostic planning purposes. We strive for 99.9% platform uptime.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                4. Termination
              </h2>
              <p>
                You may discontinue use of the platform at any time and delete your workspace data through your account dashboard.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
