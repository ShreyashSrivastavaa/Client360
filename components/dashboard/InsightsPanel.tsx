import React from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
} from "lucide-react";
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

  const getIcon = (type: string) => {
    switch (type) {
      case "danger":
        return <AlertCircle className="w-4 h-4 text-[#d1255c] shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-[#faae33] shrink-0 mt-0.5" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-[#faae33] shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-[#faae33]/80 shrink-0 mt-0.5" />;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-[#281006] border-[#d1255c]";
      case "warning":
        return "bg-[#281006] border-[#faae33]";
      case "success":
        return "bg-[#281006] border-[#9f531b]";
      default:
        return "bg-[#281006] border-[#6b2e12]";
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-[6px] bg-[#402011] border border-[#6b2e12]">
      <div className="flex items-center justify-between pb-3 border-b border-[#6b2e12]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-full bg-[#281006] text-[#faae33] border border-[#6b2e12]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-salmond font-bold text-[#faae33] tracking-wider uppercase">
              DIAGNOSTIC INSIGHTS & ALERTS
            </h3>
            <p className="text-xs text-[#faae33]/70 font-graphikx">Automated margin rules calculated over current portfolio data</p>
          </div>
        </div>
        <span className="text-xs font-salmond uppercase tracking-wider text-[#faae33]/60">
          {insights.length} {insights.length === 1 ? "RULE" : "RULES"} TRIGGERED
        </span>
      </div>

      <div className="space-y-3 mt-4">
        {insights.length === 0 ? (
          <div className="py-8 text-center text-xs font-salmond uppercase text-[#faae33]/60">
            No active alerts detected. All clients meet configured margin criteria.
          </div>
        ) : (
          insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-[6px] border ${getCardStyle(insight.type)} flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all`}
            >
              <div className="flex items-start gap-3 min-w-0">
                {getIcon(insight.type)}
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#faae33] uppercase font-salmond tracking-wider">
                      {insight.title}
                    </h4>
                    {insight.metric && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-salmond bg-[#281006] border border-[#6b2e12] text-[#faae33]">
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#faae33]/80 leading-relaxed font-graphikx">
                    {insight.description}
                  </p>
                </div>
              </div>

              {insight.actionUrl && (
                <Link
                  href={insight.actionUrl}
                  className="btn-ghost-outline self-start sm:self-center shrink-0 flex items-center gap-1.5 text-xs font-salmond tracking-wider py-1 px-3"
                >
                  <span>{insight.actionText?.toUpperCase() || "VIEW DRILLDOWN"}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
