/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = ((import.meta.env.VITE_SUPABASE_URL as string) || '').trim().replace(/\/+$/, '');
const SUPABASE_ANON_KEY = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '').trim();

// Log in dev/prod so we can debug
console.log('[Supabase] URL:', SUPABASE_URL || '(not set)');
console.log('[Supabase] Key starts with:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.slice(0, 20) + '...' : '(not set)');

const isValidUrl = !!SUPABASE_URL && SUPABASE_URL.startsWith('https://') && SUPABASE_URL.includes('supabase.co');
const isValidKey = !!SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20;

export const isSupabaseConfigured = isValidUrl && isValidKey;

console.log('[Supabase] Configured:', isSupabaseConfigured);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;
