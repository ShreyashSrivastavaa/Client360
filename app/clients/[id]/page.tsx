"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClassificationBadge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
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

const CATEGORY_COLORS = ["#5423e7", "#ffc233", "#0075ad", "#1e874c", "#cf75ff", "#d50b3e", "#6c6c89"];

export default function ClientDetailPage() {
  const params = useParams();
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
              className="p-2 rounded-lg bg-white border border-[#d1d1db] text-[#6c6c89] hover:text-[#121217]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-6 w-48 bg-[#d1d1db] animate-pulse rounded" />
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
              className="p-2 rounded-lg bg-white border border-[#d1d1db] hover:border-[#6c6c89] text-[#6c6c89] hover:text-[#121217] transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-display font-bold text-[#121217] tracking-tight">
                  {client.name}
                </h1>
                <ClassificationBadge classification={metrics.classification} />
              </div>
              <p className="text-xs text-[#6c6c89] font-mono mt-0.5">
                {client.externalReference ? `Ref: ${client.externalReference}` : "Internal Account"}{" "}
                • Added {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[24px] bg-white border border-[#d1d1db] shadow-sm">
            <div className="flex items-center justify-between text-[#6c6c89] text-xs mb-1.5 font-semibold">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-[#5423e7]" />
            </div>
            <div className="text-2xl font-display font-bold text-[#121217] tabular-nums">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <span className="text-[10px] text-[#6c6c89]">Total billings in period</span>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-[#d1d1db] shadow-sm">
            <div className="flex items-center justify-between text-[#6c6c89] text-xs mb-1.5 font-semibold">
              <span>Total Costs</span>
              <TrendingDown className="w-4 h-4 text-[#6c6c89]" />
            </div>
            <div className="text-2xl font-display font-bold text-[#121217] tabular-nums">
              {formatCurrency(metrics.totalCost)}
            </div>
            <span className="text-[10px] text-[#6c6c89]">Direct service & overhead</span>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-[#d1d1db] shadow-sm">
            <div className="flex items-center justify-between text-[#6c6c89] text-xs mb-1.5 font-semibold">
              <span>Gross Profit</span>
              <TrendingUp className={`w-4 h-4 ${isLoss ? "text-[#d50b3e]" : "text-[#1e874c]"}`} />
            </div>
            <div
              className={`text-2xl font-display font-bold tabular-nums ${
                isLoss ? "text-[#d50b3e]" : "text-[#1e874c]"
              }`}
            >
              {formatCurrency(metrics.grossProfit)}
            </div>
            <span className="text-[10px] text-[#6c6c89]">
              {isLoss ? "Negative operating return" : "Net profit generated"}
            </span>
          </div>

          <div className="p-5 rounded-[24px] bg-white border border-[#d1d1db] shadow-sm">
            <div className="flex items-center justify-between text-[#6c6c89] text-xs mb-1.5 font-semibold">
              <span>Margin %</span>
              <Percent className="w-4 h-4 text-[#5423e7]" />
            </div>
            <div
              className={`text-2xl font-display font-bold tabular-nums ${
                metrics.marginPercent !== null && metrics.marginPercent >= 20
                  ? "text-[#1e874c]"
                  : metrics.marginPercent !== null && metrics.marginPercent >= 5
                  ? "text-[#996500]"
                  : "text-[#d50b3e]"
              }`}
            >
              {formatPercent(metrics.marginPercent)}
            </div>
            <span className="text-[10px] text-[#6c6c89]">
              {metrics.marginPercent !== null && metrics.marginPercent >= 20
                ? "Above healthy threshold"
                : "Below 20% margin target"}
            </span>
          </div>
        </div>

        {/* Charts Row: Monthly Trend + Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Cost Monthly Chart */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#d1d1db]">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#5423e7]" />
                <h3 className="text-sm font-display font-bold text-[#121217]">
                  Monthly Revenue vs. Cost
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#121217]">
                  <span className="w-2.5 h-2.5 rounded bg-[#5423e7]" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-[#121217]">
                  <span className="w-2.5 h-2.5 rounded bg-[#6c6c89]" /> Cost
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#6c6c89]">
                  No monthly history recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5eb" vertical={false} />
                    <XAxis dataKey="label" stroke="#6c6c89" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#6c6c89"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(val), ""]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#d1d1db",
                        borderRadius: "16px",
                        fontSize: "12px",
                        color: "#121217",
                        boxShadow: "0 4px 20px rgba(18,18,23,0.08)",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#5423e7" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="cost" fill="#6c6c89" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cost Category Breakdown */}
          <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#d1d1db]">
              <PieIcon className="w-4 h-4 text-[#5423e7]" />
              <h3 className="text-sm font-display font-bold text-[#121217]">Expense Breakdown</h3>
            </div>

            <div className="h-44 relative flex items-center justify-center">
              {costBreakdown.length === 0 ? (
                <div className="text-xs text-[#6c6c89]">No cost categories recorded</div>
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
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(val), "Amount"]}
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
              )}
            </div>

            {/* Category List */}
            <div className="space-y-2 pt-2 border-t border-[#d1d1db] max-h-40 overflow-y-auto pr-1">
              {costBreakdown.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-[#121217] font-medium truncate max-w-[140px]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="truncate">{cat.category}</span>
                  </span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-bold text-[#121217]">{formatCurrency(cat.amount)}</span>
                    <span className="text-[#6c6c89] text-[11px] w-10 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Level Table */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm overflow-hidden">
          <div className="pb-4 border-b border-[#d1d1db] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#5423e7]" />
              <div>
                <h3 className="text-sm font-display font-bold text-[#121217]">
                  Transaction Line Items
                </h3>
                <p className="text-xs text-[#6c6c89]">
                  Detailed line item entries recorded for {client.name}
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
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    typeFilter === btn.key
                      ? "bg-[#121217] text-white"
                      : "bg-[#f7f7f8] text-[#6c6c89] hover:text-[#121217] border border-[#d1d1db]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f7f8] border-b border-[#d1d1db] text-[11px] font-bold text-[#6c6c89] uppercase tracking-[1.5px]">
                <tr>
                  <th className="py-3 px-4 rounded-l-xl">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Source File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1d1db]">
                {txLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-[#6c6c89]">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#6c6c89]">
                      No transactions recorded under this filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isRev = tx.type.toLowerCase() === "revenue";
                    return (
                      <tr key={tx.id} className="hover:bg-[#f7f7f8]">
                        <td className="py-3.5 px-4 tabular-nums text-[#121217] font-mono text-[11px]">
                          {tx.date}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isRev
                                ? "bg-[#5423e7]/10 text-[#5423e7] border border-[#5423e7]/20"
                                : "bg-[#ffc233]/20 text-[#996500] border border-[#ffc233]/40"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[#121217] font-semibold">{tx.category}</td>
                        <td className="py-3.5 px-4 text-[#6c6c89] max-w-xs truncate">
                          {tx.description || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold">
                          <span className={isRev ? "text-[#1e874c]" : "text-[#121217]"}>
                            {isRev ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#6c6c89] font-mono text-[10px]">
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
            <div className="pt-4 mt-2 border-t border-[#d1d1db] flex items-center justify-between text-xs text-[#6c6c89]">
              <div>
                Showing {(txPage - 1) * txLimit + 1} to {Math.min(txPage * txLimit, txTotal)} of{" "}
                {txTotal} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg bg-white hover:bg-[#f7f7f8] disabled:opacity-40 text-[#121217] border border-[#d1d1db]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-[#121217]">
                  Page {txPage} of {txTotalPages}
                </span>
                <button
                  disabled={txPage >= txTotalPages}
                  onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                  className="p-1.5 rounded-lg bg-white hover:bg-[#f7f7f8] disabled:opacity-40 text-[#121217] border border-[#d1d1db]"
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
