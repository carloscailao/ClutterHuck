// mobile-app/types/supabase.ts

export type Profiles = {
  created_at: string;
  auth_uid: string;
  role: "user" | "admin";
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  avatar_url?: string | null;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string;
          auth_uid: string;
          role: 'user' | 'admin';
          email: string;
          firstName: string | null;
          lastName: string | null;
          username: string | null;
          avatar_url: string | null;
        };
        Insert: {
          auth_uid: string;
          role: 'user' | 'admin';
          email: string;
          firstName?: string | null;
          lastName?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string; // Optional for inserts (can be auto-generated)
        };
        Update: {
          role?: 'user' | 'admin';
          email?: string;
          firstName?: string | null;
          lastName?: string | null;
          username?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}