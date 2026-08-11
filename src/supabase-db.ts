/**
 * Supabase-only data and authentication layer.
 * Production data never falls back to localStorage.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  Package, Booking, NewsItem, CommentItem, AppUser, UserRole,
  SiteSettings, DEFAULT_SITE_SETTINGS
} from './types';

const ADMIN_EMAIL = 'karimuhemedi@yahoo.com';

const requireSupabase = () => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
};

const buildUser = async (u: any): Promise<AppUser> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('role, display_name')
    .eq('id', u.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;

  const role: UserRole = data?.role === 'admin' ? 'admin' : 'user';
  return {
    uid: u.id,
    email: u.email || '',
    displayName: data?.display_name || u.user_metadata?.full_name || u.email?.split('@')[0] || '',
    emailVerified: !!u.email_confirmed_at,
    role
  };
};

export const signIn = async (email: string, password: string): Promise<AppUser> => {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Authentication failed.');
  return buildUser(data.user);
};

export const signUp = async (fullName: string, email: string, password: string): Promise<AppUser> => {
  const client = requireSupabase();
  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail === ADMIN_EMAIL) {
    throw new Error('This email is reserved for the system administrator.');
  }

  const { data, error } = await client.auth.signUp({
    email: normalizedEmail,
    password,
    options: { data: { full_name: fullName.trim() } }
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Account registration failed.');

  return {
    uid: data.user.id,
    email: data.user.email || normalizedEmail,
    displayName: fullName.trim(),
    emailVerified: !!data.user.email_confirmed_at,
    role: 'user'
  };
};

export const logout = async (): Promise<void> => {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
};

export const subscribeToAuth = (callback: (user: AppUser | null) => void): (() => void) => {
  const client = requireSupabase();

  let active = true;
  client.auth.getSession().then(async ({ data, error }) => {
    if (!active) return;
    if (error) {
      console.error('Unable to restore Supabase session:', error);
      callback(null);
      return;
    }
    callback(data.session?.user ? await buildUser(data.session.user) : null);
  }).catch((error) => {
    console.error('Unable to restore Supabase session:', error);
    if (active) callback(null);
  });

  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    if (!active) return;
    // Defer the profile query so we do not make a Supabase request inside the auth callback.
    setTimeout(async () => {
      if (!active) return;
      callback(session?.user ? await buildUser(session.user) : null);
    }, 0);
  });

  return () => {
    active = false;
    subscription.unsubscribe();
  };
};

// ─────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────

export const fetchPackages = async (): Promise<Package[]> => {
  const client = requireSupabase();
  const { data, error } = await client.from('packages').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, name: row.name, price: row.price, route: row.route,
    days: row.days, description: row.description, imageUrl: row.image_url,
    createdAt: row.created_at
  }));
};

export const savePackage = async (pkg: Package): Promise<void> => {
  const client = requireSupabase();
  const { error } = await client.from('packages').upsert({
    id: pkg.id, name: pkg.name, price: pkg.price, route: pkg.route,
    days: pkg.days, description: pkg.description, image_url: pkg.imageUrl
  });
  if (error) throw error;
};

export const deletePackage = async (id: string): Promise<void> => {
  const { error } = await requireSupabase().from('packages').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────

export const submitBooking = async (b: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<void> => {
  const client = requireSupabase();
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error('Please sign in before submitting a booking.');

  const { error } = await client.from('bookings').insert({
    id: 'booking_' + crypto.randomUUID(),
    user_id: user.id,
    name: b.name,
    email: b.email,
    package_id: b.packageId,
    package_name: b.packageName,
    people: b.people,
    message: b.message,
    status: 'pending'
  });
  if (error) throw error;
};

export const fetchBookings = async (): Promise<Booking[]> => {
  const { data, error } = await requireSupabase()
    .from('bookings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, name: row.name, email: row.email, packageId: row.package_id,
    packageName: row.package_name, people: row.people, message: row.message,
    status: row.status, createdAt: row.created_at
  }));
};

export const updateBookingStatus = async (id: string, status: 'pending' | 'reviewed'): Promise<void> => {
  const { error } = await requireSupabase().from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// NEWS
// ─────────────────────────────────────────────

export const fetchNews = async (): Promise<NewsItem[]> => {
  const { data, error } = await requireSupabase().from('news').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, title: row.title, content: row.content,
    imageUrl: row.image_url || '', createdAt: row.created_at
  }));
};

export const saveNews = async (item: NewsItem): Promise<void> => {
  const { error } = await requireSupabase().from('news').upsert({
    id: item.id, title: item.title, content: item.content, image_url: item.imageUrl
  });
  if (error) throw error;
};

export const deleteNews = async (id: string): Promise<void> => {
  const { error } = await requireSupabase().from('news').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────

export const fetchComments = async (): Promise<CommentItem[]> => {
  const { data, error } = await requireSupabase().from('comments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, userId: row.user_id, username: row.username,
    comment: row.comment, createdAt: row.created_at
  }));
};

export const submitComment = async (text: string, user: AppUser): Promise<void> => {
  const client = requireSupabase();
  const { data: { user: authUser } } = await client.auth.getUser();
  if (!authUser || authUser.id !== user.uid) throw new Error('Your session is no longer valid. Please sign in again.');
  if (!authUser.email_confirmed_at) throw new Error('Please verify your email before posting feedback.');

  const { error } = await client.from('comments').insert({
    id: 'comment_' + crypto.randomUUID(), user_id: authUser.id,
    username: user.displayName, comment: text.trim()
  });
  if (error) throw error;
};

export const deleteComment = async (id: string): Promise<void> => {
  const { error } = await requireSupabase().from('comments').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// SITE SETTINGS
// ─────────────────────────────────────────────

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await requireSupabase().from('site_settings').select('*').eq('id', 'main').maybeSingle();
  if (error) throw error;
  return (data?.settings as SiteSettings) || DEFAULT_SITE_SETTINGS;
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  const { error } = await requireSupabase().from('site_settings').upsert({ id: 'main', settings });
  if (error) throw error;
};
