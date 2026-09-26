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
        <span className="inline-flex items-center text-xs text-zinc-400 font-medium">
          <Minus className="w-3 h-3 mr-0.5" /> 0.0%
        </span>
      );
    }

    const isPositive = delta > 0;
    // For costs, higher is worse (unless inverse is true)
    const isGood = inverse ? !isPositive : isPositive;

    const sign = isPositive ? "+" : "";
    const suffix = isPercentPoints ? " pts" : "%";

    return (
      <span
        className={`inline-flex items-center text-xs font-semibold ${
          isGood ? "text-emerald-400" : "text-rose-400"
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
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-zinc-800/80",
    },
    {
      title: "Total Costs",
      value: formatCurrency(data.totalCost, true),
      delta: renderDelta(data.costDelta, true),
      subtext: "vs prior period",
      icon: TrendingDown,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-zinc-800/80",
    },
    {
      title: "Gross Profit",
      value: formatCurrency(data.grossProfit, true),
      delta: renderDelta(data.profitDelta),
      subtext: "net operating margin",
      icon: TrendingUp,
      color: data.grossProfit >= 0 ? "text-emerald-400" : "text-rose-400",
      bgColor: data.grossProfit >= 0 ? "bg-emerald-500/10" : "bg-rose-500/10",
      borderColor: "border-zinc-800/80",
    },
    {
      title: "Overall Margin %",
      value: data.marginPercent !== null ? `${data.marginPercent.toFixed(1)}%` : "—",
      delta: renderDelta(data.marginDelta, false, true),
      subtext: "target ≥ 20.0%",
      icon: Percent,
      color:
        data.marginPercent !== null && data.marginPercent >= 20
          ? "text-emerald-400"
          : data.marginPercent !== null && data.marginPercent >= 5
          ? "text-amber-400"
          : "text-rose-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-zinc-800/80",
    },
    {
      title: "Active Clients",
      value: data.activeClientsCount.toString(),
      delta: (
        <span className="text-xs text-zinc-400">
          {data.activeClientsDelta >= 0 ? `+${data.activeClientsDelta}` : data.activeClientsDelta} accounts
        </span>
      ),
      subtext: "billed in period",
      icon: Users,
      color: "text-sky-400",
      bgColor: "bg-sky-500/10",
      borderColor: "border-zinc-800/80",
    },
    {
      title: "Loss-Making Clients",
      value: data.lossMakingCount.toString(),
      delta: (
        <span
          className={`text-xs font-semibold ${
            data.lossMakingCount > 0 ? "text-rose-400" : "text-emerald-400"
          }`}
        >
          {data.lossMakingCount > 0
            ? `-${formatCurrency(data.lossMakingAmount, true)} drain`
            : "0 loss accounts"}
        </span>
      ),
      subtext: data.lossMakingCount > 0 ? "requires immediate action" : "healthy margin portfolio",
      icon: AlertTriangle,
      color: data.lossMakingCount > 0 ? "text-rose-400" : "text-emerald-400",
      bgColor: data.lossMakingCount > 0 ? "bg-rose-500/15" : "bg-emerald-500/10",
      borderColor: data.lossMakingCount > 0 ? "border-rose-500/40" : "border-zinc-800/80",
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
            className={`glass-panel p-4 rounded-xl border ${c.borderColor} flex flex-col justify-between transition-all hover:border-zinc-700 ${
              c.highlight ? "bg-rose-950/20 shadow-lg shadow-rose-950/20" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-zinc-400 truncate">{c.title}</span>
              <div className={`p-1.5 rounded-lg ${c.bgColor} ${c.color} shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xl font-bold tracking-tight text-white tabular-nums">
                {c.value}
              </div>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <div>{c.delta}</div>
                <span className="text-[10px] text-zinc-400 truncate">{c.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
