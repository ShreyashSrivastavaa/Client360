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
        <span className="inline-flex items-center text-xs text-[#faae33]/60 font-medium">
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
          isGood ? "text-[#faae33]" : "text-[#d1255c]"
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
      title: "TOTAL REVENUE",
      value: formatCurrency(data.totalRevenue, true),
      delta: renderDelta(data.revenueDelta),
      subtext: "vs prior period",
      icon: DollarSign,
      color: "text-[#faae33]",
      bgColor: "bg-[#281006]",
      borderColor: "border-[#6b2e12]",
    },
    {
      title: "TOTAL COSTS",
      value: formatCurrency(data.totalCost, true),
      delta: renderDelta(data.costDelta, true),
      subtext: "vs prior period",
      icon: TrendingDown,
      color: "text-[#9f531b]",
      bgColor: "bg-[#281006]",
      borderColor: "border-[#6b2e12]",
    },
    {
      title: "GROSS PROFIT",
      value: formatCurrency(data.grossProfit, true),
      delta: renderDelta(data.profitDelta),
      subtext: "net operating margin",
      icon: TrendingUp,
      color: data.grossProfit >= 0 ? "text-[#faae33]" : "text-[#d1255c]",
      bgColor: "bg-[#281006]",
      borderColor: "border-[#6b2e12]",
    },
    {
      title: "OVERALL MARGIN %",
      value: data.marginPercent !== null ? `${data.marginPercent.toFixed(1)}%` : "—",
      delta: renderDelta(data.marginDelta, false, true),
      subtext: "target ≥ 20.0%",
      icon: Percent,
      color:
        data.marginPercent !== null && data.marginPercent >= 20
          ? "text-[#faae33]"
          : data.marginPercent !== null && data.marginPercent >= 5
          ? "text-[#9f531b]"
          : "text-[#d1255c]",
      bgColor: "bg-[#281006]",
      borderColor: "border-[#6b2e12]",
    },
    {
      title: "ACTIVE CLIENTS",
      value: data.activeClientsCount.toString(),
      delta: (
        <span className="text-xs text-[#faae33]/70 font-medium">
          {data.activeClientsDelta >= 0 ? `+${data.activeClientsDelta}` : data.activeClientsDelta} accounts
        </span>
      ),
      subtext: "billed in period",
      icon: Users,
      color: "text-[#faae33]",
      bgColor: "bg-[#281006]",
      borderColor: "border-[#6b2e12]",
    },
    {
      title: "LOSS-MAKING CLIENTS",
      value: data.lossMakingCount.toString(),
      delta: (
        <span
          className={`text-xs font-bold ${
            data.lossMakingCount > 0 ? "text-[#d1255c]" : "text-[#faae33]"
          }`}
        >
          {data.lossMakingCount > 0
            ? `-${formatCurrency(data.lossMakingAmount, true)} drain`
            : "0 loss accounts"}
        </span>
      ),
      subtext: data.lossMakingCount > 0 ? "requires immediate action" : "healthy margin portfolio",
      icon: AlertTriangle,
      color: data.lossMakingCount > 0 ? "text-[#d1255c]" : "text-[#faae33]",
      bgColor: data.lossMakingCount > 0 ? "bg-[#d1255c]/20" : "bg-[#281006]",
      borderColor: data.lossMakingCount > 0 ? "border-[#d1255c]" : "border-[#6b2e12]",
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
            className={`p-4 rounded-[6px] bg-[#402011] border ${c.borderColor} flex flex-col justify-between transition-all ${
              c.highlight ? "bg-[#281006]" : ""
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-salmond font-medium text-[#faae33]/80 tracking-wider truncate">
                {c.title}
              </span>
              <div className={`p-1.5 rounded-full ${c.bgColor} ${c.color} shrink-0 border border-[#6b2e12]`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-salmond font-bold tracking-tight text-[#faae33] tabular-nums">
                {c.value}
              </div>
              <div className="flex items-center justify-between gap-1 pt-0.5">
                <div>{c.delta}</div>
                <span className="text-[10px] text-[#faae33]/60 truncate font-graphikx">{c.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
