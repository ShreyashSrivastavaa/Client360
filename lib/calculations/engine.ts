import { prisma } from "../db";

export type Classification = "profitable" | "low_margin" | "loss_making" | "no_revenue";

export interface Thresholds {
  profitableMarginThreshold: number;
  lowMarginThreshold: number;
}

export interface ClientMarginMetrics {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  marginPercent: number | null;
  classification: Classification;
}

/**
 * Pure, authoritative function for gross profit, margin percentage, and classification.
 * Handles all edge cases:
 * - Zero revenue + zero costs -> 0 profit, null margin, "no_revenue"
 * - Zero revenue + positive costs -> negative profit, null margin, "loss_making"
 * - Negative revenue (refunds) -> negative profit, negative margin, "loss_making"
 * - Positive revenue with zero or positive costs -> standard formula with boundary checks
 */
export function calculateClientMetrics(
  totalRevenue: number,
  totalCost: number,
  thresholds: Thresholds
): ClientMarginMetrics {
  const round2 = (val: number) => Math.round(val * 100) / 100;
  const rev = round2(totalRevenue);
  const cost = round2(totalCost);
  const grossProfit = round2(rev - cost);

  // Edge case 1: Zero revenue
  if (rev === 0) {
    if (cost > 0) {
      return {
        totalRevenue: 0,
        totalCost: cost,
        grossProfit,
        marginPercent: null,
        classification: "loss_making", // Only costs incurred, pure loss
      };
    }
    return {
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      marginPercent: null,
      classification: "no_revenue",
    };
  }

  // Edge case 2: Negative revenue (e.g. net refunds or credit notes)
  if (rev < 0) {
    return {
      totalRevenue: rev,
      totalCost: cost,
      grossProfit,
      marginPercent: -100,
      classification: "loss_making",
    };
  }

  // Standard case: Positive revenue
  const rawMargin = (grossProfit / rev) * 100;
  const marginPercent = Math.round(rawMargin * 100) / 100;

  const classification = determineClassification(marginPercent, rev, thresholds);

  return {
    totalRevenue: rev,
    totalCost: cost,
    grossProfit,
    marginPercent,
    classification,
  };
}

/**
 * Pure function to classify a client or period based on margin percentage and revenue
 */
export function determineClassification(
  marginPercent: number | null,
  totalRevenue: number,
  thresholds: Thresholds
): Classification {
  if (totalRevenue === 0 && marginPercent === null) {
    return "no_revenue";
  }
  if (totalRevenue < 0 || (marginPercent !== null && marginPercent < thresholds.lowMarginThreshold)) {
    return "loss_making";
  }
  if (marginPercent === null) {
    return "loss_making";
  }
  if (marginPercent >= thresholds.profitableMarginThreshold) {
    return "profitable";
  }
  if (marginPercent >= thresholds.lowMarginThreshold) {
    return "low_margin";
  }
  return "loss_making";
}

/**
 * Formats a Date object to the first day of that month (UTC normalized)
 */
export function getMonthBucket(date: Date): Date {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

/**
 * Idempotently recalculates all client_period_summaries for an organization
 */
export async function recalculateClientSummaries(organizationId: string): Promise<void> {
  // 1. Fetch organization thresholds
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { profitableMarginThreshold: true, lowMarginThreshold: true },
  });

  if (!org) return;

  const thresholds: Thresholds = {
    profitableMarginThreshold: org.profitableMarginThreshold,
    lowMarginThreshold: org.lowMarginThreshold,
  };

  // 2. Fetch all transactions for this org
  const transactions = await prisma.transaction.findMany({
    where: { organizationId },
    select: {
      clientId: true,
      transactionDate: true,
      type: true,
      amount: true,
    },
  });

  // 3. Group transactions by (clientId, YYYY-MM-01)
  const map = new Map<
    string,
    {
      clientId: string;
      periodStartDate: Date;
      totalRevenue: number;
      totalCost: number;
    }
  >();

  for (const tx of transactions) {
    const bucket = getMonthBucket(tx.transactionDate);
    const key = `${tx.clientId}___${bucket.toISOString()}`;

    let item = map.get(key);
    if (!item) {
      item = {
        clientId: tx.clientId,
        periodStartDate: bucket,
        totalRevenue: 0,
        totalCost: 0,
      };
      map.set(key, item);
    }

    if (tx.type.toLowerCase() === "revenue") {
      item.totalRevenue += tx.amount;
    } else if (tx.type.toLowerCase() === "cost") {
      item.totalCost += tx.amount;
    }
  }

  // 4. Delete existing summaries for this org and insert new ones
  await prisma.$transaction(async (tx) => {
    await tx.clientPeriodSummary.deleteMany({
      where: { organizationId },
    });

    const summaryRecords = Array.from(map.values()).map((item) => {
      const metrics = calculateClientMetrics(item.totalRevenue, item.totalCost, thresholds);

      return {
        organizationId,
        clientId: item.clientId,
        periodType: "month",
        periodStartDate: item.periodStartDate,
        totalRevenue: metrics.totalRevenue,
        totalCost: metrics.totalCost,
        grossProfit: metrics.grossProfit,
        marginPercent: metrics.marginPercent,
        classification: metrics.classification,
      };
    });

    if (summaryRecords.length > 0) {
      await tx.clientPeriodSummary.createMany({
        data: summaryRecords,
      });
    }
  });
}

export interface DateRangeFilter {
  startDate: Date | null;
  endDate: Date | null;
  priorStartDate: Date | null;
  priorEndDate: Date | null;
  label: string;
}

export function parseRange(rangeKey: string, customStart?: string, customEnd?: string): DateRangeFilter {
  const now = new Date();

  if (rangeKey === "30d") {
    const end = now;
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const priorEnd = new Date(start.getTime() - 1);
    const priorStart = new Date(priorEnd.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { startDate: start, endDate: end, priorStartDate: priorStart, priorEndDate: priorEnd, label: "Last 30 Days" };
  }

  if (rangeKey === "quarter") {
    const end = now;
    const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const priorEnd = new Date(start.getTime() - 1);
    const priorStart = new Date(priorEnd.getTime() - 90 * 24 * 60 * 60 * 1000);
    return { startDate: start, endDate: end, priorStartDate: priorStart, priorEndDate: priorEnd, label: "Last Quarter" };
  }

  if (rangeKey === "ytd") {
    const currentYear = now.getUTCFullYear();
    const start = new Date(Date.UTC(currentYear, 0, 1));
    const end = now;
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)));
    const priorEnd = new Date(start.getTime() - 1);
    const priorStart = new Date(priorEnd.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate: start, endDate: end, priorStartDate: priorStart, priorEndDate: priorEnd, label: "This Year" };
  }

  if (rangeKey === "custom" && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    const duration = Math.max(1, end.getTime() - start.getTime());
    const priorEnd = new Date(start.getTime() - 1);
    const priorStart = new Date(priorEnd.getTime() - duration);
    return { startDate: start, endDate: end, priorStartDate: priorStart, priorEndDate: priorEnd, label: "Custom Range" };
  }

  if (rangeKey === "all") {
    return { startDate: null, endDate: null, priorStartDate: null, priorEndDate: null, label: "All Time" };
  }

  // Default: 12 months
  const end = now;
  const start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  const priorEnd = new Date(start.getTime() - 1);
  const priorStart = new Date(priorEnd.getTime() - 365 * 24 * 60 * 60 * 1000);
  return { startDate: start, endDate: end, priorStartDate: priorStart, priorEndDate: priorEnd, label: "Last 12 Months" };
}
