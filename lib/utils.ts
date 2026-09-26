import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined, compact = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";
  
  if (compact && Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 10_000) {
    return `$${(amount / 1_000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
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
        badgeClass: "bg-[#1e874c]/10 text-[#1e874c] border-[#1e874c]/25",
        dotClass: "bg-[#1e874c]",
        color: "#1e874c",
      };
    case "low_margin":
      return {
        label: "Low-Margin",
        badgeClass: "bg-[#ffc233]/20 text-[#996500] border-[#ffc233]/40",
        dotClass: "bg-[#ffc233]",
        color: "#ffc233",
      };
    case "loss_making":
      return {
        label: "Loss-Making",
        badgeClass: "bg-[#d50b3e]/10 text-[#d50b3e] border-[#d50b3e]/25",
        dotClass: "bg-[#d50b3e]",
        color: "#d50b3e",
      };
    default:
      return {
        label: "No Revenue",
        badgeClass: "bg-[#6c6c89]/10 text-[#6c6c89] border-[#6c6c89]/25",
        dotClass: "bg-[#6c6c89]",
        color: "#6c6c89",
      };
  }
}
