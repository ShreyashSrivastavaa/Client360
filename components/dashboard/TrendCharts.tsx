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

  // Distribution Donut Data using exact style reference tokens
  const pieData = [
    {
      name: "Profitable (≥20%)",
      value: distribution?.profitable || 0,
      color: "#1e874c", // Emerald
    },
    {
      name: "Low-Margin (5-20%)",
      value: distribution?.lowMargin || 0,
      color: "#ffc233", // Lemon Zest
    },
    {
      name: "Loss-Making (<5%)",
      value: distribution?.lossMaking || 0,
      color: "#d50b3e", // Crimson
    },
  ].filter((d) => d.value > 0);

  // Custom tooltips
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3.5 rounded-2xl border border-[#d1d1db] shadow-xl text-xs space-y-1.5 min-w-[170px]">
          <div className="font-bold text-[#121217] border-b border-[#d1d1db] pb-1">
            {data.label}
          </div>
          <div className="flex justify-between items-center text-[#6c6c89]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#5423e7]" /> Revenue:
            </span>
            <span className="font-bold text-[#121217] tabular-nums">
              {formatCurrency(data.revenue)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#6c6c89]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#6c6c89]" /> Cost:
            </span>
            <span className="font-bold text-[#121217] tabular-nums">
              {formatCurrency(data.cost)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#6c6c89] pt-1 border-t border-[#d1d1db]">
            <span className="flex items-center gap-1.5 font-bold text-[#1e874c]">
              <span className="w-2 h-2 rounded-full bg-[#1e874c]" /> Profit:
            </span>
            <span
              className={`font-bold tabular-nums ${
                data.profit >= 0 ? "text-[#1e874c]" : "text-[#d50b3e]"
              }`}
            >
              {formatCurrency(data.profit)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[#6c6c89] text-[11px]">
            <span>Margin %:</span>
            <span className="font-bold text-[#121217] tabular-nums">
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
      <div className="lg:col-span-2 p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-display font-bold text-[#121217] tracking-tight">
              Revenue, Cost & Profit Trends
            </h3>
            <p className="text-xs text-[#6c6c89]">Monthly ledger breakdown across active clients</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-[#121217]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#5423e7]" /> Revenue
            </span>
            <span className="flex items-center gap-1.5 text-[#121217]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#6c6c89]" /> Cost
            </span>
            <span className="flex items-center gap-1.5 text-[#121217]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#1e874c]" /> Gross Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          {trends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[#6c6c89] text-xs">
              No trend data available for this range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5eb" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#6c6c89"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#d1d1db" }}
                />
                <YAxis
                  stroke="#6c6c89"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#5423e7" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="cost" name="Cost" fill="#6c6c89" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar dataKey="profit" name="Gross Profit" fill="#1e874c" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Chart 2: Client Distribution Donut */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-base font-display font-bold text-[#121217] tracking-tight">
            Client Profitability Mix
          </h3>
          <p className="text-xs text-[#6c6c89]">Share of accounts by gross margin tier</p>
        </div>

        <div className="h-56 relative flex items-center justify-center my-2">
          {pieData.length === 0 ? (
            <div className="text-xs text-[#6c6c89]">No active accounts</div>
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} Accounts`, name]}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#d1d1db",
                      borderRadius: "16px",
                      fontSize: "12px",
                      color: "#121217",
                      boxShadow: "0 4px 20px rgba(18,18,23,0.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Total Counter */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-display font-bold text-[#121217] tabular-nums">
                  {distribution?.total || 0}
                </span>
                <span className="text-[10px] text-[#6c6c89] font-bold tracking-[2px] uppercase">
                  Accounts
                </span>
              </div>
            </>
          )}
        </div>

        {/* Custom Legend */}
        <div className="space-y-2 pt-2 border-t border-[#d1d1db]">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#121217] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e874c]" /> Profitable (≥20%)
            </span>
            <span className="font-bold text-[#1e874c] tabular-nums">
              {distribution?.profitable || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#121217] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffc233]" /> Low-Margin (5-20%)
            </span>
            <span className="font-bold text-[#996500] tabular-nums">
              {distribution?.lowMargin || 0}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-[#121217] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d50b3e]" /> Loss-Making (&lt;5%)
            </span>
            <span className="font-bold text-[#d50b3e] tabular-nums">
              {distribution?.lossMaking || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
