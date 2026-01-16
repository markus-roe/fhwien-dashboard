import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { decode } from "next-auth/jwt";
import { prisma } from "./prisma";
import type { Program, User, UserRole } from "./api-types";
import { NextRequest } from "next/server";

/**
 * Get the current authenticated user from Bearer token (for mobile app)
 */
export async function getCurrentUserFromToken(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    return null;
  }

  try {
    const decoded = await decode({
      token,
      secret,
    });

    if (!decoded || !decoded.id) {
      return null;
    }

    const userId = parseInt(decoded.id as string);
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      return null;
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      initials: dbUser.initials,
      email: dbUser.email,
      program: dbUser.program as Program,
      role: dbUser.role as UserRole,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

/**
 * Get the current authenticated user from the session (for web)
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const userId = parseInt(session.user.id);
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    return null;
  }

  return {
    id: dbUser.id,
    name: dbUser.name,
    initials: dbUser.initials,
    email: dbUser.email,
    program: dbUser.program as Program,
    role: dbUser.role as UserRole,
  };
}

/**
 * Get the current authenticated user from either session or Bearer token
 * (for API routes that support both web and mobile)
 */
export async function getCurrentUserFromRequest(request: NextRequest): Promise<User | null> {
  // Try Bearer token first (mobile app)
  const tokenUser = await getCurrentUserFromToken(request);
  if (tokenUser) {
    return tokenUser;
  }

  // Fall back to session (web)
  return await getCurrentUser();
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Require authentication from request (supports both token and session)
 */
export async function requireAuthFromRequest(request: NextRequest): Promise<User> {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
