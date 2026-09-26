import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/toast-context";
import { AuthProvider } from "@/lib/auth-context";
import { PeriodProvider } from "@/lib/period-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProfitLens — Client Profitability Analytics Platform",
  description: "B2B SaaS single source of truth for client-level profitability, margins, and cost accounting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#090a0f] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        <AuthProvider>
          <PeriodProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </PeriodProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
