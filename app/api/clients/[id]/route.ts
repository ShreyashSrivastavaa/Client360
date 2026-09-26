import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseRange, determineClassification } from "@/lib/calculations/engine";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
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

  const client = await prisma.client.findUnique({
    where: { id },
  });

  if (!client || client.organizationId !== orgId) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Where condition for date range
  const txWhere: any = { organizationId: orgId, clientId: id };
  if (range.startDate && range.endDate) {
    txWhere.transactionDate = {
      gte: range.startDate,
      lte: range.endDate,
    };
  }

  const [transactions, monthlySummaries] = await Promise.all([
    prisma.transaction.findMany({
      where: txWhere,
      orderBy: { transactionDate: "desc" },
    }),
    prisma.clientPeriodSummary.findMany({
      where: { organizationId: orgId, clientId: id },
      orderBy: { periodStartDate: "asc" },
    }),
  ]);

  // Aggregate selected period metrics
  let totalRevenue = 0;
  let totalCost = 0;
  const categoryCostMap = new Map<string, number>();

  transactions.forEach((tx) => {
    if (tx.type.toLowerCase() === "revenue") {
      totalRevenue += tx.amount;
    } else {
      totalCost += tx.amount;
      const cat = tx.category || "Uncategorized";
      categoryCostMap.set(cat, (categoryCostMap.get(cat) || 0) + tx.amount);
    }
  });

  const grossProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : null;
  const currentClassification = determineClassification(marginPercent, totalRevenue, thresholds);

  // Cost breakdown array with percentages
  const costBreakdown = Array.from(categoryCostMap.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalCost > 0 ? Math.round((amount / totalCost) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Monthly trends for this client
  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
  const trends = monthlySummaries.map((s) => ({
    monthKey: s.periodStartDate.toISOString().slice(0, 7),
    label: monthFormatter.format(new Date(s.periodStartDate)),
    revenue: s.totalRevenue,
    cost: s.totalCost,
    profit: s.grossProfit,
    margin: s.marginPercent,
    classification: s.classification,
  }));

  return NextResponse.json({
    data: {
      client: {
        id: client.id,
        name: client.name,
        externalReference: client.externalReference,
        isActive: client.isActive,
        createdAt: client.createdAt,
      },
      metrics: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        marginPercent: marginPercent !== null ? Math.round(marginPercent * 10) / 10 : null,
        classification: currentClassification,
        transactionCount: transactions.length,
      },
      costBreakdown,
      trends,
    },
  });
}
