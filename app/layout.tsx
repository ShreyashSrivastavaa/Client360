import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/toast-context";
import { AuthProvider } from "@/lib/auth-context";
import { PeriodProvider } from "@/lib/period-context";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ProfitLens — Client Profitability Analytics Platform",
  description: "Zesty client profitability analytics. Know which clients make you money and which quietly drain profits.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7f7f8] text-[#121217] font-sans selection:bg-[#ffc233] selection:text-[#121217]">
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
