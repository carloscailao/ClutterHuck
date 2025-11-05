// mobile-app/types/user/ts

export type UserRole = "user" | "admin";

export interface User {
  created_at: string;
  auth_uid: string;
  role: UserRole;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  avatar_url?: string | null;
}

