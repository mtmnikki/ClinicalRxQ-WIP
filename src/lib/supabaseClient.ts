import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// This is the single, correct way to load your credentials in a Vite project.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Initialize and export the single, definitive Supabase client for the entire app to use.
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

