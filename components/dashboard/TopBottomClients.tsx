import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <div className="p-6 rounded-[8px] bg-white border border-[#eaeaea] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
          <div>
            <h3 className="text-sm font-bold text-[#1a1a1a]">
              Top 5 Profitable Accounts
            </h3>
            <p className="text-xs text-[#838383]">Highest gross profit contributors</p>
          </div>
          <Link
            href="/clients?sort=profit_desc"
            className="btn-rows-ghost text-xs font-normal"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        <div className="divide-y divide-[#eaeaea] my-1">
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#838383]">
              No profitable accounts in this period
            </div>
          ) : (
            topClients.map((c, i) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs text-[#838383] tabular-nums">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/clients/${c.id}`}
                      className="text-sm font-normal text-[#1a1a1a] hover:underline truncate block"
                    >
                      {c.name}
                    </Link>
                    <span className="text-xs text-[#838383] tabular-nums">
                      {formatCurrency(c.revenue)} rev • {formatPercent(c.marginPercent)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#16a34a] tabular-nums">
                    +{formatCurrency(c.profit)}
                  </div>
                  <ClassificationBadge classification={c.classification} showDot={true} className="mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom 5 Clients (Loss Makers / Drains) */}
      <div className="p-6 rounded-[8px] bg-white border border-[#eaeaea] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#eaeaea]">
          <div>
            <h3 className="text-sm font-bold text-[#1a1a1a]">
              Bottom 5 Drain Accounts
            </h3>
            <p className="text-xs text-[#838383]">Accounts eroding net operating margin</p>
          </div>
          <Link
            href="/clients?sort=profit_asc"
            className="btn-rows-ghost text-xs font-normal"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        <div className="divide-y divide-[#eaeaea] my-1">
          {bottomClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#838383]">
              No loss-making accounts detected
            </div>
          ) : (
            bottomClients.map((c, i) => (
              <div key={c.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 text-center text-xs text-[#838383] tabular-nums">
                    #{i + 1}
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/clients/${c.id}`}
                      className="text-sm font-normal text-[#1a1a1a] hover:underline truncate block"
                    >
                      {c.name}
                    </Link>
                    <span className="text-xs text-[#838383] tabular-nums">
                      {formatCurrency(c.revenue)} rev • {formatPercent(c.marginPercent)}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#e11d48] tabular-nums">
                    {formatCurrency(c.profit)}
                  </div>
                  <ClassificationBadge classification={c.classification} showDot={true} className="mt-1" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
