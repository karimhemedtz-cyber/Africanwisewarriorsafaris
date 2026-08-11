/**
 * Supabase client configuration.
 * No credentials are hard-coded in the application.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = String(import.meta.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

const isValidUrl = SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('.supabase.co');
const isValidKey = SUPABASE_ANON_KEY.length > 20;

export const isSupabaseConfigured = isValidUrl && isValidKey;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;
