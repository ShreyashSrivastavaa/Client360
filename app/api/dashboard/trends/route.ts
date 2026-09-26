import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { parseRange } from "@/lib/calculations/engine";
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

  const whereClause: any = { organizationId: orgId };
  if (range.startDate && range.endDate) {
    whereClause.periodStartDate = {
      gte: range.startDate,
      lte: range.endDate,
    };
  }

  // Fetch monthly summaries for this org
  const summaries = await prisma.clientPeriodSummary.findMany({
    where: whereClause,
    orderBy: { periodStartDate: "asc" },
  });

  // Aggregate by month bucket (YYYY-MM)
  const monthMap = new Map<
    string,
    {
      periodStartDate: Date;
      revenue: number;
      cost: number;
    }
  >();

  summaries.forEach((s) => {
    const d = new Date(s.periodStartDate);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    let item = monthMap.get(key);
    if (!item) {
      item = {
        periodStartDate: s.periodStartDate,
        revenue: 0,
        cost: 0,
      };
      monthMap.set(key, item);
    }

    item.revenue += s.totalRevenue;
    item.cost += s.totalCost;
  });

  const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });

  const trends = Array.from(monthMap.entries()).map(([monthKey, val]) => {
    const profit = val.revenue - val.cost;
    const margin = val.revenue > 0 ? (profit / val.revenue) * 100 : 0;
    return {
      monthKey,
      label: monthFormatter.format(new Date(val.periodStartDate)),
      revenue: Math.round(val.revenue * 100) / 100,
      cost: Math.round(val.cost * 100) / 100,
      profit: Math.round(profit * 100) / 100,
      margin: Math.round(margin * 10) / 10,
    };
  });

  return NextResponse.json({ data: trends });
}
