"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { KpiCards, DashboardSummaryData } from "@/components/dashboard/KpiCards";
import { TrendCharts, MonthlyTrendData } from "@/components/dashboard/TrendCharts";
import { TopBottomClients, RankedClient } from "@/components/dashboard/TopBottomClients";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { RecentUploadsWidget, UploadSummaryItem } from "@/components/dashboard/RecentUploadsWidget";
import { usePeriod } from "@/lib/period-context";
import { useAuth } from "@/lib/auth-context";
import { useCurrency } from "@/lib/currency-context";
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { Sparkles, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { period, customStart, customEnd } = usePeriod();
  const { organization } = useAuth();
  const { currency } = useCurrency();
  const { success, error } = useToast();

  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [trends, setTrends] = useState<MonthlyTrendData[]>([]);
  const [topClients, setTopClients] = useState<RankedClient[]>([]);
  const [bottomClients, setBottomClients] = useState<RankedClient[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    if (!organization) return;
    setLoading(true);
    setFetchError(null);

    const query = `range=${period}${
      customStart ? `&start=${customStart}` : ""
    }${customEnd ? `&end=${customEnd}` : ""}&currency=${currency}`;

    try {
      const [summaryRes, trendsRes, topBottomRes, insightsRes, uploadsRes] =
        await Promise.all([
          apiFetch<DashboardSummaryData>(`/api/dashboard/summary?${query}`),
          apiFetch<MonthlyTrendData[]>(`/api/dashboard/trends?${query}`),
          apiFetch<{ topClients: RankedClient[]; bottomClients: RankedClient[] }>(
            `/api/dashboard/top-bottom-clients?${query}&limit=5`
          ),
          apiFetch<any[]>(`/api/dashboard/insights?${query}`),
          apiFetch<UploadSummaryItem[]>(`/api/uploads?limit=3`),
        ]);

      setSummary(summaryRes);
      setTrends(trendsRes);
      setTopClients(topBottomRes.topClients || []);
      setBottomClients(topBottomRes.bottomClients || []);
      setInsights(insightsRes || []);
      setRecentUploads(uploadsRes || []);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setFetchError(err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, [organization, period, customStart, customEnd, currency]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLoadDemo = async () => {
    setIsSeeding(true);
    try {
      await apiFetch("/api/demo/load", { method: "POST" });
      success("Sample demo data loaded successfully!");
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || "Failed to load demo data");
    } finally {
      setIsSeeding(false);
    }
  };

  const hasZeroData = !loading && summary && summary.totalRevenue === 0 && summary.activeClientsCount === 0;

  return (
    <AppShell
      eyebrow="EXECUTIVE OVERVIEW"
      pageTitle="Portfolio Profitability"
      pageDescription="Account-level gross margins, cost attribution, and drain detection across active clients."
    >
      <div className="space-y-6">
        {/* Fetch Error Banner with Retry */}
        {fetchError && (
          <div className="p-3 rounded-[4px] border border-[#e11d48] bg-white flex items-center justify-between text-xs text-[#e11d48]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="btn-secondary text-xs py-1 px-2.5"
            >
              Retry
            </button>
          </div>
        )}

        {/* Zero Data Empty State */}
        {hasZeroData ? (
          <div className="p-12 rounded-[4px] border border-[#e0e0e0] bg-white text-center max-w-xl mx-auto my-12 space-y-4">
            <span className="w-3 h-3 rounded-full bg-[#7451f2] inline-block" />
            <div className="space-y-2">
              <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585]">
                EMPTY LEDGER
              </div>
              <h2 className="font-serif text-2xl text-[#272727] font-normal">
                Blank spreadsheet ready
              </h2>
              <p className="text-sm text-[#5d5d5d] max-w-sm mx-auto leading-relaxed">
                You haven&apos;t imported any financial data yet. Explore your dashboard immediately
                with our realistic 12-month sample dataset, or upload your own CSV.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <button
                onClick={handleLoadDemo}
                disabled={isSeeding}
                className="btn-primary w-full sm:w-auto text-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSeeding ? "Loading Demo..." : "Explore with sample data"}</span>
              </button>
              <Link
                href="/uploads"
                className="btn-secondary w-full sm:w-auto text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Upload CSV ledger</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Top KPI Cards Row */}
            <KpiCards data={summary} isLoading={loading} />

            {/* Monthly Trend Charts & Client Distribution */}
            <TrendCharts
              trends={trends}
              distribution={summary?.distribution || null}
              isLoading={loading}
            />

            {/* Top 5 Most Profitable & Bottom 5 Least Profitable */}
            <TopBottomClients
              topClients={topClients}
              bottomClients={bottomClients}
              isLoading={loading}
            />

            {/* Rule-Based Insights Engine Panel */}
            <InsightsPanel insights={insights} isLoading={loading} />

            {/* Recent Uploads Widget */}
            <RecentUploadsWidget uploads={recentUploads} isLoading={loading} />
          </>
        )}
      </div>
    </AppShell>
  );
}
