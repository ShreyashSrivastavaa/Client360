import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
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
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-salmond font-bold text-[#faae33] uppercase">
                PRIVACY POLICY
              </h1>
              <p className="text-xs text-[#faae33]/60 font-graphikx">Effective Date: September 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs font-graphikx text-[#faae33]/90 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                1. Information We Collect
              </h2>
              <p>
                Client360 collects account credentials (name, email, password hash) and transaction datasets uploaded by authenticated users (CSV files including client names, dates, amounts, and transaction classifications).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                2. How We Use Your Data
              </h2>
              <p>
                Uploaded data is solely used to calculate client profitability metrics, generate gross margins, produce financial trend charts, and compute diagnostic insights within your isolated organization workspace. We do not sell, rent, or monetize your company’s ledger information.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                3. Tenant Isolation & Storage
              </h2>
              <p>
                All workspace data is strictly scoped by multi-tenant identifiers in our cloud libSQL database. Passwords are cryptographically salted and hashed using bcrypt. Access tokens are stored in secure, HTTP-only session cookies.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-salmond font-bold text-[#faae33] uppercase tracking-wider">
                4. Data Deletion
              </h2>
              <p>
                You may delete individual batch uploads, delete client records, or delete your entire workspace data at any time from the settings and uploads views.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
