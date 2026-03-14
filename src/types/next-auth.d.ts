import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "MANAGER" | "USER";
      departmentId?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "MANAGER" | "USER";
    departmentId?: string | null;
  }
}
