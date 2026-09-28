import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setAuthCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(8, "Password must be at least 8 characters long").max(100),
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  industry: z.string().max(100).optional().nullable(),
  profitableMarginThreshold: z.coerce.number().min(1).max(100).optional().default(20.0),
  lowMarginThreshold: z.coerce.number().min(0).max(99).optional().default(5.0),
}).refine((data) => data.profitableMarginThreshold > data.lowMarginThreshold, {
  message: "Profitable margin threshold must be greater than low-margin threshold",
  path: ["profitableMarginThreshold"],
});

export async function POST(req: NextRequest) {
  // 1. Rate limiting by IP (max 5 signups per minute)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rl = rateLimit(ip, { keyPrefix: "signup", limit: 5, windowMs: 60 * 1000 });

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid registration input" },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      fullName,
      companyName,
      industry,
      profitableMarginThreshold,
      lowMarginThreshold,
    } = parsed.data;

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

    // Create User, Organization, and Owner Membership in atomic transaction
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
          profitableMarginThreshold,
          lowMarginThreshold,
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
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
