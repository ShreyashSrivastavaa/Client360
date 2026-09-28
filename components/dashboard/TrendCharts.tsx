"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ChartSkeleton } from "@/components/ui/Skeleton";

export interface MonthlyTrendData {
  monthKey: string;
  label: string;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface TrendChartsProps {
  trends: MonthlyTrendData[];
  distribution: {
    profitable: number;
    lowMargin: number;
    lossMaking: number;
    total: number;
  } | null;
  isLoading: boolean;
}

interface TooltipPayloadItem {
  payload?: any;
  name?: string;
  value?: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

function CustomBarTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data) return null;
    return (
      <div className="bg-white p-3 rounded-[4px] border border-[#eaeaea] text-xs space-y-1.5 min-w-[160px] text-[#1a1a1a]">
        <div className="font-bold text-[#1a1a1a] border-b border-[#eaeaea] pb-1">
          {data.label}
        </div>
        <div className="flex justify-between items-center text-[#6f6f6f]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" /> Revenue:
          </span>
          <span className="font-medium text-[#1a1a1a] tabular-nums">
            {formatCurrency(data.revenue)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#6f6f6f]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#989898]" /> Cost:
          </span>
          <span className="font-medium text-[#1a1a1a] tabular-nums">
            {formatCurrency(data.cost)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[#eaeaea]">
          <span className="font-bold">
            Profit:
          </span>
          <span
            className={`font-bold tabular-nums ${
              data.profit >= 0 ? "text-[#16a34a]" : "text-[#e11d48]"
            }`}
          >
            {formatCurrency(data.profit)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-[#838383]">
          <span>Margin:</span>
          <span className="tabular-nums font-medium text-[#1a1a1a]">
            {formatPercent(data.margin)}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

function CustomPieTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white px-2.5 py-1 rounded-[4px] border border-[#eaeaea] text-xs font-normal text-[#1a1a1a]">
        {data.name}: <span className="font-bold tabular-nums">{data.value}</span> clients
      </div>
    );
  }
  return null;
}

export function TrendCharts({ trends, distribution, isLoading }: TrendChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading || !mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  // Distribution Donut Data using Rows category dots
  const pieData = [
    {
      name: "Profitable (≥20%)",
      value: distribution?.profitable || 0,
      color: "#34d399", // Mint
    },
    {
      name: "Low-Margin (5-20%)",
      value: distribution?.lowMargin || 0,
      color: "#fbbf24", // Amber
    },
    {
      name: "Loss-Making (<5%)",
      value: distribution?.lossMaking || 0,
      color: "#f472b6", // Soft pink
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Revenue vs Cost */}
      <div className="lg:col-span-2 p-6 rounded-[8px] bg-white border border-[#eaeaea] flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1a1a1a]">
              Revenue & Cost Trends
            </h3>
            <p className="text-xs text-[#838383]">Monthly ledger volume across active accounts</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#6f6f6f]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[1px] bg-[#1a1a1a]" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-[1px] bg-[#e1e1e1]" /> Cost
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#838383]">
              No trend data available for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eaeaea" />
                <XAxis
                  dataKey="label"
                  stroke="#838383"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#eaeaea" }}
                />
                <YAxis
                  stroke="#838383"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#1a1a1a" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="cost" name="Cost" fill="#e1e1e1" radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Client Distribution Donut */}
      <div className="p-6 rounded-[8px] bg-white border border-[#eaeaea] flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#1a1a1a]">
            Portfolio Health
          </h3>
          <p className="text-xs text-[#838383]">Margin classification of active clients</p>
        </div>

        <div className="h-[200px] w-full flex items-center justify-center my-2">
          {pieData.length === 0 ? (
            <div className="text-xs text-[#838383]">
              No client distribution data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-2 pt-3 border-t border-[#eaeaea]">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#6f6f6f]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#34d399]" /> Profitable (≥20%)
            </span>
            <span className="font-bold text-[#1a1a1a] tabular-nums">
              {distribution?.profitable || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#6f6f6f]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#fbbf24]" /> Low-Margin (5-20%)
            </span>
            <span className="font-bold text-[#1a1a1a] tabular-nums">
              {distribution?.lowMargin || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#6f6f6f]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#f472b6]" /> Loss-Making (&lt;5%)
            </span>
            <span className="font-bold text-[#e11d48] tabular-nums">
              {distribution?.lossMaking || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
