/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Supabase client — initialised from VITE_ environment variables.
 * Falls back to a null client (offline/mock mode) if keys are missing.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !SUPABASE_URL.includes('your-project-ref') &&
  !!SUPABASE_ANON_KEY &&
  !SUPABASE_ANON_KEY.includes('your-anon-key');

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
