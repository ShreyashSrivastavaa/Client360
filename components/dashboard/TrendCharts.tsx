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
      <div className="bg-[#281006] p-3.5 rounded-[6px] border border-[#6b2e12] shadow-2xl text-xs space-y-1.5 min-w-[170px] text-[#faae33]">
        <div className="font-salmond text-sm font-bold text-[#faae33] border-b border-[#6b2e12] pb-1">
          {data.label}
        </div>
        <div className="flex justify-between items-center text-[#faae33]/80">
          <span className="flex items-center gap-1.5 font-graphikx">
            <span className="w-2 h-2 rounded-full bg-[#faae33]" /> Revenue:
          </span>
          <span className="font-bold tabular-nums">
            {formatCurrency(data.revenue)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#faae33]/80">
          <span className="flex items-center gap-1.5 font-graphikx">
            <span className="w-2 h-2 rounded-full bg-[#9f531b]" /> Cost:
          </span>
          <span className="font-bold tabular-nums">
            {formatCurrency(data.cost)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[#6b2e12]">
          <span className="flex items-center gap-1.5 font-bold font-graphikx">
            <span className={`w-2 h-2 rounded-full ${data.profit >= 0 ? "bg-[#faae33]" : "bg-[#d1255c]"}`} /> Profit:
          </span>
          <span
            className={`font-bold tabular-nums ${
              data.profit >= 0 ? "text-[#faae33]" : "text-[#d1255c]"
            }`}
          >
            {formatCurrency(data.profit)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-[#faae33]/70 font-graphikx">
          <span>Margin %:</span>
          <span className="font-bold tabular-nums">
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
      <div className="bg-[#281006] px-3 py-1.5 rounded-[6px] border border-[#6b2e12] text-xs font-bold text-[#faae33]">
        {data.name}: {data.value} clients
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

  // Distribution Donut Data using Hungry Tiger tokens
  const pieData = [
    {
      name: "Profitable (≥20%)",
      value: distribution?.profitable || 0,
      color: "#faae33", // Tiger Gold
    },
    {
      name: "Low-Margin (5-20%)",
      value: distribution?.lowMargin || 0,
      color: "#9f531b", // Saffron Glow
    },
    {
      name: "Loss-Making (<5%)",
      value: distribution?.lossMaking || 0,
      color: "#d1255c", // Chili Red
    },
  ].filter((d) => d.value > 0);

  // Distribution Donut Data using Hungry Tiger tokens

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Revenue vs Cost vs Profit */}
      <div className="lg:col-span-2 p-6 sm:p-8 rounded-[6px] bg-[#402011] border border-[#6b2e12] flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xl font-salmond font-bold text-[#faae33] tracking-wider uppercase">
              REVENUE, COST & PROFIT TRENDS
            </h3>
            <p className="text-xs text-[#faae33]/70 font-graphikx">Monthly ledger breakdown across active accounts</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-salmond tracking-wider uppercase text-[#faae33]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#faae33]" /> REVENUE
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9f531b]" /> COST
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs font-salmond uppercase text-[#faae33]/60">
              No trend data available for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6b2e12" opacity={0.4} />
                <XAxis
                  dataKey="label"
                  stroke="#faae33"
                  opacity={0.7}
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#6b2e12" }}
                />
                <YAxis
                  stroke="#faae33"
                  opacity={0.7}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#faae33" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill="#9f531b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Client Distribution Donut */}
      <div className="p-6 sm:p-8 rounded-[6px] bg-[#402011] border border-[#6b2e12] flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-salmond font-bold text-[#faae33] tracking-wider uppercase">
            PORTFOLIO HEALTH
          </h3>
          <p className="text-xs text-[#faae33]/70 font-graphikx">Margin classification of active clients</p>
        </div>

        <div className="h-[200px] w-full flex items-center justify-center my-2">
          {pieData.length === 0 ? (
            <div className="text-xs font-salmond uppercase text-[#faae33]/60">
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
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#281006" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-[#6b2e12]">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#faae33]/90 font-graphikx">
              <span className="w-2.5 h-2.5 rounded-full bg-[#faae33]" /> Profitable (≥20%)
            </span>
            <span className="font-bold text-[#faae33] font-salmond text-sm">
              {distribution?.profitable || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#faae33]/90 font-graphikx">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9f531b]" /> Low-Margin (5-20%)
            </span>
            <span className="font-bold text-[#faae33] font-salmond text-sm">
              {distribution?.lowMargin || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-[#faae33]/90 font-graphikx">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d1255c]" /> Loss-Making (&lt;5%)
            </span>
            <span className="font-bold text-[#d1255c] font-salmond text-sm">
              {distribution?.lossMaking || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
