import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { seedSampleData } from "@/lib/demo-data";

export async function POST() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "member") {
    return NextResponse.json(
      { error: "Insufficient permissions. Only Admins and Owners can load demo data." },
      { status: 403 }
    );
  }

  try {
    const result = await seedSampleData(auth.organization.id, auth.user.id);
    return NextResponse.json({
      success: true,
      message: `Loaded sample dataset with ${result.totalClients} clients and ${result.totalTransactions} transactions.`,
    });
  } catch (error: any) {
    console.error("Load demo data error:", error);
    return NextResponse.json({ error: error.message || "Failed to load sample data" }, { status: 500 });
  }
}
