import React from "react";
import { formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/currency-context";
import { CardSkeleton } from "@/components/ui/Skeleton";

export interface DashboardSummaryData {
  range: string;
  totalRevenue: number;
  revenueDelta: number;
  totalCost: number;
  costDelta: number;
  grossProfit: number;
  profitDelta: number;
  marginPercent: number | null;
  marginDelta: number;
  activeClientsCount: number;
  activeClientsDelta: number;
  lossMakingCount: number;
  lossMakingAmount: number;
  lossMakingDelta: number;
  distribution: {
    profitable: number;
    lowMargin: number;
    lossMaking: number;
    total: number;
  };
}

interface KpiCardsProps {
  data: DashboardSummaryData | null;
  isLoading: boolean;
}

export function KpiCards({ data, isLoading }: KpiCardsProps) {
  const { formatAmount } = useCurrency();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const renderDelta = (delta: number, inverse = false, isPercentPoints = false) => {
    if (delta === 0) {
      return (
        <span className="text-xs text-[#858585] font-normal tabular-nums font-mono">
          0.0%
        </span>
      );
    }

    const isPositive = delta > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const sign = isPositive ? "+" : "";
    const suffix = isPercentPoints ? " pts" : "%";

    return (
      <span
        className={`text-xs font-medium tabular-nums font-mono ${
          isGood ? "text-[#16a34a]" : "text-[#e11d48]"
        }`}
      >
        {sign}
        {delta.toFixed(1)}
        {suffix}
      </span>
    );
  };

  const cards = [
    {
      title: "TOTAL REVENUE",
      value: formatAmount(data.totalRevenue, true),
      delta: renderDelta(data.revenueDelta),
      subtext: "vs prior",
      dot: "#7451f2", // Iris Violet
    },
    {
      title: "TOTAL COSTS",
      value: formatAmount(data.totalCost, true),
      delta: renderDelta(data.costDelta, true),
      subtext: "vs prior",
      dot: "#5952a1", // Deep Iris
    },
    {
      title: "GROSS PROFIT",
      value: formatAmount(data.grossProfit, true),
      delta: renderDelta(data.profitDelta),
      subtext: "operating margin",
      dot: data.grossProfit >= 0 ? "#7451f2" : "#e11d48",
    },
    {
      title: "OVERALL MARGIN",
      value: data.marginPercent !== null ? `${data.marginPercent.toFixed(1)}%` : "—",
      delta: renderDelta(data.marginDelta, false, true),
      subtext: "target ≥ 20%",
      dot:
        data.marginPercent !== null && data.marginPercent >= 20
          ? "#7451f2"
          : data.marginPercent !== null && data.marginPercent >= 5
          ? "#f59e0b"
          : "#e11d48",
    },
    {
      title: "ACTIVE CLIENTS",
      value: data.activeClientsCount.toString(),
      delta: (
        <span className="text-xs text-[#5d5d5d] font-mono tabular-nums">
          {data.activeClientsDelta >= 0 ? `+${data.activeClientsDelta}` : data.activeClientsDelta}
        </span>
      ),
      subtext: "billed accounts",
      dot: "#0072c6", // Cobalt Info
    },
    {
      title: "LOSS-MAKING ACCOUNTS",
      value: data.lossMakingCount.toString(),
      delta: (
        <span
          className={`text-xs tabular-nums font-mono ${
            data.lossMakingCount > 0 ? "text-[#e11d48] font-semibold" : "text-[#5d5d5d]"
          }`}
        >
          {data.lossMakingCount > 0
            ? `-${formatAmount(data.lossMakingAmount, true)}`
            : "0 drain"}
        </span>
      ),
      subtext: data.lossMakingCount > 0 ? "drain accounts" : "healthy",
      dot: data.lossMakingCount > 0 ? "#e11d48" : "#7451f2",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="p-4 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between hover:border-[#858585] transition-colors"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] truncate">
              {c.title}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: c.dot }}
            />
          </div>

          <div className="space-y-1">
            <div className="text-2xl font-bold tracking-tight text-[#272727] tabular-nums">
              {c.value}
            </div>
            <div className="flex items-center justify-between gap-1 pt-1 text-xs">
              <div>{c.delta}</div>
              <span className="text-[#858585] text-[10px] truncate">{c.subtext}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
