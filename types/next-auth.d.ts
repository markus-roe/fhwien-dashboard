import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      initials?: string;
      program?: "DTI" | "DI" | null;
      role?: "student" | "professor";
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    initials?: string;
    program?: "DTI" | "DI" | null;
    role?: "student" | "professor";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    email?: string;
    name?: string;
    role?: "student" | "professor";
    initials?: string;
    program?: "DTI" | "DI" | null;
  }
}
