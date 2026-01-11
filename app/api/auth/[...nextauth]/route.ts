import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/shared/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        console.log("[AUTH] Attempting login for:", credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          console.log("[AUTH] User not found or no password:", credentials.email);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          console.log("[AUTH] Invalid password for:", credentials.email);
          return null;
        }

        // Update lastLoggedIn timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoggedIn: new Date() },
        });

        const userData: {
          id: string;
          email: string;
          name: string;
          initials?: string;
          program?: "DTI" | "DI" | null;
          role?: "student" | "professor" | "admin";
        } = {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          initials: user.initials,
          program: (user.program as "DTI" | "DI" | null) || null,
          role: (user.role as "student" | "professor" | "admin") || "student",
        };

        console.log("[AUTH] Login successful for:", userData.email, "User ID:", userData.id);
        return userData;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("[AUTH] JWT callback - Setting token for user:", user.email, "ID:", user.id);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
        token.initials = (user as any).initials;
        token.program = (user as any).program;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        console.log("[AUTH] Session callback - Token email:", token.email, "Token ID:", token.id);
        session.user.id = token.id as string;
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
        (session.user as any).role = token.role;
        (session.user as any).initials = token.initials;
        (session.user as any).program = token.program;
        console.log("[AUTH] Session callback - Final session user:", {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: (session.user as any).role,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
