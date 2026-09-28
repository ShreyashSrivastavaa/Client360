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
        return "#e11d48"; // Rose
      case "warning":
        return "#f59e0b"; // Amber
      case "success":
        return "#7451f2"; // Iris Violet
      default:
        return "#0072c6"; // Cobalt Info
    }
  };

  return (
    <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0]">
      <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
            DIAGNOSTIC ENGINE
          </div>
          <h3 className="font-serif text-xl text-[#272727] tracking-tight">
            Financial Health & Rule Signals
          </h3>
          <p className="text-xs text-[#5d5d5d]">Automated margin diagnostics calculated over active ledger portfolio</p>
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] tabular-nums bg-[#f6f6f6] px-2.5 py-1 rounded-[100px] border border-[#e0e0e0]">
          {insights.length} {insights.length === 1 ? "signal active" : "signals active"}
        </span>
      </div>

      <div className="space-y-2.5 mt-4">
        {insights.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#858585]">
            No active alerts detected. All clients meet configured margin criteria.
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-[4px] border border-[#e0e0e0] bg-[#ffffff] hover:bg-[#f6f6f6] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: getDotColor(insight.type) }}
                />
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-semibold text-[#272727]">
                    {insight.title}
                  </div>
                  <div className="text-xs text-[#5d5d5d] leading-relaxed">
                    {insight.description}
                  </div>
                  {insight.metric && (
                    <div className="font-mono text-[11px] text-[#7451f2] font-medium tracking-[0.22px] pt-0.5">
                      Impact: {insight.metric}
                    </div>
                  )}
                </div>
              </div>

              {insight.actionUrl && (
                <Link
                  href={insight.actionUrl}
                  className="btn-secondary text-xs shrink-0 self-start sm:self-center"
                >
                  <span>{insight.actionText || "Inspect"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
