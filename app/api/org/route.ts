import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recalculateClientSummaries } from "@/lib/calculations/engine";
import { z } from "zod";

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  industry: z.string().max(100).optional().nullable(),
  profitableMarginThreshold: z.coerce.number().min(0.1).max(100).optional(),
  lowMarginThreshold: z.coerce.number().min(0).max(99.9).optional(),
});

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
    const body = await req.json();
    const parsed = updateOrgSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid settings input" },
        { status: 400 }
      );
    }

    const { name, industry, profitableMarginThreshold, lowMarginThreshold } = parsed.data;

    // Validate relative order of thresholds
    const currentProfitable = profitableMarginThreshold ?? auth.organization.profitableMarginThreshold;
    const currentLow = lowMarginThreshold ?? auth.organization.lowMarginThreshold;

    if (currentProfitable <= currentLow) {
      return NextResponse.json(
        { error: "Profitable margin threshold must be greater than low-margin threshold." },
        { status: 400 }
      );
    }

    const dataToUpdate: Record<string, any> = {};
    if (name) dataToUpdate.name = name.trim();
    if (industry !== undefined) dataToUpdate.industry = industry ? industry.trim() : null;

    let thresholdsChanged = false;
    if (profitableMarginThreshold !== undefined) {
      dataToUpdate.profitableMarginThreshold = profitableMarginThreshold;
      thresholdsChanged = true;
    }
    if (lowMarginThreshold !== undefined) {
      dataToUpdate.lowMarginThreshold = lowMarginThreshold;
      thresholdsChanged = true;
    }

    // Tenant isolation: update strictly scoped to authenticated organization id
    const updatedOrg = await prisma.organization.update({
      where: { id: auth.organization.id },
      data: dataToUpdate,
    });

    // Re-classify all summaries for this org if threshold parameters shifted
    if (thresholdsChanged) {
      await recalculateClientSummaries(auth.organization.id);
    }

    return NextResponse.json({ data: updatedOrg });
  } catch (error: any) {
    console.error("Org update error:", error);
    return NextResponse.json({ error: "Failed to update organization" }, { status: 500 });
  }
}
