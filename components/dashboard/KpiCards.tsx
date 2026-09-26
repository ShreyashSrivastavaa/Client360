import React from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Percent,
} from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const renderDelta = (delta: number, inverse = false, isPercentPoints = false) => {
    if (delta === 0) {
      return (
        <span className="inline-flex items-center text-xs text-[#6c6c89] font-medium">
          <Minus className="w-3 h-3 mr-0.5" /> 0.0%
        </span>
      );
    }

    const isPositive = delta > 0;
    const isGood = inverse ? !isPositive : isPositive;
    const sign = isPositive ? "+" : "";
    const suffix = isPercentPoints ? " pts" : "%";

    return (
      <span
        className={`inline-flex items-center text-xs font-bold ${
          isGood ? "text-[#1e874c]" : "text-[#d50b3e]"
        }`}
      >
        {isPositive ? (
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
        )}
        {sign}
        {delta.toFixed(1)}
        {suffix}
      </span>
    );
  };

  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenue, true),
      delta: renderDelta(data.revenueDelta),
      subtext: "vs prior period",
      icon: DollarSign,
      color: "text-[#5423e7]",
      bgColor: "bg-[#5423e7]/10",
      borderColor: "border-[#d1d1db]",
    },
    {
      title: "Total Costs",
      value: formatCurrency(data.totalCost, true),
      delta: renderDelta(data.costDelta, true),
      subtext: "vs prior period",
      icon: TrendingDown,
      color: "text-[#6c6c89]",
      bgColor: "bg-[#6c6c89]/10",
      borderColor: "border-[#d1d1db]",
    },
    {
      title: "Gross Profit",
      value: formatCurrency(data.grossProfit, true),
      delta: renderDelta(data.profitDelta),
      subtext: "net operating margin",
      icon: TrendingUp,
      color: data.grossProfit >= 0 ? "text-[#1e874c]" : "text-[#d50b3e]",
      bgColor: data.grossProfit >= 0 ? "bg-[#1e874c]/10" : "bg-[#d50b3e]/10",
      borderColor: "border-[#d1d1db]",
    },
    {
      title: "Overall Margin %",
      value: data.marginPercent !== null ? `${data.marginPercent.toFixed(1)}%` : "—",
      delta: renderDelta(data.marginDelta, false, true),
      subtext: "target ≥ 20.0%",
      icon: Percent,
      color:
        data.marginPercent !== null && data.marginPercent >= 20
          ? "text-[#1e874c]"
          : data.marginPercent !== null && data.marginPercent >= 5
          ? "text-[#996500]"
          : "text-[#d50b3e]",
      bgColor: "bg-[#5423e7]/10",
      borderColor: "border-[#d1d1db]",
    },
    {
      title: "Active Clients",
      value: data.activeClientsCount.toString(),
      delta: (
        <span className="text-xs text-[#6c6c89] font-medium">
          {data.activeClientsDelta >= 0 ? `+${data.activeClientsDelta}` : data.activeClientsDelta} accounts
        </span>
      ),
      subtext: "billed in period",
      icon: Users,
      color: "text-[#0075ad]",
      bgColor: "bg-[#0075ad]/10",
      borderColor: "border-[#d1d1db]",
    },
    {
      title: "Loss-Making Clients",
      value: data.lossMakingCount.toString(),
      delta: (
        <span
          className={`text-xs font-bold ${
            data.lossMakingCount > 0 ? "text-[#d50b3e]" : "text-[#1e874c]"
          }`}
        >
          {data.lossMakingCount > 0
            ? `-${formatCurrency(data.lossMakingAmount, true)} drain`
            : "0 loss accounts"}
        </span>
      ),
      subtext: data.lossMakingCount > 0 ? "requires immediate action" : "healthy margin portfolio",
      icon: AlertTriangle,
      color: data.lossMakingCount > 0 ? "text-[#d50b3e]" : "text-[#1e874c]",
      bgColor: data.lossMakingCount > 0 ? "bg-[#d50b3e]/15" : "bg-[#1e874c]/10",
      borderColor: data.lossMakingCount > 0 ? "border-[#d50b3e]/40" : "border-[#d1d1db]",
      highlight: data.lossMakingCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-5 rounded-[24px] bg-white border ${c.borderColor} shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
              c.highlight ? "bg-[#d50b3e]/5" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-[#6c6c89] truncate">{c.title}</span>
              <div className={`p-1.5 rounded-lg ${c.bgColor} ${c.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-2xl font-display font-bold tracking-tight text-[#121217] tabular-nums">
                {c.value}
              </div>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <div>{c.delta}</div>
                <span className="text-[10px] text-[#6c6c89] truncate">{c.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
