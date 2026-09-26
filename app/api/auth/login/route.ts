import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const activeMembership = user.memberships.find((m) => m.status === "active") || user.memberships[0];

    if (!activeMembership) {
      return NextResponse.json(
        { error: "User does not belong to an active organization" },
        { status: 403 }
      );
    }

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      organizationId: activeMembership.organizationId,
      role: activeMembership.role as "owner" | "admin" | "member",
    });

    return NextResponse.json({
      data: {
        user: { id: user.id, email: user.email, fullName: user.fullName },
        organization: activeMembership.organization,
        role: activeMembership.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
