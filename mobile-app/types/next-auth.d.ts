// mobile-app/types/next-auth.d.ts

import NextAuth from "next-auth";
import { UserRole } from "./user";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string; // corresponds to auth_uid
      email: string | null;
      username?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      avatar_url?: string | null;
      role?: UserRole | null;
    };
  }
}