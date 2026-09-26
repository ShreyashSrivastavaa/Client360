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
  const search = searchParams.get("search")?.toLowerCase().trim() || "";
  const statusFilter = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "profit_desc";
  const rangeKey = searchParams.get("range") || "12m";
  const customStart = searchParams.get("start") || undefined;
  const customEnd = searchParams.get("end") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));

  const range = parseRange(rangeKey, customStart, customEnd);
  const orgId = auth.organization.id;

  const thresholds = {
    profitableMarginThreshold: auth.organization.profitableMarginThreshold,
    lowMarginThreshold: auth.organization.lowMarginThreshold,
  };

  // 1. Fetch all clients of this org (optionally filtered by name)
  const clientWhere: any = { organizationId: orgId };
  if (search) {
    clientWhere.name = { contains: search };
  }

  const clients = await prisma.client.findMany({
    where: clientWhere,
    select: {
      id: true,
      name: true,
      externalReference: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (clients.length === 0) {
    return NextResponse.json({
      data: [],
      meta: { total: 0, page: 1, limit, totalPages: 0 },
    });
  }

  // 2. Fetch transactions for the selected date range
  const txWhere: any = { organizationId: orgId };
  if (range.startDate && range.endDate) {
    txWhere.transactionDate = {
      gte: range.startDate,
      lte: range.endDate,
    };
  }

  const [transactions, summaries] = await Promise.all([
    prisma.transaction.findMany({
      where: txWhere,
      select: {
        clientId: true,
        type: true,
        amount: true,
        transactionDate: true,
      },
      orderBy: { transactionDate: "desc" },
    }),
    prisma.clientPeriodSummary.findMany({
      where: { organizationId: orgId },
      orderBy: { periodStartDate: "asc" },
      select: {
        clientId: true,
        periodStartDate: true,
        grossProfit: true,
        marginPercent: true,
      },
    }),
  ]);

  // Aggregate by client
  const clientDataMap = new Map<
    string,
    {
      revenue: number;
      cost: number;
      lastDate: Date | null;
    }
  >();

  transactions.forEach((tx) => {
    let item = clientDataMap.get(tx.clientId);
    if (!item) {
      item = { revenue: 0, cost: 0, lastDate: tx.transactionDate };
      clientDataMap.set(tx.clientId, item);
    }
    if (tx.type.toLowerCase() === "revenue") {
      item.revenue += tx.amount;
    } else {
      item.cost += tx.amount;
    }
    if (!item.lastDate || tx.transactionDate > item.lastDate) {
      item.lastDate = tx.transactionDate;
    }
  });

  // Collect monthly sparkline data per client (last 6 available months)
  const sparklineMap = new Map<string, number[]>();
  summaries.forEach((s) => {
    let arr = sparklineMap.get(s.clientId);
    if (!arr) {
      arr = [];
      sparklineMap.set(s.clientId, arr);
    }
    arr.push(s.grossProfit);
  });

  // Calculate full client list with classification
  let processedClients = clients.map((c) => {
    const agg = clientDataMap.get(c.id) || { revenue: 0, cost: 0, lastDate: null };
    const profit = agg.revenue - agg.cost;
    const marginPercent = agg.revenue > 0 ? (profit / agg.revenue) * 100 : null;
    const classification = determineClassification(marginPercent, agg.revenue, thresholds);

    const sparklines = (sparklineMap.get(c.id) || []).slice(-6);

    return {
      id: c.id,
      name: c.name,
      externalReference: c.externalReference,
      isActive: c.isActive,
      totalRevenue: Math.round(agg.revenue * 100) / 100,
      totalCost: Math.round(agg.cost * 100) / 100,
      grossProfit: Math.round(profit * 100) / 100,
      marginPercent: marginPercent !== null ? Math.round(marginPercent * 10) / 10 : null,
      classification,
      sparkline: sparklines,
      lastActivityDate: agg.lastDate ? agg.lastDate.toISOString().split("T")[0] : null,
    };
  });

  // Filter by status if requested
  if (statusFilter && statusFilter !== "all") {
    processedClients = processedClients.filter((c) => c.classification === statusFilter);
  }

  // Sorting
  processedClients.sort((a, b) => {
    switch (sort) {
      case "profit_desc":
        return b.grossProfit - a.grossProfit;
      case "profit_asc":
        return a.grossProfit - b.grossProfit;
      case "revenue_desc":
        return b.totalRevenue - a.totalRevenue;
      case "revenue_asc":
        return a.totalRevenue - b.totalRevenue;
      case "margin_desc":
        return (b.marginPercent ?? -9999) - (a.marginPercent ?? -9999);
      case "margin_asc":
        return (a.marginPercent ?? 9999) - (b.marginPercent ?? 9999);
      case "name_asc":
        return a.name.localeCompare(b.name);
      case "name_desc":
        return b.name.localeCompare(a.name);
      default:
        return b.grossProfit - a.grossProfit;
    }
  });

  const total = processedClients.length;
  const skip = (page - 1) * limit;
  const paginatedClients = processedClients.slice(skip, skip + limit);

  return NextResponse.json({
    data: paginatedClients,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
