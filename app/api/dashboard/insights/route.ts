import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseRange, determineClassification } from "@/lib/calculations/engine";
import { generateInsights, ClientInsightData } from "@/lib/insights/engine";
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
  const currencyCode = (searchParams.get("currency") || req.headers.get("x-currency") || "INR") as any;

  const range = parseRange(rangeKey, customStart, customEnd);
  const orgId = auth.organization.id;

  const thresholds = {
    profitableMarginThreshold: auth.organization.profitableMarginThreshold,
    lowMarginThreshold: auth.organization.lowMarginThreshold,
  };

  // Current transactions
  const currentWhere: any = { organizationId: orgId };
  if (range.startDate && range.endDate) {
    currentWhere.transactionDate = {
      gte: range.startDate,
      lte: range.endDate,
    };
  }

  // Prior transactions (for margin degradation comparisons)
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
      include: { client: { select: { id: true, name: true } } },
    }),
    range.priorStartDate
      ? prisma.transaction.findMany({
          where: priorWhere,
          include: { client: { select: { id: true, name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const clientMap = new Map<string, ClientInsightData>();
  let totalRevenue = 0;
  let totalProfit = 0;

  currentTxs.forEach((tx) => {
    let item = clientMap.get(tx.clientId);
    if (!item) {
      item = {
        id: tx.client.id,
        name: tx.client.name,
        revenue: 0,
        cost: 0,
        profit: 0,
        marginPercent: null,
        classification: "no_revenue",
      };
      clientMap.set(tx.clientId, item);
    }

    if (tx.type.toLowerCase() === "revenue") {
      item.revenue += tx.amount;
      totalRevenue += tx.amount;
    } else {
      item.cost += tx.amount;
    }
  });

  // Calculate profits & classifications
  clientMap.forEach((item) => {
    item.profit = item.revenue - item.cost;
    totalProfit += item.profit;
    item.marginPercent = item.revenue > 0 ? (item.profit / item.revenue) * 100 : null;
    item.classification = determineClassification(item.marginPercent, item.revenue, thresholds);
  });

  // Prior period stats
  const priorMap = new Map<string, { revenue: number; cost: number }>();
  priorTxs.forEach((tx) => {
    let item = priorMap.get(tx.clientId);
    if (!item) {
      item = { revenue: 0, cost: 0 };
      priorMap.set(tx.clientId, item);
    }
    if (tx.type.toLowerCase() === "revenue") {
      item.revenue += tx.amount;
    } else {
      item.cost += tx.amount;
    }
  });

  priorMap.forEach((val, cId) => {
    const p = val.revenue - val.cost;
    const m = val.revenue > 0 ? (p / val.revenue) * 100 : null;
    const item = clientMap.get(cId);
    if (item) {
      item.priorRevenue = val.revenue;
      item.priorProfit = p;
      item.priorMarginPercent = m;
      item.priorClassification = determineClassification(m, val.revenue, thresholds);
    }
  });

  const insights = generateInsights(Array.from(clientMap.values()), totalRevenue, totalProfit, currencyCode);

  return NextResponse.json({ data: insights });
}
