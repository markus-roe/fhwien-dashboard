import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "./prisma";
import type { User } from "./api-types";

/**
 * Get the current authenticated user from the session
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
    program: dbUser.program as "DTI" | "DI" | undefined,
    role: (dbUser.role as "student" | "professor") || "student",
  };
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
