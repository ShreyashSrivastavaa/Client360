import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseRange, determineClassification } from "@/lib/calculations/engine";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rangeKey = searchParams.get("range") || "12m";
  const customStart = searchParams.get("start") || undefined;
  const customEnd = searchParams.get("end") || undefined;

  const range = parseRange(rangeKey, customStart, customEnd);
  const orgId = auth.organization.id;

  const thresholds = {
    profitableMarginThreshold: auth.organization.profitableMarginThreshold,
    lowMarginThreshold: auth.organization.lowMarginThreshold,
  };

  // 1. Fetch transactions for current period
  const currentWhere: any = { organizationId: orgId };
  if (range.startDate && range.endDate) {
    currentWhere.transactionDate = {
      gte: range.startDate,
      lte: range.endDate,
    };
  }

  // 2. Fetch transactions for prior period (for delta comparisons)
  const priorWhere: any = { organizationId: orgId };
  if (range.priorStartDate && range.priorEndDate) {
    priorWhere.transactionDate = {
      gte: range.priorStartDate,
      lte: range.priorEndDate,
    };
  }

  const [currentTxs, priorTxs] = await Promise.all([
    prisma.transaction.findMany({
      where: currentWhere,
      select: { clientId: true, type: true, amount: true },
    }),
    range.priorStartDate
      ? prisma.transaction.findMany({
          where: priorWhere,
          select: { clientId: true, type: true, amount: true },
        })
      : Promise.resolve([]),
  ]);

  // Aggregate current period per client
  const clientAggregates = new Map<string, { revenue: number; cost: number }>();
  let totalRevenue = 0;
  let totalCost = 0;

  currentTxs.forEach((tx) => {
    let item = clientAggregates.get(tx.clientId);
    if (!item) {
      item = { revenue: 0, cost: 0 };
      clientAggregates.set(tx.clientId, item);
    }
    if (tx.type.toLowerCase() === "revenue") {
      item.revenue += tx.amount;
      totalRevenue += tx.amount;
    } else {
      item.cost += tx.amount;
      totalCost += tx.amount;
    }
  });

  const grossProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : null;

  // Classify each active client in current range
  let profitableCount = 0;
  let lowMarginCount = 0;
  let lossMakingCount = 0;
  let lossMakingAmount = 0;

  clientAggregates.forEach((item) => {
    const p = item.revenue - item.cost;
    const m = item.revenue > 0 ? (p / item.revenue) * 100 : null;
    const classification = determineClassification(m, item.revenue, thresholds);

    if (classification === "profitable") profitableCount++;
    else if (classification === "low_margin") lowMarginCount++;
    else if (classification === "loss_making") {
      lossMakingCount++;
      if (p < 0) lossMakingAmount += Math.abs(p);
    }
  });

  // Aggregate prior period
  let priorRevenue = 0;
  let priorCost = 0;
  const priorClientAggregates = new Map<string, { revenue: number; cost: number }>();

  priorTxs.forEach((tx) => {
    let item = priorClientAggregates.get(tx.clientId);
    if (!item) {
      item = { revenue: 0, cost: 0 };
      priorClientAggregates.set(tx.clientId, item);
    }
    if (tx.type.toLowerCase() === "revenue") {
      item.revenue += tx.amount;
      priorRevenue += tx.amount;
    } else {
      item.cost += tx.amount;
      priorCost += tx.amount;
    }
  });

  const priorGrossProfit = priorRevenue - priorCost;
  const priorMarginPercent = priorRevenue > 0 ? (priorGrossProfit / priorRevenue) * 100 : null;

  let priorLossMakingCount = 0;
  priorClientAggregates.forEach((item) => {
    const p = item.revenue - item.cost;
    const m = item.revenue > 0 ? (p / item.revenue) * 100 : null;
    const classification = determineClassification(m, item.revenue, thresholds);
    if (classification === "loss_making") priorLossMakingCount++;
  });

  // Calculate deltas
  const calcDelta = (curr: number, prev: number) => {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const revenueDelta = range.priorStartDate ? calcDelta(totalRevenue, priorRevenue) : 0;
  const costDelta = range.priorStartDate ? calcDelta(totalCost, priorCost) : 0;
  const profitDelta = range.priorStartDate ? calcDelta(grossProfit, priorGrossProfit) : 0;
  const marginDelta =
    marginPercent !== null && priorMarginPercent !== null
      ? marginPercent - priorMarginPercent
      : 0;
  const activeClientsDelta = clientAggregates.size - priorClientAggregates.size;
  const lossMakingDelta = lossMakingCount - priorLossMakingCount;

  return NextResponse.json({
    data: {
      range: range.label,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueDelta: Math.round(revenueDelta * 10) / 10,
      totalCost: Math.round(totalCost * 100) / 100,
      costDelta: Math.round(costDelta * 10) / 10,
      grossProfit: Math.round(grossProfit * 100) / 100,
      profitDelta: Math.round(profitDelta * 10) / 10,
      marginPercent: marginPercent !== null ? Math.round(marginPercent * 10) / 10 : null,
      marginDelta: Math.round(marginDelta * 10) / 10,
      activeClientsCount: clientAggregates.size,
      activeClientsDelta,
      lossMakingCount,
      lossMakingAmount: Math.round(lossMakingAmount * 100) / 100,
      lossMakingDelta,
      distribution: {
        profitable: profitableCount,
        lowMargin: lowMarginCount,
        lossMaking: lossMakingCount,
        total: clientAggregates.size,
      },
    },
  });
}
