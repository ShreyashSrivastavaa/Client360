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
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "danger":
        return "bg-rose-500/10 border-rose-500/30 text-rose-300";
      case "warning":
        return "bg-amber-500/10 border-amber-500/30 text-amber-300";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
      default:
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-300";
    }
  };

  return (
    <div className="glass-panel p-5 rounded-xl border border-zinc-800/80">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Profitability Insights & Alerts</h3>
            <p className="text-xs text-zinc-400">Automated diagnostic rules calculated over period data</p>
          </div>
        </div>
        <span className="text-[11px] font-medium text-zinc-400">
          {insights.length} active alerts
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all hover:border-zinc-600/80 ${getBadgeStyle(
              item.type
            )}`}
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                {getIcon(item.type)}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white tracking-tight leading-snug">
                    {item.title}
                  </h4>
                  {item.metric && (
                    <span className="inline-block mt-0.5 text-[11px] font-mono font-semibold px-1.5 py-0.2 bg-black/40 rounded border border-white/10 text-white">
                      {item.metric}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-zinc-300 leading-relaxed pl-6">
                {item.description}
              </p>
            </div>

            {item.actionText && item.actionUrl && (
              <div className="pt-3 pl-6 mt-2 border-t border-white/10">
                <Link
                  href={item.actionUrl}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white hover:text-indigo-300 transition-colors"
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
