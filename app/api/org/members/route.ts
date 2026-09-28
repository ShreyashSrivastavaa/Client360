import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: auth.organization.id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ data: members });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthenticatedUser();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (auth.role === "member") {
    return NextResponse.json(
      { error: "Insufficient permissions. Only Admins and Owners can invite members." },
      { status: 403 }
    );
  }

  try {
    const { email, role } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const targetEmail = email.toLowerCase().trim();
    const assignedRole = role === "admin" ? "admin" : "member";

    // Check if member already exists in this org
    const existingMember = await prisma.organizationMember.findFirst({
      where: {
        organizationId: auth.organization.id,
        OR: [
          { invitedEmail: targetEmail },
          { user: { email: targetEmail } },
        ],
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "This email is already a member or has a pending invitation" },
        { status: 400 }
      );
    }

    // Check if user exists in the system
    const existingUser = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    const newMember = await prisma.organizationMember.create({
      data: {
        organizationId: auth.organization.id,
        userId: existingUser ? existingUser.id : null,
        invitedEmail: targetEmail,
        role: assignedRole,
        status: existingUser ? "active" : "invited",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: newMember,
      message: `Invitation generated for ${targetEmail} as ${assignedRole}.`,
    });
  } catch (error: any) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: error.message || "Failed to invite member" }, { status: 500 });
  }
}
