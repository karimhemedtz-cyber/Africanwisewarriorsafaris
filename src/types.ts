/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Package {
  id: string;
  name: string;
  price: number;
  route: string;
  days: number;
  description: string;
  imageUrl: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  packageId: string;
  packageName: string;
  people: number;
  message: string;
  status: 'pending' | 'reviewed';
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  userId: string;
  username: string;
  comment: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'user';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  role: UserRole;
}

export interface SiteSettings {
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroBadgeText: string;
  // Contact section
  phone: string;
  email: string;
  address: string;
  whatsappNumber: string;
  // Countries & Parks (stored as JSON overrides)
  countryOverrides: Record<string, {
    tagline?: string;
    description?: string;
    heroImage?: string;
  }>;
  parkOverrides: Record<string, {
    tagline?: string;
    description?: string;
    coverImage?: string;
    gallery?: { url: string; caption: string }[];
  }>;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroTitle: 'African Wase Warrior Safaris',
  heroSubtitle: 'Welcome to the Untamed',
  heroDescription: "Embark on the ultimate luxurious pilgrimage across East Africa's most storied fields. Through the wisdom of seasoned Wase warrior guides, witness the natural wonders of Serengeti, Maasai Mara, and Ngorongoro Crater in supreme, private luxury.",
  heroImage: '/src/assets/images/safari_hero_1779964102826.png',
  heroBadgeText: 'Award-Winning Private Safaris',
  phone: '+255 750 916 698',
  email: 'Karimhemedi@yahoo.com',
  address: 'Wase Warrior Building, Plot 14, Serena Safari Highway, Arusha, Tanzania',
  whatsappNumber: '255750916698',
  countryOverrides: {},
  parkOverrides: {},
};
