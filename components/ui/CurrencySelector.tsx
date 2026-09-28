"use client";

import React, { useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { CurrencyCode } from "@/lib/utils";

export function CurrencySelector({ className = "" }: { className?: string }) {
  const { currency, setCurrency, supportedCurrencies, currencyConfig } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff] hover:border-[#272727] text-xs text-[#272727] transition-all font-mono shadow-sm"
        title="Select Global Display Currency (Default: INR)"
      >
        <span className="font-bold text-[#7451f2]">{currencyConfig.symbol}</span>
        <span className="font-medium text-[11px] uppercase tracking-[0.22px]">{currency}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#858585]" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-48 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] py-1 z-50 shadow-sm max-h-60 overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.22px] text-[#858585] border-b border-[#e0e0e0] flex items-center justify-between">
              <span>Display Currency</span>
              <span className="text-[9px] text-[#7451f2]">DEFAULT: INR</span>
            </div>
            {supportedCurrencies.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  setCurrency(c.code as CurrencyCode);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                  currency === c.code
                    ? "bg-[#f6f6f6] text-[#7451f2] font-semibold"
                    : "text-[#5d5d5d] hover:bg-[#f6f6f6] hover:text-[#272727]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold w-4 text-center">{c.symbol}</span>
                  <span className="font-sans text-xs">{c.code}</span>
                </div>
                {currency === c.code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7451f2]" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
