import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED" | "SGD" | "CAD" | "AUD" | "JPY";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: "INR", symbol: "₹", label: "INR (₹) - Indian Rupee", locale: "en-IN" },
  USD: { code: "USD", symbol: "$", label: "USD ($) - US Dollar", locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€) - Euro", locale: "de-DE" },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£) - British Pound", locale: "en-GB" },
  AED: { code: "AED", symbol: "د.إ", label: "AED (د.إ) - UAE Dirham", locale: "en-AE" },
  SGD: { code: "SGD", symbol: "S$", label: "SGD (S$) - Singapore Dollar", locale: "en-SG" },
  CAD: { code: "CAD", symbol: "C$", label: "CAD (C$) - Canadian Dollar", locale: "en-CA" },
  AUD: { code: "AUD", symbol: "A$", label: "AUD (A$) - Australian Dollar", locale: "en-AU" },
  JPY: { code: "JPY", symbol: "¥", label: "JPY (¥) - Japanese Yen", locale: "ja-JP" },
};

// Global active currency (Default: INR)
let activeGlobalCurrency: CurrencyCode = "INR";

export function setGlobalCurrency(code: CurrencyCode) {
  if (CURRENCIES[code]) {
    activeGlobalCurrency = code;
  }
}

export function getGlobalCurrency(): CurrencyCode {
  return activeGlobalCurrency;
}

export function getCurrencySymbol(code?: CurrencyCode): string {
  const curr = CURRENCIES[code || activeGlobalCurrency] || CURRENCIES.INR;
  return curr.symbol;
}

export function formatCurrency(
  amount: number | null | undefined,
  compact = false,
  currencyCode?: CurrencyCode
): string {
  const curr = CURRENCIES[currencyCode || activeGlobalCurrency] || CURRENCIES.INR;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${curr.symbol}0.00`;
  }

  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (compact) {
    if (curr.code === "INR") {
      if (absAmount >= 10_000_000) {
        return `${sign}${curr.symbol}${(absAmount / 10_000_000).toFixed(1)}Cr`;
      }
      if (absAmount >= 100_000) {
        return `${sign}${curr.symbol}${(absAmount / 100_000).toFixed(1)}L`;
      }
      if (absAmount >= 1_000) {
        return `${sign}${curr.symbol}${(absAmount / 1_000).toFixed(1)}k`;
      }
      return `${sign}${curr.symbol}${absAmount.toFixed(0)}`;
    } else {
      if (absAmount >= 1_000_000) {
        return `${sign}${curr.symbol}${(absAmount / 1_000_000).toFixed(1)}M`;
      }
      if (absAmount >= 1_000) {
        return `${sign}${curr.symbol}${(absAmount / 1_000).toFixed(1)}k`;
      }
      return `${sign}${curr.symbol}${absAmount.toFixed(0)}`;
    }
  }

  return new Intl.NumberFormat(curr.locale, {
    style: "currency",
    currency: curr.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatDelta(value: number | null | undefined): { text: string; isPositive: boolean; isNeutral: boolean } {
  if (value === null || value === undefined || isNaN(value)) {
    return { text: "0.0%", isPositive: true, isNeutral: true };
  }
  const isPositive = value >= 0;
  const isNeutral = Math.abs(value) < 0.01;
  const sign = value > 0 ? "+" : "";
  return {
    text: `${sign}${value.toFixed(1)}%`,
    isPositive,
    isNeutral,
  };
}

export type ClassificationType = "profitable" | "low_margin" | "loss_making" | "no_revenue";

export function getClassificationConfig(classification: string | null | undefined) {
  switch (classification) {
    case "profitable":
      return {
        label: "Profitable",
        badgeClass: "bg-[#ffffff] text-[#272727] border border-[#e0e0e0] rounded-[100px] font-mono text-[11px] uppercase tracking-[0.22px]",
        dotClass: "bg-[#7451f2]",
        color: "#7451f2",
      };
    case "low_margin":
      return {
        label: "Low-Margin",
        badgeClass: "bg-[#ffffff] text-[#272727] border border-[#e0e0e0] rounded-[100px] font-mono text-[11px] uppercase tracking-[0.22px]",
        dotClass: "bg-[#f59e0b]",
        color: "#f59e0b",
      };
    case "loss_making":
      return {
        label: "Loss-Making",
        badgeClass: "bg-[#ffffff] text-[#272727] border border-[#e0e0e0] rounded-[100px] font-mono text-[11px] uppercase tracking-[0.22px]",
        dotClass: "bg-[#e11d48]",
        color: "#e11d48",
      };
    default:
      return {
        label: "No Revenue",
        badgeClass: "bg-[#ffffff] text-[#858585] border border-[#e0e0e0] rounded-[100px] font-mono text-[11px] uppercase tracking-[0.22px]",
        dotClass: "bg-[#858585]",
        color: "#858585",
      };
  }
}

