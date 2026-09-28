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
        badgeClass: "bg-[#faae33] text-[#281006] border-[#faae33] font-bold",
        dotClass: "bg-[#281006]",
        color: "#faae33",
      };
    case "low_margin":
      return {
        label: "Low-Margin",
        badgeClass: "bg-[#9f531b]/30 text-[#faae33] border-[#9f531b]",
        dotClass: "bg-[#9f531b]",
        color: "#9f531b",
      };
    case "loss_making":
      return {
        label: "Loss-Making",
        badgeClass: "bg-[#d1255c] text-white border-[#d1255c] font-bold",
        dotClass: "bg-white",
        color: "#d1255c",
      };
    default:
      return {
        label: "No Revenue",
        badgeClass: "bg-[#402011] text-[#faae33]/70 border-[#6b2e12]",
        dotClass: "bg-[#6b2e12]",
        color: "#6b2e12",
      };
  }
}
