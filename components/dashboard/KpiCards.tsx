import React from "react";
import { formatCurrency } from "@/lib/utils";
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
        <span className="text-xs text-[#838383] font-normal tabular-nums">
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
        className={`text-xs font-normal tabular-nums ${
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
      value: formatCurrency(data.totalRevenue, true),
      delta: renderDelta(data.revenueDelta),
      subtext: "vs prior",
      dot: "#34d399", // Mint
    },
    {
      title: "TOTAL COSTS",
      value: formatCurrency(data.totalCost, true),
      delta: renderDelta(data.costDelta, true),
      subtext: "vs prior",
      dot: "#fbbf24", // Amber
    },
    {
      title: "GROSS PROFIT",
      value: formatCurrency(data.grossProfit, true),
      delta: renderDelta(data.profitDelta),
      subtext: "operating margin",
      dot: data.grossProfit >= 0 ? "#34d399" : "#f472b6",
    },
    {
      title: "OVERALL MARGIN",
      value: data.marginPercent !== null ? `${data.marginPercent.toFixed(1)}%` : "—",
      delta: renderDelta(data.marginDelta, false, true),
      subtext: "target ≥ 20%",
      dot:
        data.marginPercent !== null && data.marginPercent >= 20
          ? "#34d399"
          : data.marginPercent !== null && data.marginPercent >= 5
          ? "#fbbf24"
          : "#f472b6",
    },
    {
      title: "ACTIVE CLIENTS",
      value: data.activeClientsCount.toString(),
      delta: (
        <span className="text-xs text-[#6f6f6f] tabular-nums">
          {data.activeClientsDelta >= 0 ? `+${data.activeClientsDelta}` : data.activeClientsDelta}
        </span>
      ),
      subtext: "billed accounts",
      dot: "#38bdf8", // Sky blue
    },
    {
      title: "LOSS-MAKING ACCOUNTS",
      value: data.lossMakingCount.toString(),
      delta: (
        <span
          className={`text-xs tabular-nums ${
            data.lossMakingCount > 0 ? "text-[#e11d48] font-bold" : "text-[#6f6f6f]"
          }`}
        >
          {data.lossMakingCount > 0
            ? `-${formatCurrency(data.lossMakingAmount, true)}`
            : "0 drain"}
        </span>
      ),
      subtext: data.lossMakingCount > 0 ? "drain accounts" : "healthy",
      dot: data.lossMakingCount > 0 ? "#e11d48" : "#34d399",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c, i) => (
        <div
          key={i}
          className="p-4 rounded-[8px] bg-white border border-[#eaeaea] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-rows-caption truncate">
              {c.title}
            </span>
            <span
              className="w-[6px] h-[6px] rounded-full shrink-0"
              style={{ backgroundColor: c.dot }}
            />
          </div>

          <div className="space-y-1">
            <div className="text-xl font-bold tracking-tight text-[#1a1a1a] tabular-nums">
              {c.value}
            </div>
            <div className="flex items-center justify-between gap-1 pt-1 text-xs">
              <div>{c.delta}</div>
              <span className="text-[#838383] text-[10px] truncate">{c.subtext}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
