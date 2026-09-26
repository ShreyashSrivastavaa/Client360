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
import { apiFetch } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { Sparkles, UploadCloud, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { period, customStart, customEnd } = usePeriod();
  const { user, organization, isLoading: authLoading } = useAuth();
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
    }${customEnd ? `&end=${customEnd}` : ""}`;

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
  }, [organization, period, customStart, customEnd]);

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
      pageTitle="Executive Dashboard"
      pageDescription="Single source of truth for client margins, gross profit, and cost accounting"
    >
      <div className="space-y-6">
        {/* Fetch Error Banner with Retry */}
        {fetchError && (
          <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between text-xs text-rose-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Zero Data Empty State */}
        {hasZeroData ? (
          <div className="glass-panel p-10 rounded-2xl border border-zinc-800 text-center max-w-2xl mx-auto my-12 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto shadow-xl">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Welcome to ProfitLens!
              </h2>
              <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                You haven&apos;t imported any financial data yet. Explore your dashboard immediately
                with our realistic 12-month sample dataset, or upload your own CSV.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleLoadDemo}
                disabled={isSeeding}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSeeding ? "Loading Demo..." : "Explore with Sample Data"}</span>
              </button>
              <Link
                href="/uploads"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload CSV Data</span>
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
