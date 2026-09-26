import React from "react";
import Link from "next/link";
import { ArrowUpRight, AlertOctagon, Trophy } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ClassificationBadge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";

export interface RankedClient {
  id: string;
  name: string;
  externalReference: string | null;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number | null;
  classification: string;
}

interface TopBottomClientsProps {
  topClients: RankedClient[];
  bottomClients: RankedClient[];
  isLoading: boolean;
}

export function TopBottomClients({ topClients, bottomClients, isLoading }: TopBottomClientsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  // Calculate max profit for proportional bar width
  const maxTopProfit = Math.max(1, ...(topClients.map((c) => c.profit) || [1]));
  const maxBottomAbsProfit = Math.max(1, ...(bottomClients.map((c) => Math.abs(c.profit)) || [1]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Most Profitable Clients */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Top 5 Most Profitable Clients</h3>
              <p className="text-xs text-zinc-400">Highest gross profit generation in period</p>
            </div>
          </div>
          <Link
            href="/clients?sort=profit_desc"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 mt-4">
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No clients found for this period.
            </div>
          ) : (
            topClients.map((client, idx) => {
              const widthPct = Math.max(8, Math.min(100, (client.profit / maxTopProfit) * 100));
              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="group block p-2.5 rounded-lg hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/60 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold text-zinc-400 w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-200 group-hover:text-indigo-300 truncate">
                        {client.name}
                      </span>
                      <ClassificationBadge classification={client.classification} showDot={false} />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-zinc-400 tabular-nums text-[11px]">
                        {formatPercent(client.marginPercent)}
                      </span>
                      <span className="font-bold text-emerald-400 tabular-nums">
                        {formatCurrency(client.profit)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom 5 Least Profitable Clients */}
      <div className="glass-panel p-5 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Bottom 5 Least Profitable Clients</h3>
              <p className="text-xs text-zinc-400">Lowest and negative profit accounts</p>
            </div>
          </div>
          <Link
            href="/clients?status=loss_making"
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium"
          >
            <span>Review Losses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 mt-4">
          {bottomClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              No clients found for this period.
            </div>
          ) : (
            bottomClients.map((client, idx) => {
              const isLoss = client.profit < 0;
              const widthPct = Math.max(8, Math.min(100, (Math.abs(client.profit) / maxBottomAbsProfit) * 100));
              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="group block p-2.5 rounded-lg hover:bg-zinc-800/50 border border-transparent hover:border-zinc-700/60 transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold text-zinc-400 w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-zinc-200 group-hover:text-rose-300 truncate">
                        {client.name}
                      </span>
                      <ClassificationBadge classification={client.classification} showDot={false} />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-zinc-400 tabular-nums text-[11px]">
                        {formatPercent(client.marginPercent)}
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          isLoss ? "text-rose-400" : "text-amber-400"
                        }`}
                      >
                        {formatCurrency(client.profit)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLoss
                          ? "bg-gradient-to-r from-rose-600 to-rose-400"
                          : "bg-gradient-to-r from-amber-600 to-amber-400"
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
