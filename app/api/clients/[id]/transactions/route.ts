import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
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
  const typeFilter = searchParams.get("type"); // revenue, cost, or all
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "25", 10)));
  const skip = (page - 1) * limit;

  const whereClause: any = {
    organizationId: auth.organization.id,
    clientId: id,
  };

  if (typeFilter && typeFilter !== "all") {
    whereClause.type = typeFilter.toLowerCase();
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      orderBy: { transactionDate: "desc" },
      skip,
      take: limit,
      include: {
        upload: {
          select: { fileName: true },
        },
      },
    }),
    prisma.transaction.count({
      where: whereClause,
    }),
  ]);

  return NextResponse.json({
    data: transactions.map((t) => ({
      id: t.id,
      date: t.transactionDate.toISOString().split("T")[0],
      type: t.type,
      category: t.category,
      amount: t.amount,
      description: t.description,
      sourceFile: t.upload?.fileName || "Manual / Demo",
    })),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}
