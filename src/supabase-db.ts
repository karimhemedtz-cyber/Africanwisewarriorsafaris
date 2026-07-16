/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * supabase-db.ts
 * All database + auth operations using Supabase.
 * This mirrors firebase.ts but uses Supabase instead.
 * Import from here instead of firebase.ts once you switch.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import {
  Package, Booking, NewsItem, CommentItem, AppUser, UserRole,
  SiteSettings, DEFAULT_SITE_SETTINGS
} from './types';

// ─────────────────────────────────────────────
// ADMIN — SINGLE OWNER, HARD-LOCKED
// Only karimhemedi@yahoo.com is ever admin. No exceptions.
// ─────────────────────────────────────────────
const ADMIN_EMAIL = 'karimhemedi@yahoo.com';
export const isMockMode = !isSupabaseConfigured;

const getRoleFromEmail = (email: string): UserRole => {
  if (!email) return 'user';
  return email.toLowerCase().trim() === ADMIN_EMAIL ? 'admin' : 'user';
};

// Called on every AppUser returned — prevents any role escalation
const enforceRole = (user: AppUser): AppUser => ({
  ...user,
  role: user.email.toLowerCase().trim() === ADMIN_EMAIL ? 'admin' : 'user'
});

// ─────────────────────────────────────────────
// LOCAL STORAGE FALLBACK (offline/mock mode)
// ─────────────────────────────────────────────
const LS = {
  get: <T>(key: string, fallback: T): T => {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set: (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────

export const signIn = async (email: string, password: string): Promise<AppUser> => {
  if (isMockMode) {
    if (email.toLowerCase() === ADMIN_EMAIL && password === 'Warrior2026!') {
      const user: AppUser = {
        uid: 'admin_uid_karimu', email: ADMIN_EMAIL,
        displayName: 'Karimu Hemedi', emailVerified: true, role: 'admin'
      };
      localStorage.setItem('safari_current_user', JSON.stringify(user));
      return user;
    }
    const user: AppUser = {
      uid: 'mock_' + email.replace(/[^a-z]/gi, ''),
      email, displayName: email.split('@')[0], emailVerified: true, role: 'user'
    };
    localStorage.setItem('safari_current_user', JSON.stringify(user));
    return user;
  }

  console.log('[Auth] signIn called, isMockMode:', isMockMode, 'supabase:', !!supabase);

  // Always allow the admin to log in even before Supabase auth user is created
  if (email.toLowerCase() === ADMIN_EMAIL && password === 'Warrior2026!') {
    try {
      const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        const u = data.user;
        return {
          uid: u.id, email: u.email!, role: 'admin' as UserRole,
          displayName: u.user_metadata?.full_name || 'Karimu Hemedi',
          emailVerified: !!u.email_confirmed_at
        };
      }
    } catch {}
    // Supabase user not created yet — use local admin session
    const adminUser: AppUser = {
      uid: 'admin_uid_karimu', email: ADMIN_EMAIL,
      displayName: 'Karimu Hemedi', emailVerified: true, role: 'admin'
    };
    localStorage.setItem('safari_current_user', JSON.stringify(adminUser));
    return adminUser;
  }

  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  console.log('[Auth] signIn result — error:', error, 'user:', data?.user?.email);
  if (error) throw new Error(error.message);
  const u = data.user!;
  return enforceRole({
    uid: u.id, email: u.email!, role: getRoleFromEmail(u.email!),
    displayName: u.user_metadata?.full_name || u.email!.split('@')[0],
    emailVerified: !!u.email_confirmed_at
  });
};

export const signUp = async (fullName: string, email: string, password: string): Promise<AppUser> => {
  if (isMockMode) {
    const user: AppUser = {
      uid: 'mock_' + email.replace(/[^a-z]/gi, ''),
      email, displayName: fullName, emailVerified: false, role: getRoleFromEmail(email)
    };
    localStorage.setItem('safari_current_user', JSON.stringify(user));
    return user;
  }

  const { data, error } = await supabase!.auth.signUp({
    email, password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw new Error(error.message);
  const u = data.user!;
  return {
    uid: u.id, email: u.email!, role: getRoleFromEmail(u.email!),
    displayName: fullName, emailVerified: !!u.email_confirmed_at
  };
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('safari_current_user');
  if (!isMockMode) await supabase!.auth.signOut();
};

export const subscribeToAuth = (callback: (user: AppUser | null) => void): (() => void) => {
  if (isMockMode) {
    const stored = localStorage.getItem('safari_current_user');
    callback(stored ? JSON.parse(stored) : null);
    return () => {};
  }

  const buildUser = (u: any): AppUser => enforceRole({
    uid: u.id,
    email: u.email!,
    role: getRoleFromEmail(u.email!),
    displayName: u.user_metadata?.full_name || u.email!.split('@')[0],
    emailVerified: !!u.email_confirmed_at
  });

  // Check existing session immediately on load
  supabase!.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      const user = buildUser(data.session.user);
      localStorage.setItem('safari_current_user', JSON.stringify(user));
      callback(user);
    } else {
      // Fall back to localStorage (handles admin local session)
      const stored = localStorage.getItem('safari_current_user');
      callback(stored ? JSON.parse(stored) : null);
    }
  });

  // Listen for auth changes (login / logout)
  const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      const user = buildUser(session.user);
      localStorage.setItem('safari_current_user', JSON.stringify(user));
      callback(user);
    } else {
      // Only clear if no local admin session
      const stored = localStorage.getItem('safari_current_user');
      const localUser = stored ? JSON.parse(stored) : null;
      if (localUser?.uid === 'admin_uid_karimu') {
        callback(localUser); // keep local admin session alive
      } else {
        localStorage.removeItem('safari_current_user');
        callback(null);
      }
    }
  });

  return () => subscription.unsubscribe();
};

// ─────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────

export const fetchPackages = async (): Promise<Package[]> => {
  if (isMockMode) return LS.get('safari_packages', DEFAULT_PACKAGES);
  const { data, error } = await supabase!.from('packages').select('*').order('created_at');
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, name: row.name, price: row.price, route: row.route,
    days: row.days, description: row.description, imageUrl: row.image_url,
    createdAt: row.created_at
  }));
};

export const savePackage = async (pkg: Package): Promise<void> => {
  if (isMockMode) {
    const list = LS.get<Package[]>('safari_packages', []);
    const idx = list.findIndex(p => p.id === pkg.id);
    if (idx >= 0) list[idx] = pkg; else list.push(pkg);
    LS.set('safari_packages', list);
    return;
  }
  const { error } = await supabase!.from('packages').upsert({
    id: pkg.id, name: pkg.name, price: pkg.price, route: pkg.route,
    days: pkg.days, description: pkg.description, image_url: pkg.imageUrl
  });
  if (error) throw error;
};

export const deletePackage = async (id: string): Promise<void> => {
  if (isMockMode) {
    LS.set('safari_packages', LS.get<Package[]>('safari_packages', []).filter(p => p.id !== id));
    return;
  }
  const { error } = await supabase!.from('packages').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────

export const submitBooking = async (b: Omit<Booking, 'id' | 'status' | 'createdAt'>): Promise<void> => {
  const newBooking: Booking = {
    ...b, id: 'booking_' + Date.now(), status: 'pending', createdAt: new Date().toISOString()
  };
  if (isMockMode) {
    const list = LS.get<Booking[]>('safari_bookings', []);
    list.push(newBooking);
    LS.set('safari_bookings', list);
    return;
  }
  const { error } = await supabase!.from('bookings').insert({
    id: newBooking.id, name: newBooking.name, email: newBooking.email,
    package_id: newBooking.packageId, package_name: newBooking.packageName,
    people: newBooking.people, message: newBooking.message,
    status: 'pending'
  });
  if (error) throw error;
};

export const fetchBookings = async (): Promise<Booking[]> => {
  if (isMockMode) return LS.get('safari_bookings', []);
  const { data, error } = await supabase!.from('bookings').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, name: row.name, email: row.email, packageId: row.package_id,
    packageName: row.package_name, people: row.people, message: row.message,
    status: row.status, createdAt: row.created_at
  }));
};

export const updateBookingStatus = async (id: string, status: 'pending' | 'reviewed'): Promise<void> => {
  if (isMockMode) {
    const list = LS.get<Booking[]>('safari_bookings', []);
    const b = list.find(x => x.id === id);
    if (b) b.status = status;
    LS.set('safari_bookings', list);
    return;
  }
  const { error } = await supabase!.from('bookings').update({ status }).eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// NEWS
// ─────────────────────────────────────────────

export const fetchNews = async (): Promise<NewsItem[]> => {
  if (isMockMode) return LS.get('safari_news', DEFAULT_NEWS);
  const { data, error } = await supabase!.from('news').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, title: row.title, content: row.content,
    imageUrl: row.image_url || '', createdAt: row.created_at
  }));
};

export const saveNews = async (item: NewsItem): Promise<void> => {
  if (isMockMode) {
    const list = LS.get<NewsItem[]>('safari_news', []);
    const idx = list.findIndex(n => n.id === item.id);
    if (idx >= 0) list[idx] = item; else list.push(item);
    LS.set('safari_news', list);
    return;
  }
  const { error } = await supabase!.from('news').upsert({
    id: item.id, title: item.title, content: item.content, image_url: item.imageUrl
  });
  if (error) throw error;
};

export const deleteNews = async (id: string): Promise<void> => {
  if (isMockMode) {
    LS.set('safari_news', LS.get<NewsItem[]>('safari_news', []).filter(n => n.id !== id));
    return;
  }
  const { error } = await supabase!.from('news').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────

export const fetchComments = async (): Promise<CommentItem[]> => {
  if (isMockMode) return LS.get('safari_comments', DEFAULT_COMMENTS);
  const { data, error } = await supabase!.from('comments').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id, userId: row.user_id, username: row.username,
    comment: row.comment, createdAt: row.created_at
  }));
};

export const submitComment = async (text: string, user: AppUser): Promise<void> => {
  const newComment: CommentItem = {
    id: 'comment_' + Date.now(), userId: user.uid,
    username: user.displayName, comment: text, createdAt: new Date().toISOString()
  };
  if (isMockMode) {
    const list = LS.get<CommentItem[]>('safari_comments', []);
    list.push(newComment);
    LS.set('safari_comments', list);
    return;
  }
  const { error } = await supabase!.from('comments').insert({
    id: newComment.id, user_id: newComment.userId,
    username: newComment.username, comment: newComment.comment
  });
  if (error) throw error;
};

export const deleteComment = async (id: string): Promise<void> => {
  if (isMockMode) {
    LS.set('safari_comments', LS.get<CommentItem[]>('safari_comments', []).filter(c => c.id !== id));
    return;
  }
  const { error } = await supabase!.from('comments').delete().eq('id', id);
  if (error) throw error;
};

// ─────────────────────────────────────────────
// SITE SETTINGS
// ─────────────────────────────────────────────

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  if (isMockMode) return LS.get('safari_site_settings', DEFAULT_SITE_SETTINGS);
  const { data, error } = await supabase!.from('site_settings').select('*').eq('id', 'main').single();
  if (error || !data) return DEFAULT_SITE_SETTINGS;
  return data.settings as SiteSettings;
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  if (isMockMode) { LS.set('safari_site_settings', settings); return; }
  const { error } = await supabase!.from('site_settings').upsert({ id: 'main', settings });
  if (error) throw error;
};

// ─────────────────────────────────────────────
// DEFAULT DATA (for offline/mock mode)
// ─────────────────────────────────────────────

const DEFAULT_PACKAGES: Package[] = [
  {
    id: 'serengeti_5day',
    name: 'Serengeti Great Migration',
    price: 2800,
    route: 'Arusha → Tarangire → Serengeti → Ngorongoro → Arusha',
    days: 5,
    description: 'Follow the greatest wildlife show on Earth. Witness 1.5 million wildebeest crossing the Mara River on this all-inclusive luxury expedition with private tented camps.',
    imageUrl: '/src/assets/images/package_serengeti_1779964123153.png',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'masai_mara_adventure',
    name: 'Maasai Mara Luxury Adventure',
    price: 3200,
    route: 'Nairobi → Great Rift Valley → Maasai Mara → Nairobi',
    days: 7,
    description: "Watch black-maned lions patrol their pride, observe cheetahs chasing prey, and visit a traditional Maasai warrior village. Conclude each day at an authentic five-star canvas luxury camp.",
    imageUrl: '/src/assets/images/package_masaimara_1779964145785.png',
    createdAt: new Date('2026-01-02').toISOString()
  },
  {
    id: 'ngorongoro_crater',
    name: 'Ngorongoro Crater Experience',
    price: 1900,
    route: 'Arusha → Ngorongoro Crater → Lake Manyara → Arusha',
    days: 3,
    description: "Descend into the world's largest intact volcanic caldera sheltering over 25,000 large mammals including the endangered black rhino. A condensed luxury safari for time-pressed adventurers.",
    imageUrl: '/src/assets/images/package_ngorongoro_1779964167185.png',
    createdAt: new Date('2026-01-03').toISOString()
  }
];

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news_1',
    title: 'The Great Wildebeest Migration Reaches the Mara River',
    content: 'Our scouts report that massive herds of wildebeests are piling up along the southern banks of the Mara River. The dangerous annual crossings have begun earlier than expected this season!',
    imageUrl: '/src/assets/images/package_serengeti_1779964123153.png',
    createdAt: new Date('2026-05-26T08:00:00Z').toISOString()
  },
  {
    id: 'news_2',
    title: 'Wise Warrior Conservation Program Receives Excellence Award',
    content: 'We are proud to announce that the African Wise Warrior Safaris foundation has received the East African Conservation Vanguard Trophy. A percentage of all bookings goes directly to financing local antipoaching village rangers.',
    imageUrl: '/src/assets/images/package_masaimara_1779964145785.png',
    createdAt: new Date('2026-05-20T14:30:00Z').toISOString()
  }
];

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: 'comment_1', userId: 'mock_patron_1', username: 'Sophia Vanderberg',
    comment: 'The Serengeti 5-day package was absolutely magnificent! Our guide Karimu shared rich wisdom about the landscapes. Highly recommended.',
    createdAt: new Date('2026-05-27T12:40:00Z').toISOString()
  },
  {
    id: 'comment_2', userId: 'mock_patron_2', username: 'Marcus Thorne',
    comment: 'Unbelievable sights! We saw a pride with 14 lions in Maasai Mara, and the luxury tents are cleaner than most urban hotels. Unparalleled adventure!',
    createdAt: new Date('2026-05-25T09:15:00Z').toISOString()
  }
];
