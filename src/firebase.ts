/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  addDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Package, Booking, NewsItem, CommentItem, AppUser, UserRole, SiteSettings, DEFAULT_SITE_SETTINGS } from './types';

// Check if Firebase configuration is still on placeholders
export const isMockFirebase = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes('PLACEHOLDER') || 
  firebaseConfig.apiKey === 'YOUR_API_KEY';

let app;
let db: any;
let auth: any;

if (!isMockFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    auth = getAuth(app);

    // Initial connection test as mandated by the SKILL.md rules
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Please check your Firebase configuration or network connection.");
        }
      }
    };
    testConnection();
  } catch (error) {
    console.error("Failed to initialize active Firebase client: ", error);
  }
}

// ==========================================
// 1. Error Handling Engine (SKILL MANDATE)
// ==========================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// 2. Default Pre-seeded Mock Data
// ==========================================

const DEFAULT_PACKAGES: Package[] = [
  {
    id: 'serengeti_great_migration',
    name: 'Serengeti Great Migration',
    price: 1550,
    route: 'Arusha - Serengeti - Mara River - Arusha',
    days: 5,
    description: 'Witness millions of wildebeests and zebras risking river crossings and predators across the infinite grasslands of the Serengeti. Spend five days in supreme comfort tracking the Big Five (Lions, Leopards, Elephants, Rhinos, Buffalos) in luxury customized open-roof 4x4 land cruisers.',
    imageUrl: '/images/package_serengeti_1779964123153.png',
    createdAt: new Date('2026-05-28T10:00:00Z').toISOString()
  },
  {
    id: 'masai_mara_adventure',
    name: 'Maasai Mara Luxury Adventure',
    price: 1250,
    route: 'Nairobi - Great Rift Valley - Maasai Mara - Nairobi',
    days: 4,
    description: 'Venture deep into Kenya\'s premier wildlife reserve. Watch black-maned lions patrol their pride, observe cheetahs chasing prey, and visit a traditional Maasai warrior manyatta (village). Conclude each day at an authentic five-star canvas luxury camp under the starlit sky.',
    imageUrl: '/images/package_masaimara_1779964145785.png',
    createdAt: new Date('2026-05-28T10:05:00Z').toISOString()
  },
  {
    id: 'ngorongoro_crater_caldera',
    name: 'Ngorongoro Crater Expedition',
    price: 950,
    route: 'Arusha - Ngorongoro Crater Lodge - Lake Magadi - Arusha',
    days: 3,
    description: 'Descend 600 meters down into a gorgeous, extinct volcanic caldera. This scenic physical haven protects over 25,000 large mammals, including the rare endangered black rhinoceros. Experience breathtaking scenic viewpoints mixed with pink flamingos spanning across Lake Magadi.',
    imageUrl: '/images/package_ngorongoro_1779964167185.png',
    createdAt: new Date('2026-05-28T10:10:00Z').toISOString()
  }
];

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: 'news_1',
    title: 'The Great Wildebeest Migration Reaches the Mara River',
    content: 'Our scouts report that massive herds of wildebeests are piling up along the southern banks of the Mara River. The dangerous annual crossings have begun earlier than expected this season! Secure your frontline seats for nature\'s greatest show today.',
    imageUrl: '',
    createdAt: new Date('2026-05-26T08:00:00Z').toISOString()
  },
  {
    id: 'news_2',
    title: 'Wise Warrior Conservation Program Receives Excellence Award',
    content: 'We are incredibly proud to announce that the African Wise Warrior Safaris foundation has received the East African Conservation Vanguard Trophy. A substantial percentage of all safari bookings go directly to financing local community elders and antipoaching village rangers.',
    imageUrl: '',
    createdAt: new Date('2026-05-20T14:30:00Z').toISOString()
  }
];

const DEFAULT_COMMENTS: CommentItem[] = [
  {
    id: 'comment_1',
    userId: 'mock_patron_1',
    username: 'Sophia Vanderberg',
    comment: 'The Serengeti 5-day package was absolutely magnificent! Our tour guide Karimu shared rich wisdom about the landscapes. Highly recommended safari agency.',
    createdAt: new Date('2026-05-27T12:40:00Z').toISOString()
  },
  {
    id: 'comment_2',
    userId: 'mock_patron_2',
    username: 'Marcus Thorne',
    comment: 'Unbelievable sights! We saw a pride with 14 lions in Maasai Mara, and the luxury tents are cleaner than most urban hotels. Unparalleled adventure!',
    createdAt: new Date('2026-05-25T09:15:00Z').toISOString()
  }
];

// Seed standard localStorage
const initLocalDB = () => {
  if (!localStorage.getItem('safari_packages')) {
    localStorage.setItem('safari_packages', JSON.stringify(DEFAULT_PACKAGES));
  }
  if (!localStorage.getItem('safari_bookings')) {
    localStorage.setItem('safari_bookings', JSON.stringify([]));
  }
  if (!localStorage.getItem('safari_news')) {
    localStorage.setItem('safari_news', JSON.stringify(DEFAULT_NEWS));
  }
  if (!localStorage.getItem('safari_comments')) {
    localStorage.setItem('safari_comments', JSON.stringify(DEFAULT_COMMENTS));
  }
};
initLocalDB();

// Helper to determine role from email
// Admin email — kept as a normalised constant (lowercase) so comparisons are safe
const ADMIN_EMAIL = 'karimhemedi@yahoo.com';

export const getRoleFromEmail = (email: string): UserRole => {
  return email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';
};

// ==========================================
// 3. SERVICE INTERFACE DESIGN
// ==========================================

// --- AUTHENTICATION ---
export const signUp = async (fullName: string, email: string, password: string): Promise<AppUser> => {
  const role = getRoleFromEmail(email);
  
  if (isMockFirebase) {
    // Local Sign Up simulation
    const mockUid = 'mock_uid_' + Math.floor(Math.random() * 1000000);
    const mockUser: AppUser = {
      uid: mockUid,
      email: email,
      displayName: fullName,
      emailVerified: false, // will require verification trigger
      role: role
    };
    // Save to local session
    localStorage.setItem('safari_current_user', JSON.stringify(mockUser));
    return mockUser;
  } else {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: fullName });
      await sendEmailVerification(userCred.user);
      
      const appUser: AppUser = {
        uid: userCred.user.uid,
        email: userCred.user.email || '',
        displayName: fullName,
        emailVerified: userCred.user.emailVerified,
        role: role
      };
      return appUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};

export const signIn = async (email: string, password: string): Promise<AppUser> => {
  const role = getRoleFromEmail(email);

  // Special Admin login local simulation bypass for mock
  if (isMockFirebase) {
    if (email.toLowerCase() === ADMIN_EMAIL && password === 'Warrior2026!') {
      const adminUser: AppUser = {
        uid: 'admin_uid_karimu',
        email: ADMIN_EMAIL,
        displayName: 'Karimu Hemedi (Admin)',
        emailVerified: true,
        role: 'admin'
      };
      localStorage.setItem('safari_current_user', JSON.stringify(adminUser));
      return adminUser;
    }
    
    // Normal user simulated sign in
    const mockUser: AppUser = {
      uid: 'mock_uid_' + email.replace(/[^a-zA-Z]/g, ''),
      email: email,
      displayName: email.split('@')[0],
      emailVerified: true, // Auto verify in simulation for testing ease
      role: role
    };
    localStorage.setItem('safari_current_user', JSON.stringify(mockUser));
    return mockUser;
  } else {
    try {
      // Regular auth
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // Admin override check
      const userRole = getRoleFromEmail(userCred.user.email || '');
      const appUser: AppUser = {
        uid: userCred.user.uid,
        email: userCred.user.email || '',
        displayName: userCred.user.displayName || userCred.user.email?.split('@')[0] || '',
        emailVerified: userCred.user.emailVerified,
        role: userRole
      };
      return appUser;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
};

export const logout = async (): Promise<void> => {
  if (isMockFirebase) {
    localStorage.removeItem('safari_current_user');
  } else {
    await signOut(auth);
  }
};

export const subscribeToAuth = (callback: (user: AppUser | null) => void) => {
  if (isMockFirebase) {
    // Simple polling listener for simulated localStorage sessions
    const checkUser = () => {
      const stored = localStorage.getItem('safari_current_user');
      if (stored) {
        callback(JSON.parse(stored));
      } else {
        callback(null);
      }
    };
    checkUser();
    // Watch storage changes
    window.addEventListener('storage', checkUser);
    // Custom trigger dispatcher listener
    const interval = setInterval(checkUser, 1000);
    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  } else {
    return onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const appUser: AppUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          emailVerified: firebaseUser.emailVerified,
          role: getRoleFromEmail(firebaseUser.email || '')
        };
        callback(appUser);
      } else {
        callback(null);
      }
    });
  }
};

// --- SAFARI PACKAGES ---
export const fetchPackages = async (): Promise<Package[]> => {
  if (isMockFirebase) {
    const list = localStorage.getItem('safari_packages');
    return list ? JSON.parse(list) : DEFAULT_PACKAGES;
  } else {
    const colName = 'packages';
    try {
      const q = query(collection(db, colName));
      const snapshot = await getDocs(q);
      const items: Package[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Package);
      });
      return items;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colName);
    }
  }
};

export const savePackage = async (pkg: Package): Promise<void> => {
  if (isMockFirebase) {
    const list = await fetchPackages();
    const index = list.findIndex(p => p.id === pkg.id);
    if (index >= 0) {
      list[index] = pkg;
    } else {
      list.push(pkg);
    }
    localStorage.setItem('safari_packages', JSON.stringify(list));
  } else {
    const path = `packages/${pkg.id}`;
    try {
      const { id, ...data } = pkg;
      await setDoc(doc(db, 'packages', pkg.id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};

export const deletePackage = async (id: string): Promise<void> => {
  if (isMockFirebase) {
    const list = await fetchPackages();
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem('safari_packages', JSON.stringify(filtered));
  } else {
    const path = `packages/${id}`;
    try {
      await deleteDoc(doc(db, 'packages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
};

// --- BOOKING REQUESTS ---
export const fetchBookings = async (): Promise<Booking[]> => {
  if (isMockFirebase) {
    const list = localStorage.getItem('safari_bookings');
    return list ? JSON.parse(list) : [];
  } else {
    const colName = 'bookings';
    try {
      const snapshot = await getDocs(collection(db, colName));
      const items: Booking[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as Booking);
      });
      return items;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colName);
    }
  }
};

export const submitBooking = async (b: Omit<Booking, 'id' | 'createdAt' | 'status'>): Promise<void> => {
  const newBooking: Booking = {
    ...b,
    id: 'booking_' + Math.floor(Math.random() * 1000000) + '_' + Date.now(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (isMockFirebase) {
    const list = await fetchBookings();
    list.push(newBooking);
    localStorage.setItem('safari_bookings', JSON.stringify(list));
  } else {
    const path = `bookings/${newBooking.id}`;
    try {
      const { id, ...data } = newBooking;
      await setDoc(doc(db, 'bookings', newBooking.id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};

export const updateBookingStatus = async (id: string, status: 'pending' | 'reviewed'): Promise<void> => {
  if (isMockFirebase) {
    const list = await fetchBookings();
    const index = list.findIndex(b => b.id === id);
    if (index >= 0) {
      list[index].status = status;
      localStorage.setItem('safari_bookings', JSON.stringify(list));
    }
  } else {
    const path = `bookings/${id}`;
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  }
};

// --- NEWS AND BLOGS ---
export const fetchNews = async (): Promise<NewsItem[]> => {
  if (isMockFirebase) {
    const list = localStorage.getItem('safari_news');
    return list ? JSON.parse(list) : DEFAULT_NEWS;
  } else {
    const colName = 'news';
    try {
      const snapshot = await getDocs(collection(db, colName));
      const items: NewsItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as NewsItem);
      });
      return items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colName);
    }
  }
};

export const saveNews = async (news: NewsItem): Promise<void> => {
  if (isMockFirebase) {
    const list = await fetchNews();
    const index = list.findIndex(n => n.id === news.id);
    if (index >= 0) {
      list[index] = news;
    } else {
      list.push(news);
    }
    localStorage.setItem('safari_news', JSON.stringify(list));
  } else {
    const path = `news/${news.id}`;
    try {
      const { id, ...data } = news;
      await setDoc(doc(db, 'news', news.id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};

export const deleteNews = async (id: string): Promise<void> => {
  if (isMockFirebase) {
    const list = await fetchNews();
    const filtered = list.filter(n => n.id !== id);
    localStorage.setItem('safari_news', JSON.stringify(filtered));
  } else {
    const path = `news/${id}`;
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
};

// --- USER FEEDBACK AND COMMENTS ---
export const fetchComments = async (): Promise<CommentItem[]> => {
  if (isMockFirebase) {
    const list = localStorage.getItem('safari_comments');
    return list ? JSON.parse(list) : DEFAULT_COMMENTS;
  } else {
    const colName = 'comments';
    try {
      const snapshot = await getDocs(collection(db, colName));
      const items: CommentItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as CommentItem);
      });
      return items.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, colName);
    }
  }
};

export const submitComment = async (commentText: string, user: AppUser): Promise<void> => {
  const newComment: CommentItem = {
    id: 'comment_' + Math.floor(Math.random() * 1000000) + '_' + Date.now(),
    userId: user.uid,
    username: user.displayName || user.email.split('@')[0],
    comment: commentText,
    createdAt: new Date().toISOString()
  };

  if (isMockFirebase) {
    const list = await fetchComments();
    list.unshift(newComment);
    localStorage.setItem('safari_comments', JSON.stringify(list));
  } else {
    const path = `comments/${newComment.id}`;
    try {
      const { id, ...data } = newComment;
      await setDoc(doc(db, 'comments', newComment.id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }
};

export const deleteComment = async (id: string): Promise<void> => {
  if (isMockFirebase) {
    const list = await fetchComments();
    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem('safari_comments', JSON.stringify(filtered));
  } else {
    const path = `comments/${id}`;
    try {
      await deleteDoc(doc(db, 'comments', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, path);
    }
  }
};

// --- SITE SETTINGS ---
export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  if (isMockFirebase) {
    const stored = localStorage.getItem('safari_site_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SITE_SETTINGS;
  } else {
    try {
      const snap = await getDoc(doc(db, 'settings', 'site'));
      if (snap.exists()) return snap.data() as SiteSettings;
      return DEFAULT_SITE_SETTINGS;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'settings/site');
    }
  }
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  if (isMockFirebase) {
    localStorage.setItem('safari_site_settings', JSON.stringify(settings));
  } else {
    try {
      await setDoc(doc(db, 'settings', 'site'), settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/site');
    }
  }
};
