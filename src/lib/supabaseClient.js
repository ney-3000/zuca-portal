import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

// Verify that the environment variables are correctly populated and not default templates
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== 'your_supabase_url' && 
  !supabaseUrl.includes('placeholder') &&
  !!supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  !supabaseAnonKey.includes('placeholder');

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false
      }
    })
  : null;
