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

const CATEGORY_COLORS = ["#34d399", "#38bdf8", "#fbbf24", "#f472b6", "#a78bfa", "#989898"];

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
              className="p-1.5 rounded-[4px] border border-[#eaeaea] text-[#838383] hover:text-[#1a1a1a]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="h-6 w-48 bg-[#eaeaea] animate-pulse rounded-[4px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      eyebrow="CLIENT AUDIT"
      pageTitle={client.name}
      pageDescription={`Account ID: ${client.externalReference || client.id.slice(0, 8)}`}
    >
      <div className="space-y-6">
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/clients"
              className="p-1.5 rounded-[4px] border border-[#e0e0e0] text-[#858585] hover:text-[#272727] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-serif text-3xl font-normal text-[#272727]">
                  {client.name}
                </h1>
                <ClassificationBadge classification={metrics.classification} />
              </div>
              <p className="text-xs text-[#858585] font-mono mt-0.5">
                {client.externalReference ? `Ref: ${client.externalReference}` : "Internal Account"}{" "}
                • Added {new Date(client.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0]">
            <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-1">Total Revenue</div>
            <div className="text-2xl font-bold text-[#272727] tabular-nums">
              {formatCurrency(metrics.totalRevenue)}
            </div>
            <span className="text-[10px] text-[#858585]">Billed in period</span>
          </div>

          <div className="p-4 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0]">
            <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-1">Total Costs</div>
            <div className="text-2xl font-bold text-[#272727] tabular-nums">
              {formatCurrency(metrics.totalCost)}
            </div>
            <span className="text-[10px] text-[#858585]">Attributed costs</span>
          </div>

          <div className="p-4 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0]">
            <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-1">Gross Profit</div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                isLoss ? "text-[#e11d48]" : "text-[#16a34a]"
              }`}
            >
              {formatCurrency(metrics.grossProfit)}
            </div>
            <span className="text-[10px] text-[#858585]">
              {isLoss ? "Operating loss" : "Net profit"}
            </span>
          </div>

          <div className="p-4 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0]">
            <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-1">Margin %</div>
            <div
              className={`text-2xl font-bold tabular-nums ${
                metrics.marginPercent !== null && metrics.marginPercent >= 20
                  ? "text-[#16a34a]"
                  : metrics.marginPercent !== null && metrics.marginPercent >= 5
                  ? "text-[#f59e0b]"
                  : "text-[#e11d48]"
              }`}
            >
              {formatPercent(metrics.marginPercent)}
            </div>
            <span className="text-[10px] text-[#858585]">
              {metrics.marginPercent !== null && metrics.marginPercent >= 20
                ? "Target met (≥20%)"
                : "Below 20% target"}
            </span>
          </div>
        </div>

        {/* Charts Row: Monthly Trend + Cost Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Cost Monthly Chart */}
          <div className="lg:col-span-2 p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#e0e0e0]">
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
                  MONTHLY TRAJECTORY
                </div>
                <h3 className="font-serif text-lg text-[#272727]">
                  Monthly Revenue vs. Cost
                </h3>
                <p className="text-xs text-[#5d5d5d]">Account performance history</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#5d5d5d]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#7451f2]" /> Revenue
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-[#d6e5ff] border border-[#5952a1]" /> Cost
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              {trends.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#858585]">
                  No monthly history recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                    <XAxis dataKey="label" stroke="#858585" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#858585"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(val), ""]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        borderColor: "#e0e0e0",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#272727",
                      }}
                    />
                    <Bar dataKey="revenue" fill="#7451f2" radius={[2, 2, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="cost" fill="#d6e5ff" stroke="#5952a1" strokeWidth={1} radius={[2, 2, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Cost Category Breakdown */}
          <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between">
            <div className="mb-3 pb-2 border-b border-[#e0e0e0]">
              <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
                EXPENSE ALLOCATION
              </div>
              <h3 className="font-serif text-lg text-[#272727]">Expense Categories</h3>
              <p className="text-xs text-[#5d5d5d]">Cost distribution across categories</p>
            </div>

            <div className="h-44 relative flex items-center justify-center">
              {costBreakdown.length === 0 ? (
                <div className="text-xs text-[#838383]">No cost categories recorded</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
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
                        borderColor: "#eaeaea",
                        borderRadius: "4px",
                        fontSize: "12px",
                        color: "#1a1a1a",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Category List */}
            <div className="space-y-1.5 pt-2 border-t border-[#eaeaea] max-h-40 overflow-y-auto">
              {costBreakdown.map((cat, idx) => (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-[#1a1a1a] truncate max-w-[140px]">
                    <span
                      className="w-[6px] h-[6px] rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                    />
                    <span className="truncate">{cat.category}</span>
                  </span>
                  <div className="flex items-center gap-2 tabular-nums">
                    <span className="font-normal text-[#1a1a1a]">{formatCurrency(cat.amount)}</span>
                    <span className="text-[#838383] text-[11px] w-10 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Level Table */}
        <div className="rounded-[8px] bg-white border border-[#eaeaea] overflow-hidden">
          <div className="p-4 border-b border-[#eaeaea] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-[#1a1a1a]">
                Transaction Line Items
              </h3>
              <p className="text-xs text-[#838383]">
                Detailed entries recorded for {client.name}
              </p>
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1.5">
              {[
                { key: "all", label: "All Items" },
                { key: "revenue", label: "Revenue" },
                { key: "cost", label: "Costs" },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => {
                    setTypeFilter(btn.key);
                    setTxPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-[4px] text-xs transition-colors ${
                    typeFilter === btn.key
                      ? "border border-[#1a1a1a] bg-white text-[#1a1a1a] font-bold"
                      : "border border-[#eaeaea] bg-white text-[#6f6f6f] hover:text-[#1a1a1a]"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f7f7] border-b border-[#eaeaea] text-rows-caption">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Type</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                  <th className="py-2.5 px-4 text-right">Source File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1]">
                {txLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-[#838383]">
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-[#838383]">
                      No transactions recorded under this filter.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isRev = tx.type.toLowerCase() === "revenue";
                    return (
                      <tr key={tx.id} className="hover:bg-[#f7f7f7]">
                        <td className="py-3 px-4 tabular-nums text-[#1a1a1a] font-mono text-[11px]">
                          {tx.date}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.21px] border border-[#eaeaea] bg-[#f7f7f7] text-[#1a1a1a]"
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#1a1a1a] font-normal">{tx.category}</td>
                        <td className="py-3 px-4 text-[#6f6f6f] max-w-xs truncate">
                          {tx.description || "—"}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-bold">
                          <span className={isRev ? "text-[#16a34a]" : "text-[#1a1a1a]"}>
                            {isRev ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[#838383] font-mono text-[10px]">
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
            <div className="p-3 border-t border-[#eaeaea] bg-white flex items-center justify-between text-xs text-[#838383]">
              <div>
                Showing {(txPage - 1) * txLimit + 1} to {Math.min(txPage * txLimit, txTotal)} of{" "}
                {txTotal} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={txPage <= 1}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-[4px] bg-white hover:bg-[#f7f7f7] disabled:opacity-40 text-[#1a1a1a] border border-[#eaeaea]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-normal text-[#1a1a1a] tabular-nums">
                  Page {txPage} of {txTotalPages}
                </span>
                <button
                  disabled={txPage >= txTotalPages}
                  onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                  className="p-1 rounded-[4px] bg-white hover:bg-[#f7f7f7] disabled:opacity-40 text-[#1a1a1a] border border-[#eaeaea]"
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
