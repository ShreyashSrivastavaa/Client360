import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InsightItem } from "@/lib/insights/engine";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface InsightsPanelProps {
  insights: InsightItem[];
  isLoading: boolean;
}

export function InsightsPanel({ insights, isLoading }: InsightsPanelProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  const getDotColor = (type: string) => {
    switch (type) {
      case "danger":
        return "#e11d48"; // Soft red
      case "warning":
        return "#fbbf24"; // Amber
      case "success":
        return "#34d399"; // Mint
      default:
        return "#38bdf8"; // Sky Blue
    }
  };

  return (
    <div className="p-6 rounded-[8px] bg-white border border-[#eaeaea]">
      <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
        <div>
          <h3 className="text-sm font-bold text-[#1a1a1a]">
            Diagnostic Insights & Rule Engine
          </h3>
          <p className="text-xs text-[#838383]">Automated margin rules calculated over current portfolio data</p>
        </div>
        <span className="text-xs text-[#838383] tabular-nums">
          {insights.length} {insights.length === 1 ? "rule" : "rules"} active
        </span>
      </div>

      <div className="space-y-2 mt-4">
        {insights.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#838383]">
            No active alerts detected. All clients meet configured margin criteria.
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="p-3.5 rounded-[4px] border border-[#eaeaea] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="w-[6px] h-[6px] rounded-full shrink-0 mt-2"
                  style={{ backgroundColor: getDotColor(insight.type) }}
                />
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#1a1a1a]">
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <span className="px-1.5 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-[0.21px] bg-[#f7f7f7] border border-[#eaeaea] text-[#6f6f6f] tabular-nums">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6f6f6f] leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>

              {insight.actionUrl && (
                <Link
                  href={insight.actionUrl}
                  className="btn-rows-ghost text-xs shrink-0 self-start sm:self-center"
                >
                  <span>{insight.actionText || "Inspect"}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
