import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, setAuthCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(255),
  password: z.string().min(1, "Password is required").max(100),
});

export async function POST(req: NextRequest) {
  // 1. Rate limiting by IP (max 10 attempts per minute)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rl = rateLimit(ip, { keyPrefix: "login", limit: 10, windowMs: 60 * 1000 });

  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again in 1 minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid login input" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

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
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
