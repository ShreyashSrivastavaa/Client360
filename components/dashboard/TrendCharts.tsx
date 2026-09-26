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
  Legend,
  LineChart,
  Line,
  ReferenceLine,
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

  // Distribution Donut Data
  const pieData = [
    {
      name: "Profitable (≥20%)",
      value: distribution?.profitable || 0,
      color: "#10b981", // Emerald
    },
    {
      name: "Low-Margin (5-20%)",
      value: distribution?.lowMargin || 0,
      color: "#f59e0b", // Amber
    },
    {
      name: "Loss-Making (<5%)",
      value: distribution?.lossMaking || 0,
      color: "#f43f5e", // Rose
    },
  ].filter((d) => d.value > 0);

  // Custom tooltips
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-panel p-3 rounded-lg border border-zinc-700 shadow-xl text-xs space-y-1.5 min-w-[160px]">
          <div className="font-semibold text-white border-b border-zinc-800 pb-1">
            {data.label}
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" /> Revenue:
            </span>
            <span className="font-semibold text-white tabular-nums">
              {formatCurrency(data.revenue)}
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Cost:
            </span>
            <span className="font-semibold text-white tabular-nums">
              {formatCurrency(data.cost)}
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-300 pt-1 border-t border-zinc-800/80">
            <span className="flex items-center gap-1.5 font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Profit:
            </span>
            <span
              className={`font-bold tabular-nums ${
                data.profit >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {formatCurrency(data.profit)}
            </span>
          </div>
          <div className="flex justify-between items-center text-zinc-400 text-[11px]">
            <span>Margin %:</span>
            <span className="font-semibold text-zinc-200 tabular-nums">
              {formatPercent(data.margin)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Revenue vs Cost vs Profit */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Revenue, Cost & Profit Trends
            </h3>
            <p className="text-xs text-zinc-400">Monthly breakdown across all active clients</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" /> Cost
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Gross Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-400 text-xs">
              No trend data available for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#3f3f46" }}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="cost" name="Cost" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={28} />
                <Bar dataKey="profit" name="Gross Profit" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Client Distribution Donut */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Client Profitability Mix
          </h3>
          <p className="text-xs text-zinc-400">Share of accounts by margin health</p>
        </div>

        <div className="h-56 relative flex items-center justify-center my-2">
          {pieData.length === 0 ? (
            <div className="text-xs text-zinc-400">No active accounts</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={84}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#090a0f" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Accounts`, name]}
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#3f3f46",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {distribution?.total || 0}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium tracking-wider uppercase">
                  Accounts
                </span>
              </div>
            </>
          )}
        </div>

        {/* Custom Legend */}
        <div className="space-y-2 pt-2 border-t border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Profitable (≥20%)
            </span>
            <span className="font-semibold text-emerald-400 tabular-nums">
              {distribution?.profitable || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Low-Margin (5-20%)
            </span>
            <span className="font-semibold text-amber-400 tabular-nums">
              {distribution?.lowMargin || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-zinc-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Loss-Making (&lt;5%)
            </span>
            <span className="font-semibold text-rose-400 tabular-nums">
              {distribution?.lossMaking || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
