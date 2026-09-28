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
      return <span className="text-[10px] text-[#838383]">—</span>;
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 64;
    const height = 16;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

    const strokeColor = isLoss ? "#e11d48" : "#16a34a";

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
        <div className="p-4 rounded-[8px] bg-white border border-[#eaeaea] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#838383] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-rows-default w-full pl-8 pr-7 py-1.5 text-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#838383] hover:text-[#1a1a1a]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Classification Filter Tabs — 4px radius, 1px Ash border, no pills */}
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
                className={`px-2.5 py-1.5 rounded-[4px] text-xs transition-colors whitespace-nowrap ${
                  statusFilter === tab.key
                    ? "border border-[#1a1a1a] bg-white text-[#1a1a1a] font-bold"
                    : "border border-[#eaeaea] bg-white text-[#6f6f6f] hover:text-[#1a1a1a] hover:border-[#838383]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clients Table Card — 8px radius, hairline dividers, tabular density */}
        <div className="rounded-[8px] bg-white border border-[#eaeaea] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f7f7f7] border-b border-[#eaeaea] text-rows-caption">
                <tr>
                  <th className="py-2.5 px-4">
                    <button
                      onClick={() => handleSortToggle("name")}
                      className="flex items-center gap-1 hover:text-[#1a1a1a]"
                    >
                      <span>Client Account</span>
                      <ArrowUpDown className="w-3 h-3 text-[#838383]" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("revenue")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#1a1a1a]"
                    >
                      <span>Revenue</span>
                      <ArrowUpDown className="w-3 h-3 text-[#838383]" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("cost")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#1a1a1a]"
                    >
                      <span>Total Cost</span>
                      <ArrowUpDown className="w-3 h-3 text-[#838383]" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("profit")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#1a1a1a]"
                    >
                      <span>Gross Profit</span>
                      <ArrowUpDown className="w-3 h-3 text-[#838383]" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => handleSortToggle("margin")}
                      className="flex items-center gap-1 justify-end ml-auto hover:text-[#1a1a1a]"
                    >
                      <span>Margin %</span>
                      <ArrowUpDown className="w-3 h-3 text-[#838383]" />
                    </button>
                  </th>
                  <th className="py-2.5 px-4 text-center">Classification</th>
                  <th className="py-2.5 px-4 text-center">Trend (6mo)</th>
                  <th className="py-2.5 px-4 text-right">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e1e1e1]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-4">
                      <TableSkeleton rows={6} cols={8} />
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-xs text-[#838383]">
                      <div className="space-y-2">
                        <div className="text-sm font-bold text-[#1a1a1a]">
                          No client accounts found
                        </div>
                        <p className="max-w-sm mx-auto">
                          {searchTerm || statusFilter !== "all"
                            ? "Try adjusting your search query or status filter."
                            : "No clients recorded for this period. Upload a CSV or load demo data."}
                        </p>
                        {(searchTerm || statusFilter !== "all") && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              setStatusFilter("all");
                            }}
                            className="btn-rows-outlined text-xs mt-2"
                          >
                            Clear filters
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
                        className="hover:bg-[#f7f7f7] transition-colors group cursor-pointer"
                      >
                        <td className="py-3 px-4">
                          <Link href={`/clients/${client.id}`} className="block">
                            <div className="font-bold text-[#1a1a1a] hover:underline">
                              {client.name}
                            </div>
                            {client.externalReference && (
                              <div className="text-[10px] text-[#838383] font-mono">
                                {client.externalReference}
                              </div>
                            )}
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-right tabular-nums text-[#1a1a1a] font-normal">
                          <Link href={`/clients/${client.id}`} className="block">
                            {formatCurrency(client.totalRevenue)}
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-right tabular-nums text-[#6f6f6f]">
                          <Link href={`/clients/${client.id}`} className="block">
                            {formatCurrency(client.totalCost)}
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-right tabular-nums font-bold">
                          <Link href={`/clients/${client.id}`} className="block">
                            <span className={isLoss ? "text-[#e11d48]" : "text-[#16a34a]"}>
                              {formatCurrency(client.grossProfit)}
                            </span>
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-right tabular-nums font-medium">
                          <Link href={`/clients/${client.id}`} className="block">
                            <span
                              className={
                                client.marginPercent !== null && client.marginPercent >= 20
                                  ? "text-[#16a34a]"
                                  : client.marginPercent !== null && client.marginPercent >= 5
                                  ? "text-[#d97706]"
                                  : "text-[#e11d48]"
                              }
                            >
                              {formatPercent(client.marginPercent)}
                            </span>
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <Link href={`/clients/${client.id}`} className="inline-block">
                            <ClassificationBadge classification={client.classification} />
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <Link
                            href={`/clients/${client.id}`}
                            className="flex justify-center items-center"
                          >
                            {renderSparkline(client.sparkline, isLoss)}
                          </Link>
                        </td>

                        <td className="py-3 px-4 text-right text-[#838383] text-[11px] tabular-nums">
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
            <div className="p-3 border-t border-[#eaeaea] bg-white flex items-center justify-between text-xs text-[#838383]">
              <div>
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{" "}
                clients
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-[4px] border border-[#eaeaea] bg-white hover:bg-[#f7f7f7] disabled:opacity-40 text-[#1a1a1a]"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[#1a1a1a] font-normal tabular-nums">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-[4px] border border-[#eaeaea] bg-white hover:bg-[#f7f7f7] disabled:opacity-40 text-[#1a1a1a]"
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
