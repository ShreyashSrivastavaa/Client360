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
      <div className="bg-[#ffffff] p-3 rounded-[4px] border border-[#e0e0e0] text-xs space-y-1.5 min-w-[170px] text-[#272727] shadow-sm">
        <div className="font-semibold text-[#272727] border-b border-[#e0e0e0] pb-1 font-mono text-[11px] uppercase tracking-[0.22px]">
          {data.label}
        </div>
        <div className="flex justify-between items-center text-[#5d5d5d]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7451f2]" /> Revenue:
          </span>
          <span className="font-medium text-[#272727] tabular-nums font-mono">
            {formatCurrency(data.revenue)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[#5d5d5d]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d6e5ff]" /> Cost:
          </span>
          <span className="font-medium text-[#272727] tabular-nums font-mono">
            {formatCurrency(data.cost)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[#e0e0e0]">
          <span className="font-semibold">
            Gross Profit:
          </span>
          <span
            className={`font-semibold tabular-nums font-mono ${
              data.profit >= 0 ? "text-[#16a34a]" : "text-[#e11d48]"
            }`}
          >
            {formatCurrency(data.profit)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[11px] text-[#858585]">
          <span>Margin:</span>
          <span className="tabular-nums font-medium text-[#272727] font-mono">
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
      <div className="bg-[#ffffff] px-3 py-1.5 rounded-[4px] border border-[#e0e0e0] text-xs font-normal text-[#272727] shadow-sm">
        <span className="font-mono text-[11px] uppercase tracking-[0.22px]">{data.name}:</span>{" "}
        <span className="font-bold tabular-nums text-[#7451f2]">{data.value}</span> clients
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

  // Distribution Donut Data using Obviously color palette
  const pieData = [
    {
      name: "Profitable (≥20%)",
      value: distribution?.profitable || 0,
      color: "#7451f2", // Iris Violet
    },
    {
      name: "Low-Margin (5-20%)",
      value: distribution?.lowMargin || 0,
      color: "#f59e0b", // Amber
    },
    {
      name: "Loss-Making (<5%)",
      value: distribution?.lossMaking || 0,
      color: "#e11d48", // Rose
    },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Revenue vs Cost */}
      <div className="lg:col-span-2 p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#e0e0e0]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
              FINANCIAL TRAJECTORY
            </div>
            <h3 className="font-serif text-xl text-[#272727] tracking-tight">
              Revenue & Cost Trends
            </h3>
            <p className="text-xs text-[#5d5d5d]">Monthly ledger volume across active accounts</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#5d5d5d]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#7451f2]" /> Revenue
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-[1px] bg-[#d6e5ff] border border-[#5952a1]" /> Cost
            </span>
          </div>
        </div>

        <div className="h-[280px] w-full pt-2">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[#858585]">
              No trend data available for this range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis
                  dataKey="label"
                  stroke="#858585"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e0e0e0" }}
                />
                <YAxis
                  stroke="#858585"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#7451f2" radius={[2, 2, 0, 0]} maxBarSize={28} />
                <Bar dataKey="cost" name="Cost" fill="#d6e5ff" stroke="#5952a1" strokeWidth={1} radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Margin Tier Distribution */}
      <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between">
        <div className="pb-3 border-b border-[#e0e0e0] mb-4">
          <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
            HEALTH BREAKDOWN
          </div>
          <h3 className="font-serif text-xl text-[#272727] tracking-tight">
            Portfolio Margin Tiers
          </h3>
          <p className="text-xs text-[#5d5d5d]">Classification distribution of active accounts</p>
        </div>

        <div className="h-[200px] w-full flex items-center justify-center relative">
          {pieData.length === 0 ? (
            <div className="text-xs text-[#858585]">No client data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
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
              </PieChart>
            </ResponsiveContainer>
          )}
          {/* Donut Center Total */}
          {distribution && distribution.total > 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[#272727] tabular-nums leading-none">
                {distribution.total}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22px] text-[#858585] mt-1">
                Clients
              </span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="space-y-2 pt-3 border-t border-[#e0e0e0] text-xs">
          <div className="flex items-center justify-between text-[#5d5d5d]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#7451f2]" />
              <span>Profitable (≥20%)</span>
            </span>
            <span className="font-mono font-medium text-[#272727] tabular-nums">
              {distribution?.profitable || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#5d5d5d]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span>Low-Margin (5-20%)</span>
            </span>
            <span className="font-mono font-medium text-[#272727] tabular-nums">
              {distribution?.lowMargin || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#5d5d5d]">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e11d48]" />
              <span>Loss-Making (&lt;5%)</span>
            </span>
            <span className="font-mono font-medium text-[#272727] tabular-nums">
              {distribution?.lossMaking || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
