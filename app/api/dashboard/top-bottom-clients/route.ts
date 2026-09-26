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
  const limit = Math.max(1, Math.min(20, parseInt(searchParams.get("limit") || "5", 10)));

  const range = parseRange(rangeKey, customStart, customEnd);
  const orgId = auth.organization.id;

  const thresholds = {
    profitableMarginThreshold: auth.organization.profitableMarginThreshold,
    lowMarginThreshold: auth.organization.lowMarginThreshold,
  };

  const whereClause: any = { organizationId: orgId };
  if (range.startDate && range.endDate) {
    whereClause.transactionDate = {
      gte: range.startDate,
      lte: range.endDate,
    };
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      client: {
        select: { id: true, name: true, externalReference: true },
      },
    },
  });

  const clientMap = new Map<
    string,
    {
      id: string;
      name: string;
      externalReference: string | null;
      revenue: number;
      cost: number;
    }
  >();

  transactions.forEach((tx) => {
    let item = clientMap.get(tx.clientId);
    if (!item) {
      item = {
        id: tx.client.id,
        name: tx.client.name,
        externalReference: tx.client.externalReference,
        revenue: 0,
        cost: 0,
      };
      clientMap.set(tx.clientId, item);
    }
    if (tx.type.toLowerCase() === "revenue") {
      item.revenue += tx.amount;
    } else {
      item.cost += tx.amount;
    }
  });

  const clientList = Array.from(clientMap.values()).map((c) => {
    const profit = c.revenue - c.cost;
    const marginPercent = c.revenue > 0 ? (profit / c.revenue) * 100 : null;
    const classification = determineClassification(marginPercent, c.revenue, thresholds);

    return {
      id: c.id,
      name: c.name,
      externalReference: c.externalReference,
      revenue: Math.round(c.revenue * 100) / 100,
      cost: Math.round(c.cost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      marginPercent: marginPercent !== null ? Math.round(marginPercent * 10) / 10 : null,
      classification,
    };
  });

  const sortedDesc = [...clientList].sort((a, b) => b.profit - a.profit);
  const topClients = sortedDesc.slice(0, limit);

  const sortedAsc = [...clientList].sort((a, b) => a.profit - b.profit);
  const bottomClients = sortedAsc.slice(0, limit);

  return NextResponse.json({
    data: {
      topClients,
      bottomClients,
    },
  });
}
