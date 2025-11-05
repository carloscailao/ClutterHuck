// lib/supabaseClient.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Ensure environment variables exist
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or key is missing! Check your .env file.');
}

// Typed Supabase client with schema 'public'
export const supabase: SupabaseClient<Database, 'public'> = createClient<Database, 'public'>(
  supabaseUrl,
  supabaseKey
);

// ===== Auth helpers =====
export const getCurrentUser = () => supabase.auth.getUser();

// ===== Profiles helpers =====
type ProfilesInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfilesUpdate = Database['public']['Tables']['profiles']['Update'];
type ProfilesRow = Database['public']['Tables']['profiles']['Row'];

// Get profile by UID
export const getProfileByUid = (uid: string) =>
  supabase
    .from('profiles')
    .select('*')
    .eq('auth_uid', uid)
    .single<ProfilesRow>();

// Upsert a profile (insert or update if exists)
export const upsertProfile = (profile: ProfilesInsert) =>
  supabase
    .from('profiles')
    .upsert([profile] as ProfilesInsert[], { onConflict: 'auth_uid' })
    .select('*')
    .single<ProfilesRow>();