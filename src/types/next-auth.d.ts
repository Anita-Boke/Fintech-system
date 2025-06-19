// src/types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accountId: unknown;
      id: string;
      name: string;
      email: string;
      role: "admin" | "customer";
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: "admin" | "customer";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string;
    email?: string;
    role?: "admin" | "customer";
  }
}