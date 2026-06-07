/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PackageFlow from './components/PackageFlow';
import AdminPanel from './components/AdminPanel';
import ContactSection from './components/ContactSection';
import NewsSection from './components/NewsSection';
import FeedbackSection from './components/FeedbackSection';
import AuthModal from './components/AuthModal';
import SiteSettingsEditor from './components/SiteSettingsEditor';
import { CountryEditor, ParkEditor } from './components/CountryParkEditor';
import DestinationsPage from './pages/DestinationsPage';
import CountryPage from './pages/CountryPage';
import ParkPage from './pages/ParkPage';
import BookingPage from './pages/BookingPage';
import { AppUser, Package, Booking, NewsItem, CommentItem, SiteSettings, DEFAULT_SITE_SETTINGS } from './types';
import { Country, Park } from './eastAfricaData';
import { 
  subscribeToAuth, logout, 
  fetchPackages, fetchBookings, 
  fetchNews, fetchComments,
  fetchSiteSettings, saveSiteSettings,
  isMockMode 
} from './supabase-db';
import { Compass, Mail, Phone, MapPin, Heart, Info } from 'lucide-react';

type PageView = 
  | { type: 'home' }
  | { type: 'destinations' }
  | { type: 'country'; country: Country }
  | { type: 'park'; park: Park; country: Country }
  | { type: 'booking'; preselectedPackageId?: string };

export default function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [isAdminViewActive, setIsAdminViewActive] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [currentPage, setCurrentPage] = useState<PageView>({ type: 'home' });

  const [packages, setPackages] = useState<Package[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loadingApp, setLoadingApp] = useState(true);

  // Inline edit state (for public-facing admin edit buttons on non-admin pages)
  const [heroEditorOpen, setHeroEditorOpen] = useState(false);
  const [contactEditorOpen, setContactEditorOpen] = useState(false);
  const [countryEditTarget, setCountryEditTarget] = useState<Country | null>(null);
  const [parkEditTarget, setParkEditTarget] = useState<Park | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      if (user && user.role === 'admin') setIsAdminViewActive(true);
      else setIsAdminViewActive(false);
      setLoadingApp(false);
    });
    return () => unsubscribe();
  }, []);

  const loadDatabaseData = async () => {
    try {
      const [pkgs, nws, cmt, settings] = await Promise.all([
        fetchPackages(), fetchNews(), fetchComments(), fetchSiteSettings()
      ]);
      setPackages(pkgs || []);
      setNews(nws || []);
      setComments(cmt || []);
      setSiteSettings(settings || DEFAULT_SITE_SETTINGS);

      const storedUser = localStorage.getItem('safari_current_user');
      const isAdmin = currentUser?.role === 'admin' || (storedUser && JSON.parse(storedUser).role === 'admin');
      if (isAdmin) {
        const bks = await fetchBookings();
        setBookings(bks || []);
      }
    } catch (err) {
      console.error("Could not sync safari collections: ", err);
    }
  };

  useEffect(() => { loadDatabaseData(); }, [currentUser]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);

  const handleSaveSettings = async (updated: SiteSettings) => {
    await saveSiteSettings(updated);
    setSiteSettings(updated);
  };

  const handleLogout = async () => {
    try { await logout(); setCurrentUser(null); setIsAdminViewActive(false); }
    catch (err) { console.error("Logout failed:", err); }
  };

  const handleOpenAuth = (mode: 'signin' | 'signup') => {
    setAuthModalMode(mode); setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: AppUser) => {
    setCurrentUser(user);
    if (user.role === 'admin') setIsAdminViewActive(true);
  };

  const scrollSection = (id: string) => {
    if (currentPage.type !== 'home') {
      setCurrentPage({ type: 'home' });
      setTimeout(() => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }, 200);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateTo = (page: PageView) => {
    setCurrentPage(page);
    if (page.type !== 'home' && isAdminViewActive) setIsAdminViewActive(false);
  };

  const isAdmin = currentUser?.role === 'admin';

  const renderPage = () => {
    if (isAdminViewActive && isAdmin) {
      return (
        <AdminPanel 
          packages={packages} bookings={bookings} news={news} comments={comments}
          onRefreshData={loadDatabaseData}
          siteSettings={siteSettings}
          onSaveSettings={handleSaveSettings}
        />
      );
    }

    switch (currentPage.type) {
      case 'destinations':
        return (
          <DestinationsPage
            onSelectCountry={(country) => navigateTo({ type: 'country', country })}
          />
        );
      case 'country':
        return (
          <CountryPage
            country={currentPage.country}
            settings={siteSettings}
            onBack={() => navigateTo({ type: 'destinations' })}
            onSelectPark={(park) => navigateTo({ type: 'park', park, country: currentPage.country })}
            isAdmin={isAdmin}
            onEditCountry={() => setCountryEditTarget(currentPage.country)}
          />
        );
      case 'park':
        return (
          <ParkPage
            park={currentPage.park}
            country={currentPage.country}
            settings={siteSettings}
            onBack={() => navigateTo({ type: 'destinations' })}
            onBackToCountry={() => navigateTo({ type: 'country', country: currentPage.country })}
            onBook={() => navigateTo({ type: 'booking' })}
            currentUser={currentUser}
            onOpenAuth={handleOpenAuth}
            isAdmin={isAdmin}
            onEditPark={() => setParkEditTarget(currentPage.park)}
          />
        );
      case 'booking':
        return (
          <BookingPage
            packages={packages} currentUser={currentUser}
            onBack={() => navigateTo({ type: 'home' })}
            onOpenAuth={handleOpenAuth}
            preselectedPackageId={currentPage.preselectedPackageId}
          />
        );
      default:
        return (
          <div id="guest_view_stack" className="animate-fade-in animate-duration-500">
            <Hero 
              onExploreClick={() => scrollSection('packages')}
              onContactClick={() => scrollSection('contact')}
              settings={siteSettings}
              isAdmin={isAdmin}
              onEditHero={() => setHeroEditorOpen(true)}
            />
            <PackageFlow 
              packages={packages} currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onBookNow={(pkgId) => navigateTo({ type: 'booking', preselectedPackageId: pkgId })}
            />
            <ContactSection
              settings={siteSettings}
              isAdmin={isAdmin}
              onEdit={() => setContactEditorOpen(true)}
            />
            <NewsSection news={news} />
            <FeedbackSection 
              comments={comments} currentUser={currentUser}
              onOpenAuth={handleOpenAuth} onRefreshComments={loadDatabaseData}
            />
          </div>
        );
    }
  };

  return (
    <div id="app_root_layout" className="min-h-screen flex flex-col bg-[#FDFCF8] text-brand-dark selection:bg-brand-green selection:text-white antialiased font-sans">
      
      <Navbar 
        currentUser={currentUser} onLogout={handleLogout} onOpenAuth={handleOpenAuth}
        onToggleAdminView={() => setIsAdminViewActive(!isAdminViewActive)}
        isAdminViewActive={isAdminViewActive}
        onNavigateHome={() => navigateTo({ type: 'home' })}
        onNavigateDestinations={() => navigateTo({ type: 'destinations' })}
        onNavigateBooking={() => navigateTo({ type: 'booking' })}
        onScrollSection={scrollSection}
      />

      {isMockMode && (
        <div id="mock_mode_bar" className="bg-brand-green text-brand-cream text-[11px] font-bold tracking-wider py-2 px-4 shadow-sm border-b border-brand-green/15 text-center flex items-center justify-center space-x-2">
          <Info className="w-4 h-4 text-brand-olive shrink-0" />
          <span>Running in offline mode — changes save to local storage.</span>
        </div>
      )}

      <main className="flex-grow">{renderPage()}</main>

      <footer id="app_footer" className="bg-brand-dark text-brand-cream/80 pt-16 pb-8 border-t border-brand-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start text-left mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-brand-green text-white rounded-lg flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5 text-brand-cream" />
                </div>
                <span className="font-serif italic text-white font-bold tracking-wide uppercase">African Wase Warrior Safaris</span>
              </div>
              <p className="text-xs text-brand-cream/70 max-w-sm leading-relaxed font-sans">
                Guiding intrepid souls across East Africa's wild horizons with unmatched warrior heritage, supreme travel comfort, and rigorous commitment to ecological conservation.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4 font-serif italic">Journeys</h4>
              <ul className="space-y-2 text-xs">
                {['Serengeti Great Migration','Maasai Mara Camps','Ngorongoro Crater Tour'].map(j => (
                  <li key={j}>
                    <button onClick={() => scrollSection('packages')} className="hover:text-brand-olive text-brand-cream transition-colors cursor-pointer text-left font-serif italic">{j}</button>
                  </li>
                ))}
                <li>
                  <button onClick={() => navigateTo({ type: 'destinations' })} className="hover:text-brand-olive text-brand-cream transition-colors cursor-pointer text-left font-serif italic">All Destinations →</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4 font-serif italic">Contact Info</h4>
              <ul className="space-y-2 text-xs text-brand-cream/60 font-sans">
                <li className="flex items-center space-x-2"><Phone className="w-3.5 h-3.5 text-brand-green shrink-0" /><span className="text-brand-cream/80 font-bold">{siteSettings.phone}</span></li>
                <li className="flex items-center space-x-2"><Mail className="w-3.5 h-3.5 text-brand-green shrink-0" /><span className="text-brand-cream/80 font-bold">{siteSettings.email}</span></li>
                <li className="flex items-start space-x-2"><MapPin className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" /><span className="text-brand-cream/80">{siteSettings.address}</span></li>
              </ul>
            </div>
          </div>
          <hr className="border-brand-green/10 my-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-cream/40 font-sans">
            <div>© {new Date().getFullYear()} African Wase Warrior Safaris. All Rights Reserved. Private expeditions licensed by TTB.</div>
            <div className="flex items-center space-x-1 font-semibold text-[11px] uppercase tracking-wider">
              <span className="font-serif italic text-brand-olive font-bold">Crafted in honour of the Savanna Ecosystem</span>
              <Heart className="w-3 h-3 text-[#5A6A40] fill-current animate-pulse" />
            </div>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess} initialMode={authModalMode}
      />

      {/* Inline editor modals — available from public pages when admin is logged in */}
      {heroEditorOpen && (
        <SiteSettingsEditor mode="hero" settings={siteSettings}
          onSave={handleSaveSettings} onClose={() => setHeroEditorOpen(false)} />
      )}
      {contactEditorOpen && (
        <SiteSettingsEditor mode="contact" settings={siteSettings}
          onSave={handleSaveSettings} onClose={() => setContactEditorOpen(false)} />
      )}
      {countryEditTarget && (
        <CountryEditor country={countryEditTarget} settings={siteSettings}
          onSave={handleSaveSettings} onClose={() => setCountryEditTarget(null)} />
      )}
      {parkEditTarget && (
        <ParkEditor park={parkEditTarget} settings={siteSettings}
          onSave={handleSaveSettings} onClose={() => setParkEditTarget(null)} />
      )}

    </div>
  );
}
