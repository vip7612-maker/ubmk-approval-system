import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { accounts, sessions, users, verificationTokens } from "@/lib/db/schema";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: true,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/drive.readonly",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session?.user) {
        session.user.id = user.id;
        // @ts-ignore
        session.user.departmentId = user.departmentId;
        // @ts-ignore
        session.user.role = user.role;

        // CRITICAL: Force ADMIN role for the owner email as a failsafe
        const adminEmails = ["vip7612@gmail.com"];
        if (session.user.email && adminEmails.includes(session.user.email.toLowerCase())) {
          // @ts-ignore
          session.user.role = "ADMIN";
        }
      }
      return session;
    },
  },
});
