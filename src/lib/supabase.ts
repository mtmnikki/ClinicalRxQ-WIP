// lib/supabase.ts
import { createClient } from 'npm:@supabase/supabase-js@2.38.4';
import { type Session } from 'npm:@supabase/supabase-js@2.38.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// This function would be used in your React application
export const createSupabaseClient = (supabaseUrl: string, supabaseAnonKey: string) => {
  return createClient(supabaseUrl, supabaseAnonKey);
};