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
        badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
        dotClass: "bg-emerald-400",
        color: "#10b981",
      };
    case "low_margin":
      return {
        label: "Low-Margin",
        badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/25",
        dotClass: "bg-amber-400",
        color: "#f59e0b",
      };
    case "loss_making":
      return {
        label: "Loss-Making",
        badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/25",
        dotClass: "bg-rose-400",
        color: "#f43f5e",
      };
    default:
      return {
        label: "No Revenue",
        badgeClass: "bg-zinc-500/10 text-zinc-400 border-zinc-500/25",
        dotClass: "bg-zinc-400",
        color: "#71717a",
      };
  }
}
