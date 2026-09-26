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
        return <AlertCircle className="w-4 h-4 text-[#d50b3e] shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-[#996500] shrink-0 mt-0.5" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-[#1e874c] shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-[#5423e7] shrink-0 mt-0.5" />;
    }
  };

  const getCardStyle = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-[#d50b3e]/5 border-[#d50b3e]/30";
      case "warning":
        return "bg-[#ffc233]/15 border-[#ffc233]/50";
      case "success":
        return "bg-[#1e874c]/5 border-[#1e874c]/30";
      default:
        return "bg-[#5423e7]/5 border-[#5423e7]/30";
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#d1d1db]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#5423e7]/10 text-[#5423e7]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-display font-bold text-[#121217]">Diagnostic Insights & Alerts</h3>
            <p className="text-xs text-[#6c6c89]">Automated margin rules calculated over current portfolio data</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-[#6c6c89]">
          {insights.length} active alerts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-sm ${getCardStyle(
              item.type
            )}`}
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2.5">
                {getIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#121217] tracking-tight leading-snug">
                    {item.title}
                  </h4>
                  {item.metric && (
                    <span className="inline-block mt-1 text-[11px] font-bold font-mono px-2 py-0.5 bg-white rounded-md border border-[#d1d1db] text-[#121217]">
                      {item.metric}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-[#6c6c89] leading-relaxed pl-6">
                {item.description}
              </p>
            </div>

            {item.actionText && item.actionUrl && (
              <div className="pt-3 pl-6 mt-2 border-t border-[#d1d1db]">
                <Link
                  href={item.actionUrl}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#121217] hover:text-[#5423e7] transition-colors"
                >
                  <span>{item.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
