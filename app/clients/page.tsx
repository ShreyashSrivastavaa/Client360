"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { ClassificationBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { usePeriod } from "@/lib/period-context";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, formatPercent } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Building,
  UploadCloud,
  X,
} from "lucide-react";

interface ClientRow {
  id: string;
  name: string;
  externalReference: string | null;
  isActive: boolean;
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number | null;
  classification: string;
  sparkline: number[];
  lastActivityDate: string | null;
}

export default function ClientsPage() {
  const { period, customStart, customEnd } = usePeriod();
  const { organization } = useAuth();

  const [clients, setClients] = useState<ClientRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("profit_desc");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchClients = useCallback(async () => {
    if (!organization) return;
    setLoading(true);

    const query = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: debouncedSearch,
      status: statusFilter,
      sort: sortField,
      range: period,
    });

    if (customStart) query.set("start", customStart);
    if (customEnd) query.set("end", customEnd);

    try {
      const res = await apiFetch<{
        data: ClientRow[];
        meta: { total: number; page: number; totalPages: number };
      }>(`/api/clients?${query.toString()}`);

      // If backend returns data array directly or wrapped
      const list = Array.isArray(res) ? res : (res as any).data || [];
      const meta = (res as any).meta || { total: list.length, totalPages: 1 };

      setClients(list);
      setTotal(meta.total);
      setTotalPages(meta.totalPages);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [organization, page, limit, debouncedSearch, statusFilter, sortField, period, customStart, customEnd]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSortToggle = (field: string) => {
    if (sortField === `${field}_desc`) {
      setSortField(`${field}_asc`);
    } else {
      setSortField(`${field}_desc`);
    }
    setPage(1);
  };

  // Sparkline mini SVG generator
  const renderSparkline = (data: number[], isLoss: boolean) => {
    if (!data || data.length < 2) {
      return <span className="text-[10px] text-zinc-400">—</span>;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 18;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const strokeColor = isLoss ? "#f43f5e" : "#10b981";

    return (
      <svg width={width} height={height} className="shrink-0 overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <AppShell
      pageTitle="Clients Portfolio"
      pageDescription="Full client profitability ledger with margin classifications and transaction drill-downs"
    >
      <div className="space-y-4">
        {/* Filter & Search Bar */}
        <div className="glass-panel p-4 rounded-xl border border-zinc-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client or account name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-white placeholder-zinc-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Classification Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { key: "all", label: "All Accounts" },
              { key: "profitable", label: "Profitable (≥20%)" },
              { key: "low_margin", label: "Low-Margin (5-20%)" },
              { key: "loss_making", label: "Loss-Making (<5%)" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="glass-panel rounded-xl border border-zinc-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">
                    <button
                      onClick={() => handleSortToggle("name")}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      <span>Client Account</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("revenue")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-white"
                    >
                      <span>Revenue</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("cost")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-white"
                    >
                      <span>Total Cost</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("profit")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-white"
                    >
                      <span>Gross Profit</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("margin")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-white"
                    >
                      <span>Margin %</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-center">Classification</th>
                  <th className="py-3.5 px-4 text-center">Trend (6mo)</th>
                  <th className="py-3.5 px-4 text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-4">
                      <TableSkeleton rows={6} cols={8} />
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Building className="w-8 h-8 text-zinc-400" />
                        <div className="text-sm font-semibold text-white">No clients found</div>
                        <p className="text-xs text-zinc-400 max-w-sm">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search query or status filter to view clients."
                            : "No clients recorded for this period. Upload a CSV or load demo data."}
                        </p>
                        {(searchTerm || statusFilter !== "all") && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                            }}
                            className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => {
                    const isLoss = client.grossProfit < 0;
                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-zinc-850/50 transition-colors group cursor-pointer"
                      >
                        {/* Client Name & ID */}
                        <td className="py-3.5 px-4">
                          <Link href={`/clients/${client.id}`} className="block">
                            <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                              {client.name}
                            </div>
                            {client.externalReference && (
                              <div className="text-[10px] text-zinc-400 font-mono">
                                {client.externalReference}
                              </div>
                            )}
                          </Link>
                        </td>

                        {/* Revenue */}
                        <td className="py-3.5 px-4 text-right tabular-nums text-zinc-300 font-medium">
                          <Link href={`/clients/${client.id}`} className="block">
                            {formatCurrency(client.totalRevenue)}
                          </Link>
                        </td>

                        {/* Cost */}
                        <td className="py-3.5 px-4 text-right tabular-nums text-zinc-400">
                          <Link href={`/clients/${client.id}`} className="block">
                            {formatCurrency(client.totalCost)}
                          </Link>
                        </td>

                        {/* Gross Profit */}
                        <td className="py-3.5 px-4 text-right tabular-nums font-bold">
                          <Link href={`/clients/${client.id}`} className="block">
                            <span className={isLoss ? "text-rose-400" : "text-emerald-400"}>
                              {formatCurrency(client.grossProfit)}
                            </span>
                          </Link>
                        </td>

                        {/* Margin % */}
                        <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                          <Link href={`/clients/${client.id}`} className="block">
                            <span
                              className={
                                client.marginPercent !== null && client.marginPercent >= 20
                                  ? "text-emerald-400"
                                  : client.marginPercent !== null && client.marginPercent >= 5
                                  ? "text-amber-400"
                                  : "text-rose-400"
                              }
                            >
                              {formatPercent(client.marginPercent)}
                            </span>
                          </Link>
                        </td>

                        {/* Classification Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <Link href={`/clients/${client.id}`} className="inline-block">
                            <ClassificationBadge classification={client.classification} />
                          </Link>
                        </td>

                        {/* Sparkline */}
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            href={`/clients/${client.id}`}
                            className="flex justify-center items-center"
                          >
                            {renderSparkline(client.sparkline, isLoss)}
                          </Link>
                        </td>

                        {/* Last Activity */}
                        <td className="py-3.5 px-4 text-right text-zinc-400 text-[11px]">
                          <Link href={`/clients/${client.id}`} className="block">
                            {client.lastActivityDate || "—"}
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-3.5 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{" "}
                clients
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-zinc-300 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-zinc-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
