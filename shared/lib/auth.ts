import { getServerSession } from "next-auth/next";
import { authOptions } from "@/shared/lib/authOptions";
import { decode } from "next-auth/jwt";
import { prisma } from "./prisma";
import type { Program, User, UserRole } from "./api-types";
import { NextRequest } from "next/server";
import crypto from "crypto";

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

/**
 * Generate a personal calendar token for a user
 * This token is deterministic (same user = same token) and can be used in URLs
 */
export function generateCalendarToken(userId: number): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set");
  }
  
  // Create a deterministic hash from user ID + secret
  const hash = crypto
    .createHash("sha256")
    .update(`${userId}-${secret}-calendar`)
    .digest("hex");
  
  // Return first 32 characters as token (enough for security, short enough for URLs)
  return hash.substring(0, 32);
}

/**
 * Get user from calendar token
 * Returns null if token is invalid
 * 
 * Note: This function needs to check all users to find a matching token.
 * For better performance with many users, consider storing tokens in the database.
 */
export async function getUserFromCalendarToken(token: string): Promise<User | null> {
  if (!token || token.length !== 32) {
    return null;
  }

  try {
    // Get all users (we need to check each one since token is derived from user ID + secret)
    // For better performance, you could store tokens in DB with an index
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        initials: true,
        email: true,
        program: true,
        role: true,
      },
      // Limit to reasonable number - if you have thousands of users, consider caching
      take: 10000,
    });

    // Check each user's token (this is O(n) but necessary without DB storage)
    for (const user of users) {
      const userToken = generateCalendarToken(user.id);
      if (userToken === token) {
        return {
          id: user.id,
          name: user.name,
          initials: user.initials,
          email: user.email,
          program: (user.program as Program) || "DTI",
          role: (user.role as UserRole) || "student",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error validating calendar token:", error);
    return null;
  }
}
