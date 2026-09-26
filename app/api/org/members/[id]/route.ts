import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
      { error: "Insufficient permissions. Only Admins and Owners can remove members." },
      { status: 403 }
    );
  }

  try {
    const { id } = await params;

    const member = await prisma.organizationMember.findUnique({
      where: { id },
    });

    if (!member || member.organizationId !== auth.organization.id) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (member.role === "owner") {
      // Check if there are other owners
      const ownerCount = await prisma.organizationMember.count({
        where: {
          organizationId: auth.organization.id,
          role: "owner",
        },
      });

      if (ownerCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the only organization owner" },
          { status: 400 }
        );
      }
    }

    await prisma.organizationMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Remove member error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove member" }, { status: 500 });
  }
}
