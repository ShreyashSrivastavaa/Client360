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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 5 Most Profitable Clients */}
      <div className="p-6 sm:p-8 rounded-[6px] bg-[#402011] border border-[#6b2e12] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#6b2e12]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#281006] text-[#faae33] border border-[#6b2e12]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-salmond font-bold text-[#faae33] tracking-wider uppercase">
                TOP 5 PROFITABLE ACCOUNTS
              </h3>
              <p className="text-xs text-[#faae33]/70 font-graphikx">Highest gross profit contributors</p>
            </div>
          </div>
          <Link
            href="/clients?sort=profit_desc"
            className="text-xs font-salmond uppercase tracking-wider text-[#faae33] hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#6b2e12] my-2">
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-xs font-salmond uppercase text-[#faae33]/60">
              No profitable accounts in this period
            </div>
          ) : (
            topClients.map((c, i) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-salmond font-bold text-[#faae33]/60">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/clients/${c.id}`}
                      className="text-xs font-bold text-[#faae33] hover:underline truncate block"
                    >
                      {c.name}
                    </Link>
                    <span className="text-[11px] text-[#faae33]/60 font-graphikx">
                      {formatCurrency(c.revenue)} rev • {formatPercent(c.marginPercent)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-salmond font-bold text-[#faae33] tabular-nums">
                    +{formatCurrency(c.profit)}
                  </div>
                  <ClassificationBadge classification={c.classification} showDot={false} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom 5 Clients (Loss Makers / Drains) */}
      <div className="p-6 sm:p-8 rounded-[6px] bg-[#402011] border border-[#6b2e12] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#6b2e12]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-[#281006] text-[#d1255c] border border-[#6b2e12]">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-salmond font-bold text-[#faae33] tracking-wider uppercase">
                BOTTOM 5 ACCOUNTS / DRAINS
              </h3>
              <p className="text-xs text-[#faae33]/70 font-graphikx">Lowest margin or loss-making clients</p>
            </div>
          </div>
          <Link
            href="/clients?sort=profit_asc"
            className="text-xs font-salmond uppercase tracking-wider text-[#faae33] hover:underline flex items-center gap-1"
          >
            <span>VIEW ALL</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#6b2e12] my-2">
          {bottomClients.length === 0 ? (
            <div className="py-8 text-center text-xs font-salmond uppercase text-[#faae33]/60">
              No bottom or loss accounts in this period
            </div>
          ) : (
            bottomClients.map((c, i) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs font-salmond font-bold text-[#d1255c]/80">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/clients/${c.id}`}
                      className="text-xs font-bold text-[#faae33] hover:underline truncate block"
                    >
                      {c.name}
                    </Link>
                    <span className="text-[11px] text-[#faae33]/60 font-graphikx">
                      {formatCurrency(c.revenue)} rev • {formatPercent(c.marginPercent)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-sm font-salmond font-bold tabular-nums ${
                      c.profit < 0 ? "text-[#d1255c]" : "text-[#faae33]"
                    }`}
                  >
                    {c.profit < 0 ? `-${formatCurrency(Math.abs(c.profit))}` : formatCurrency(c.profit)}
                  </div>
                  <ClassificationBadge classification={c.classification} showDot={false} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
