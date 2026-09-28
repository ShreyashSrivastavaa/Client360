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
      <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
              GROWTH DRIVERS
            </div>
            <h3 className="font-serif text-xl text-[#272727] tracking-tight">
              Top Profitable Accounts
            </h3>
            <p className="text-xs text-[#5d5d5d]">Highest gross margin contributors</p>
          </div>
          <Link
            href="/clients?sort=profit_desc"
            className="btn-ghost text-xs"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        <div className="divide-y divide-[#e0e0e0] my-2">
          {topClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#858585]">
              No profitable accounts in this period
            </div>
          ) : (
            topClients.map((client, index) => (
              <div
                key={client.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-[#f6f6f6] px-2 rounded-[4px] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[11px] text-[#858585] w-4">
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-sm font-semibold text-[#272727] hover:text-[#7451f2] truncate block transition-colors"
                    >
                      {client.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[#858585] mt-0.5">
                      <span>Rev: {formatCurrency(client.revenue, true)}</span>
                      <span>•</span>
                      <span>Cost: {formatCurrency(client.cost, true)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <div className="text-sm font-semibold text-[#16a34a] tabular-nums font-mono">
                      +{formatCurrency(client.profit, true)}
                    </div>
                    <div className="text-[11px] text-[#858585] tabular-nums font-mono">
                      {formatPercent(client.marginPercent)} margin
                    </div>
                  </div>
                  <ClassificationBadge
                    classification={client.classification}
                    className="hidden sm:inline-flex"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-[#e0e0e0] text-xs text-[#858585] flex items-center justify-between">
          <span>Target threshold: ≥ 20.0% gross margin</span>
          <Link
            href="/clients?filter=profitable"
            className="text-[#7451f2] hover:underline"
          >
            Audit cohort
          </Link>
        </div>
      </div>

      {/* Bottom 5 Margin Accounts */}
      <div className="p-6 rounded-[4px] bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-[#e0e0e0]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22px] text-[#858585] mb-0.5">
              ATTENTION REQUIRED
            </div>
            <h3 className="font-serif text-xl text-[#272727] tracking-tight">
              Lowest Margin & Loss Accounts
            </h3>
            <p className="text-xs text-[#5d5d5d]">Accounts draining gross profitability</p>
          </div>
          <Link
            href="/clients?sort=margin_asc"
            className="btn-ghost text-xs"
          >
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        <div className="divide-y divide-[#e0e0e0] my-2">
          {bottomClients.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#858585]">
              No low-margin accounts identified
            </div>
          ) : (
            bottomClients.map((client, index) => (
              <div
                key={client.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-[#f6f6f6] px-2 rounded-[4px] transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-[11px] text-[#858585] w-4">
                    {index + 1}.
                  </span>
                  <div className="min-w-0">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-sm font-semibold text-[#272727] hover:text-[#7451f2] truncate block transition-colors"
                    >
                      {client.name}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-[#858585] mt-0.5">
                      <span>Rev: {formatCurrency(client.revenue, true)}</span>
                      <span>•</span>
                      <span>Cost: {formatCurrency(client.cost, true)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <div
                      className={`text-sm font-semibold tabular-nums font-mono ${
                        client.profit >= 0 ? "text-[#272727]" : "text-[#e11d48]"
                      }`}
                    >
                      {client.profit >= 0 ? "+" : ""}
                      {formatCurrency(client.profit, true)}
                    </div>
                    <div
                      className={`text-[11px] tabular-nums font-mono ${
                        client.marginPercent !== null && client.marginPercent < 5
                          ? "text-[#e11d48] font-semibold"
                          : "text-[#858585]"
                      }`}
                    >
                      {formatPercent(client.marginPercent)} margin
                    </div>
                  </div>
                  <ClassificationBadge
                    classification={client.classification}
                    className="hidden sm:inline-flex"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-[#e0e0e0] text-xs text-[#858585] flex items-center justify-between">
          <span>Critical threshold: &lt; 5.0% gross margin</span>
          <Link
            href="/clients?filter=loss_making"
            className="text-[#e11d48] hover:underline"
          >
            Review loss accounts
          </Link>
        </div>
      </div>
    </div>
  );
}
