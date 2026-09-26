import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setAuthCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, companyName, industry, profitableMarginThreshold, lowMarginThreshold } =
      await req.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { error: "Email, password, full name, and company name are required" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create User, Organization, and Owner Membership in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          fullName: fullName.trim(),
        },
      });

      const organization = await tx.organization.create({
        data: {
          name: companyName.trim(),
          industry: industry?.trim() || null,
          profitableMarginThreshold: profitableMarginThreshold ? parseFloat(profitableMarginThreshold) : 20.0,
          lowMarginThreshold: lowMarginThreshold ? parseFloat(lowMarginThreshold) : 5.0,
          members: {
            create: {
              userId: user.id,
              role: "owner",
              status: "active",
            },
          },
        },
      });

      return { user, organization };
    });

    // Set JWT auth cookie
    await setAuthCookie({
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      role: "owner",
    });

    return NextResponse.json({
      data: {
        user: { id: result.user.id, email: result.user.email, fullName: result.user.fullName },
        organization: result.organization,
        role: "owner",
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
