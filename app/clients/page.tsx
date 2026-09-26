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
  ChevronLeft,
  ChevronRight,
  Building,
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

  const renderSparkline = (data: number[], isLoss: boolean) => {
    if (!data || data.length < 2) {
      return <span className="text-[10px] text-[#6c6c89]">—</span>;
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

    const strokeColor = isLoss ? "#d50b3e" : "#1e874c";

    return (
      <svg width={width} height={height} className="shrink-0 overflow-visible">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
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
      <div className="space-y-5">
        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 rounded-[24px] bg-white border border-[#d1d1db] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#6c6c89] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client or account name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#f7f7f8] border border-[#d1d1db] text-xs text-[#121217] placeholder-[#6c6c89] focus:outline-none focus:border-[#5423e7] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6c6c89] hover:text-[#121217]"
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? "bg-[#5423e7] text-white shadow-sm"
                    : "bg-[#f7f7f8] text-[#6c6c89] hover:text-[#121217] border border-[#d1d1db]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Table Card */}
        <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f7f8] border-b border-[#d1d1db] text-[11px] font-bold text-[#6c6c89] uppercase tracking-[1.5px]">
                <tr>
                  <th className="py-3.5 px-4 rounded-l-xl">
                    <button
                      onClick={() => handleSortToggle("name")}
                      className="flex items-center gap-1 hover:text-[#121217]"
                    >
                      <span>Client Account</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("revenue")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#121217]"
                    >
                      <span>Revenue</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("cost")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#121217]"
                    >
                      <span>Total Cost</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("profit")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#121217]"
                    >
                      <span>Gross Profit</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("margin")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#121217]"
                    >
                      <span>Margin %</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-center">Classification</th>
                  <th className="py-3.5 px-4 text-center">Trend (6mo)</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d1d1db]">
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
                        <Building className="w-8 h-8 text-[#6c6c89]" />
                        <div className="text-sm font-display font-bold text-[#121217]">
                          No clients found
                        </div>
                        <p className="text-xs text-[#6c6c89] max-w-sm">
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
                            className="px-4 py-2 rounded-lg bg-[#121217] hover:bg-[#272730] text-xs font-semibold text-white"
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
                        className="hover:bg-[#f7f7f8] transition-colors group cursor-pointer"
                      >
                        <td className="py-4 px-4">
                          <Link href={`/clients/${client.id}`} className="block">
                            <div className="font-bold text-[#121217] group-hover:text-[#5423e7] transition-colors">
                              {client.name}
                            </div>
                            {client.externalReference && (
                              <div className="text-[10px] text-[#6c6c89] font-mono">
                                {client.externalReference}
                              </div>
                            )}
                          </Link>
                        </td>

                        <td className="py-4 px-4 text-right tabular-nums text-[#121217] font-medium">
                          <Link href={`/clients/${client.id}`} className="block">
                            {formatCurrency(client.totalRevenue)}
                          </Link>
                        </td>

                        <td className="py-4 px-4 text-right tabular-nums text-[#6c6c89]">
                          <Link href={`/clients/${client.id}`} className="block">
                            {formatCurrency(client.totalCost)}
                          </Link>
                        </td>

                        <td className="py-4 px-4 text-right tabular-nums font-bold">
                          <Link href={`/clients/${client.id}`} className="block">
                            <span className={isLoss ? "text-[#d50b3e]" : "text-[#1e874c]"}>
                              {formatCurrency(client.grossProfit)}
                            </span>
                          </Link>
                        </td>

                        <td className="py-4 px-4 text-right tabular-nums font-bold">
                          <Link href={`/clients/${client.id}`} className="block">
                            <span
                              className={
                                client.marginPercent !== null && client.marginPercent >= 20
                                  ? "text-[#1e874c]"
                                  : client.marginPercent !== null && client.marginPercent >= 5
                                  ? "text-[#996500]"
                                  : "text-[#d50b3e]"
                              }
                            >
                              {formatPercent(client.marginPercent)}
                            </span>
                          </Link>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <Link href={`/clients/${client.id}`} className="inline-block">
                            <ClassificationBadge classification={client.classification} />
                          </Link>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <Link
                            href={`/clients/${client.id}`}
                            className="flex justify-center items-center"
                          >
                            {renderSparkline(client.sparkline, isLoss)}
                          </Link>
                        </td>

                        <td className="py-4 px-4 text-right text-[#6c6c89] text-[11px] font-medium">
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
            <div className="pt-4 mt-2 border-t border-[#d1d1db] flex items-center justify-between text-xs text-[#6c6c89]">
              <div>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{" "}
                clients
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-[#d1d1db] bg-white hover:bg-[#f7f7f8] disabled:opacity-40 text-[#121217]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[#121217] font-semibold">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-[#d1d1db] bg-white hover:bg-[#f7f7f8] disabled:opacity-40 text-[#121217]"
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
