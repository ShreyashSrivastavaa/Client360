import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { env } from "./env";

const JWT_SECRET = env.JWT_SECRET;
const COOKIE_NAME = "profitlens_token";

export interface SessionPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: "owner" | "admin" | "member";
  isDemo?: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload, expiresIn = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getAuthenticatedUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, fullName: true },
  });

  if (!user) return null;

  const member = await prisma.organizationMember.findFirst({
    where: {
      userId: user.id,
      organizationId: session.organizationId,
      status: "active",
    },
    include: {
      organization: true,
    },
  });

  if (!member) return null;

  return {
    user,
    organization: member.organization,
    role: member.role as "owner" | "admin" | "member",
    isDemo: session.isDemo ?? false,
  };
}

export async function setAuthCookie(payload: SessionPayload, maxAgeSeconds = 60 * 60 * 24 * 7) {
  const token = signToken(payload, `${maxAgeSeconds}s`);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
