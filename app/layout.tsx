import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/lib/toast-context";
import { AuthProvider } from "@/lib/auth-context";
import { PeriodProvider } from "@/lib/period-context";

const bebasNeue = Bebas_Neue({
  variable: "--font-salmond",
  subsets: ["latin"],
  weight: ["400"],
});

const inter = Inter({
  variable: "--font-graphikx",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://client360-ten.vercel.app"),
  title: {
    default: "Client360 — B2B Client Profitability Analytics",
    template: "%s | Client360",
  },
  description: "Maximalist B2B client profitability analytics. Know which accounts drive margin and which quietly drain profits.",
  openGraph: {
    title: "Client360 — B2B Client Profitability Analytics",
    description: "Maximalist B2B client profitability analytics. Know which accounts drive margin and which quietly drain profits.",
    url: "https://client360-ten.vercel.app",
    siteName: "Client360",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Client360 — B2B Client Profitability Analytics",
    description: "Maximalist B2B client profitability analytics. Know which accounts drive margin and which quietly drain profits.",
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
      className={`${bebasNeue.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#823513] text-[#faae33] font-sans selection:bg-[#faae33] selection:text-[#281006]">
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
