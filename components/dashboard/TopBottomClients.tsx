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

  const maxTopProfit = Math.max(1, ...(topClients.map((c) => c.profit) || [1]));
  const maxBottomAbsProfit = Math.max(1, ...(bottomClients.map((c) => Math.abs(c.profit)) || [1]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Most Profitable Clients */}
      <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#d1d1db]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#1e874c]/10 text-[#1e874c]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#121217]">Top 5 Most Profitable Accounts</h3>
              <p className="text-xs text-[#6c6c89]">Highest gross profit generation in period</p>
            </div>
          </div>
          <Link
            href="/clients?sort=profit_desc"
            className="text-xs text-[#5423e7] hover:text-[#4518cc] flex items-center gap-1 font-semibold"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 mt-4">
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6c6c89]">
              No clients found for this period.
            </div>
          ) : (
            topClients.map((client, idx) => {
              const widthPct = Math.max(8, Math.min(100, (client.profit / maxTopProfit) * 100));
              return (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="group block p-3 rounded-2xl hover:bg-[#f7f7f8] border border-transparent hover:border-[#d1d1db] transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold text-[#6c6c89] w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-[#121217] group-hover:text-[#5423e7] truncate">
                        {client.name}
                      </span>
                      <ClassificationBadge classification={client.classification} showDot={false} />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[#6c6c89] tabular-nums text-[11px] font-medium">
                        {formatPercent(client.marginPercent)}
                      </span>
                      <span className="font-bold text-[#1e874c] tabular-nums">
                        {formatCurrency(client.profit)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2 bg-[#f7f7f8] border border-[#d1d1db] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1e874c] rounded-full transition-all duration-500"
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
      <div className="p-6 sm:p-8 rounded-[32px] bg-white border border-[#d1d1db] shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#d1d1db]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#d50b3e]/10 text-[#d50b3e]">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-[#121217]">Bottom 5 Least Profitable Accounts</h3>
              <p className="text-xs text-[#6c6c89]">Lowest margin and loss-making accounts</p>
            </div>
          </div>
          <Link
            href="/clients?status=loss_making"
            className="text-xs text-[#d50b3e] hover:text-[#b00832] flex items-center gap-1 font-semibold"
          >
            <span>Review Losses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3 mt-4">
          {bottomClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#6c6c89]">
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
                  className="group block p-3 rounded-2xl hover:bg-[#f7f7f8] border border-transparent hover:border-[#d1d1db] transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[11px] font-bold text-[#6c6c89] w-4">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-[#121217] group-hover:text-[#d50b3e] truncate">
                        {client.name}
                      </span>
                      <ClassificationBadge classification={client.classification} showDot={false} />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[#6c6c89] tabular-nums text-[11px] font-medium">
                        {formatPercent(client.marginPercent)}
                      </span>
                      <span
                        className={`font-bold tabular-nums ${
                          isLoss ? "text-[#d50b3e]" : "text-[#996500]"
                        }`}
                      >
                        {formatCurrency(client.profit)}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full h-2 bg-[#f7f7f8] border border-[#d1d1db] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLoss ? "bg-[#d50b3e]" : "bg-[#ffc233]"
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
