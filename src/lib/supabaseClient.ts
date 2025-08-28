// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

// Read from Vite or Node envs (works in dev + build)
const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Fail fast so it’s obvious in dev
  throw new Error('Supabase URL/key missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,        // official default (stores sb-*-auth-token)
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
