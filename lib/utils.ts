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
        badgeClass: "bg-[#ffffff] text-[#1a1a1a] border border-[#eaeaea] rounded-[4px]",
        dotClass: "bg-[#10b981]",
        color: "#10b981",
      };
    case "low_margin":
      return {
        label: "Low-Margin",
        badgeClass: "bg-[#ffffff] text-[#1a1a1a] border border-[#eaeaea] rounded-[4px]",
        dotClass: "bg-[#ffb84d]",
        color: "#ffb84d",
      };
    case "loss_making":
      return {
        label: "Loss-Making",
        badgeClass: "bg-[#ffffff] text-[#1a1a1a] border border-[#eaeaea] rounded-[4px]",
        dotClass: "bg-[#e11d48]",
        color: "#e11d48",
      };
    default:
      return {
        label: "No Revenue",
        badgeClass: "bg-[#ffffff] text-[#6f6f6f] border border-[#eaeaea] rounded-[4px]",
        dotClass: "bg-[#838383]",
        color: "#838383",
      };
  }
}
