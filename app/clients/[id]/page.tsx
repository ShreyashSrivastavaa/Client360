"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClassificationBadge } from "@/components/ui/Badge";
import { CardSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { usePeriod } from "@/lib/period-context";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  ArrowLeft,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Percent,
  Receipt,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

interface ClientDetailData {
  client: {
    id: string;
    name: string;
    externalReference: string | null;
    isActive: boolean;
    createdAt: string;
  };
  metrics: {
    totalRevenue: number;
    totalCost: number;
    grossProfit: number;
    marginPercent: number | null;
    classification: string;
    transactionCount: number;
  };
  costBreakdown: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  trends: {
    monthKey: string;
    label: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number | null;
    classification: string;
  }[];
}

interface TransactionRow {
  id: string;
  date: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  sourceFile: string;
}

const CATEGORY_COLORS = ["#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#10b981", "#71717a"];

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params?.id as string;
  const { period, customStart, customEnd } = usePeriod();

  const [detail, setDetail] = useState<ClientDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [txPage, setTxPage] = useState(1);
  const [txLimit] = useState(15);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchClientDetails = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);

    const query = new URLSearchParams({ range: period });
    if (customStart) query.set("start", customStart);
    if (customEnd) query.set("end", customEnd);

    try {
      const data = await apiFetch<ClientDetailData>(`/api/clients/${clientId}?${query.toString()}`);
      setDetail(data);
    } catch (err) {
      console.error("Failed to load client details:", err);
    } finally {
      setLoading(false);
    }
  }, [clientId, period, customStart, customEnd]);

  const fetchTransactions = useCallback(async () => {
    if (!clientId) return;
    setTxLoading(true);

    const query = new URLSearchParams({
      page: txPage.toString(),
      limit: txLimit.toString(),
      type: typeFilter,
    });

    try {
      const res = await apiFetch<{
        data: TransactionRow[];
        meta: { total: number; page: number; totalPages: number };
      }>(`/api/clients/${clientId}/transactions?${query.toString()}`);

      const list = Array.isArray(res) ? res : (res as any).data || [];
      const meta = (res as any).meta || { total: list.length, totalPages: 1 };

      setTransactions(list);
      setTxTotal(meta.total);
      setTxTotalPages(meta.totalPages);
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  }, [clientId, txPage, txLimit, typeFilter]);

  useEffect(() => {
    fetchClientDetails();
  }, [fetchClientDetails]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  if (loading || !detail) {
    return (
      <AppShell pageTitle="Client Drill-Down">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-6 w-48 bg-zinc-800 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </AppShell>
    );
  }

  const { client, metrics, costBreakdown, trends } = detail;
  const isLoss = metrics.grossProfit < 0;

  return (
    <AppShell
      pageTitle={client.name}
      pageDescription={`Client Account ID: ${client.externalReference || client.id.slice(0, 8)}`}
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {client.name}
                </h1>
                <ClassificationBadge classification={metrics.classification} />
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {client.externalReference ? `Ref: ${client.externalReference}` : "Internal Account"}{" "}
                • Added {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <span className="text-[10px] text-zinc-400">Total billings in period</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
              <span>Total Costs</span>
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white tabular-nums">
              {formatCurrency(metrics.totalCost)}
            </div>
            <span className="text-[10px] text-zinc-400">Direct service & overhead</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
              <span>Gross Profit</span>
              <TrendingUp className={`w-4 h-4 ${isLoss ? "text-rose-400" : "text-emerald-400"}`} />
            </div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                isLoss ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {formatCurrency(metrics.grossProfit)}
            </div>
            <span className="text-[10px] text-zinc-400">
              {isLoss ? "Negative operating return" : "Net profit generated"}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-400 text-xs mb-1.5">
              <span>Margin %</span>
              <Percent className="w-4 h-4 text-indigo-400" />
            </div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                metrics.marginPercent !== null && metrics.marginPercent >= 20
                  ? "text-emerald-400"
                  : metrics.marginPercent !== null && metrics.marginPercent >= 5
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {formatPercent(metrics.marginPercent)}
            </div>
            <span className="text-[10px] text-zinc-400">
              {metrics.marginPercent !== null && metrics.marginPercent >= 20
                ? "Above healthy threshold"
                : "Below 20% margin target"}
            </span>
          </div>
        </div>

        {/* Charts Row: Monthly Trend + Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Cost Monthly Chart */}
          <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-white">Monthly Revenue vs. Cost</h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500" /> Cost
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-zinc-400">
                  No monthly history recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="label" stroke="#71717a" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(val), ""]}
                      contentStyle={{
                        backgroundColor: "#18181b",
                        borderColor: "#3f3f46",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="cost" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cost Category Breakdown */}
          <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-zinc-800">
              <PieIcon className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Expense Breakdown</h3>
            </div>

            <div className="h-44 relative flex items-center justify-center">
              {costBreakdown.length === 0 ? (
                <div className="text-xs text-zinc-400">No cost categories recorded</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="amount"
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          stroke="#090a0f"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(val), "Amount"]}
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
              )}
            </div>

            {/* Category List */}
            <div className="space-y-2 pt-2 border-t border-zinc-800 max-h-40 overflow-y-auto pr-1">
              {costBreakdown.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-zinc-300 truncate max-w-[140px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="truncate">{cat.category}</span>
                  </span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-semibold text-white">{formatCurrency(cat.amount)}</span>
                    <span className="text-zinc-400 text-[11px] w-10 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Level Table */}
        <div className="glass-panel rounded-xl border border-zinc-800/80 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Transaction Line Items</h3>
                <p className="text-xs text-zinc-400">
                  Detailed individual entries recorded for {client.name}
                </p>
              </div>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1.5">
              {[
                { key: "all", label: "All Items" },
                { key: "revenue", label: "Revenue Only" },
                { key: "cost", label: "Costs Only" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => {
                    setTypeFilter(btn.key);
                    setTxPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    typeFilter === btn.key
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Source File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {txLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4">
                      <TableSkeleton rows={4} cols={6} />
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-zinc-400">
                      No transactions recorded under this filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isRev = tx.type.toLowerCase() === "revenue";
                    return (
                      <tr key={tx.id} className="hover:bg-zinc-850/40">
                        <td className="py-3 px-4 tabular-nums text-zinc-300 font-mono text-[11px]">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              isRev
                                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-200 font-medium">{tx.category}</td>
                        <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                          {tx.description || "—"}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold">
                          <span className={isRev ? "text-emerald-400" : "text-zinc-200"}>
                            {isRev ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-zinc-400 font-mono text-[10px]">
                          {tx.sourceFile}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Transactions Pagination */}
          {txTotalPages > 1 && (
            <div className="p-3 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div>
                Showing {(txPage - 1) * txLimit + 1} to {Math.min(txPage * txLimit, txTotal)} of{" "}
                {txTotal} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span>
                  Page {txPage} of {txTotalPages}
                </span>
                <button
                  disabled={txPage >= txTotalPages}
                  onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                  className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200 border border-zinc-700"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
