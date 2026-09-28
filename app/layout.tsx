import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/toast-context";
import { AuthProvider } from "@/lib/auth-context";
import { PeriodProvider } from "@/lib/period-context";

const inter = Inter({
  variable: "--font-output-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://client360-ten.vercel.app"),
  title: {
    default: "Client360 — B2B Client Profitability Analytics",
    template: "%s | Client360",
  },
  description: "B2B client profitability analytics. Tabular clarity on gross margins, cost attribution, and account performance.",
  openGraph: {
    title: "Client360 — B2B Client Profitability Analytics",
    description: "B2B client profitability analytics. Tabular clarity on gross margins, cost attribution, and account performance.",
    url: "https://client360-ten.vercel.app",
    siteName: "Client360",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Client360 — B2B Client Profitability Analytics",
    description: "B2B client profitability analytics. Tabular clarity on gross margins, cost attribution, and account performance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#ffffff] text-[#1a1a1a] font-sans selection:bg-[#fff6d4] selection:text-[#1a1a1a]">
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
