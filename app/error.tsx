"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#823513] text-[#faae33] flex items-center justify-center p-6 selection:bg-[#faae33] selection:text-[#281006]">
      <div className="tiger-card max-w-lg w-full text-center space-y-6 p-8 border border-[#6b2e12] bg-[#402011] rounded-[6px]">
        <div className="w-16 h-16 rounded-full bg-[#281006] border border-[#d1255c] text-[#d1255c] flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-salmond tracking-[2px] text-[#d1255c] uppercase block">
            UNEXPECTED RUNTIME ERROR
          </span>
          <h1 className="text-3xl font-salmond font-bold text-[#faae33] uppercase">
            SOMETHING WENT WRONG
          </h1>
          <p className="text-xs font-graphikx text-[#faae33]/70 leading-relaxed">
            An unexpected error occurred while processing this page. The system is designed to keep your data safe.
          </p>
          {error?.message && (
            <div className="p-3 bg-[#281006] rounded-[6px] border border-[#6b2e12] text-left overflow-x-auto text-[11px] font-mono text-[#faae33]/60 max-h-28">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary-filled flex items-center gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>TRY AGAIN</span>
          </button>
          <Link
            href="/dashboard"
            className="btn-ghost-outline flex items-center gap-2 text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>DASHBOARD</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
