import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setAuthCookie } from "@/lib/auth";
import { seedSampleData } from "@/lib/demo-data";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    let user = await prisma.user.findUnique({
      where: { email: "demo@profitlens.io" },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      const passwordHash = await bcrypt.hash("password123", 10);
      user = await prisma.user.create({
        data: {
          email: "demo@profitlens.io",
          fullName: "Alex Vance (CFO)",
          passwordHash,
          memberships: {
            create: {
              role: "owner",
              status: "active",
              organization: {
                create: {
                  name: "Acme Global Technologies",
                  industry: "B2B SaaS & Professional Services",
                  profitableMarginThreshold: 20.0,
                  lowMarginThreshold: 5.0,
                },
              },
            },
          },
        },
        include: {
          memberships: {
            include: { organization: true },
          },
        },
      });

      const orgId = user.memberships[0].organizationId;
      await seedSampleData(orgId, user.id);
    }

    const membership = user.memberships[0];

    await setAuthCookie({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role as "owner" | "admin" | "member",
    });

    return NextResponse.json({
      data: {
        user: { id: user.id, email: user.email, fullName: user.fullName },
        organization: membership.organization,
        role: membership.role,
      },
    });
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
