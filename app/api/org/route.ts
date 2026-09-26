import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recalculateClientSummaries } from "@/lib/calculations/engine";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    data: auth.organization,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "member") {
    return NextResponse.json(
      { error: "Insufficient permissions. Only Admins and Owners can modify organization settings." },
      { status: 403 }
    );
  }

  try {
    const { name, industry, profitableMarginThreshold, lowMarginThreshold } = await req.json();

    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name.trim();
    if (industry !== undefined) dataToUpdate.industry = industry ? industry.trim() : null;

    let thresholdsChanged = false;

    if (profitableMarginThreshold !== undefined) {
      const p = parseFloat(profitableMarginThreshold);
      if (!isNaN(p)) {
        dataToUpdate.profitableMarginThreshold = p;
        thresholdsChanged = true;
      }
    }

    if (lowMarginThreshold !== undefined) {
      const l = parseFloat(lowMarginThreshold);
      if (!isNaN(l)) {
        dataToUpdate.lowMarginThreshold = l;
        thresholdsChanged = true;
      }
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: auth.organization.id },
      data: dataToUpdate,
    });

    // If thresholds changed, immediately re-classify all monthly client period summaries!
    if (thresholdsChanged) {
      await recalculateClientSummaries(auth.organization.id);
    }

    return NextResponse.json({ data: updatedOrg });
  } catch (error: any) {
    console.error("Org update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update organization" }, { status: 500 });
  }
}
