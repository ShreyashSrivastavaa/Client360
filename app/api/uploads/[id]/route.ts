import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { recalculateClientSummaries } from "@/lib/calculations/engine";
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

  const upload = await prisma.upload.findUnique({
    where: { id },
    include: {
      uploadedBy: {
        select: { fullName: true, email: true },
      },
    },
  });

  if (!upload || upload.organizationId !== auth.organization.id) {
    return NextResponse.json({ error: "Upload not found" }, { status: 404 });
  }

  let parsedErrors = [];
  if (upload.errorLog) {
    try {
      parsedErrors = JSON.parse(upload.errorLog);
    } catch {
      parsedErrors = [];
    }
  }

  return NextResponse.json({
    data: {
      ...upload,
      errorList: parsedErrors,
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "member") {
    return NextResponse.json(
      { error: "Insufficient permissions. Members cannot delete uploads." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const upload = await prisma.upload.findUnique({
      where: { id },
    });

    if (!upload || upload.organizationId !== auth.organization.id) {
      return NextResponse.json({ error: "Upload not found" }, { status: 404 });
    }

    const orgId = auth.organization.id;

    // Delete associated transactions and upload record in transaction
    await prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { uploadId: id },
      });

      await tx.upload.delete({
        where: { id },
      });
    });

    // Recalculate client period summaries after rollback
    await recalculateClientSummaries(orgId);

    return NextResponse.json({
      success: true,
      message: "Upload and its transactions deleted successfully. Profitability recalculated.",
    });
  } catch (error: any) {
    console.error("Delete upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete upload" }, { status: 500 });
  }
}
