"use client";

import React, { createContext, useContext, useState } from "react";

export type PeriodKey = "12m" | "30d" | "quarter" | "ytd" | "all" | "custom";

interface PeriodContextType {
  period: PeriodKey;
  setPeriod: (p: PeriodKey) => void;
  customStart?: string;
  setCustomStart: (s: string) => void;
  customEnd?: string;
  setCustomEnd: (e: string) => void;
  periodLabel: string;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "12m", label: "Last 12 Months" },
  { key: "quarter", label: "Last Quarter" },
  { key: "30d", label: "Last 30 Days" },
  { key: "ytd", label: "This Year" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom Range" },
];

export function PeriodProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<PeriodKey>("12m");
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  const activeOption = PERIOD_OPTIONS.find((o) => o.key === period);
  const periodLabel = activeOption ? activeOption.label : "Last 12 Months";

  return (
    <PeriodContext.Provider
      value={{
        period,
        setPeriod,
        customStart,
        setCustomStart,
        customEnd,
        setCustomEnd,
        periodLabel,
      }}
    >
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (!context) {
    throw new Error("usePeriod must be used within a PeriodProvider");
  }
  return context;
}
