/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppUser } from '../types';
import { Compass, Menu, X, Landmark, User, LogOut, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  currentUser: AppUser | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onToggleAdminView: () => void;
  isAdminViewActive: boolean;
  onNavigateHome: () => void;
  onNavigateDestinations: () => void;
  onNavigateBooking: () => void;
  onScrollSection: (id: string) => void;
}

export default function Navbar({ 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  onToggleAdminView,
  isAdminViewActive,
  onNavigateHome,
  onNavigateDestinations,
  onNavigateBooking,
  onScrollSection
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    if (isAdminViewActive) {
      onToggleAdminView();
    }
    onScrollSection(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDFCF8]/90 border-b border-brand-green/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            id="brand_logo"
            onClick={() => { setMobileMenuOpen(false); onNavigateHome(); }}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="flex items-center justify-center w-11 h-11 bg-brand-green text-white rounded-full shadow-md transition-transform group-hover:rotate-12 duration-300">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <span className="block font-serif text-lg font-bold text-brand-green italic leading-none">
                African Wase Warrior
              </span>
              <span className="block text-[10px] text-brand-olive uppercase font-bold tracking-[0.2em] mt-1">
                Safaris & Expeditions
              </span>
            </div>
          </div>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-widest font-semibold text-brand-olive">
            <button 
              onClick={() => handleScroll('hero')}
              className="hover:text-brand-green transition-colors cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => handleScroll('packages')}
              className="hover:text-brand-green transition-colors cursor-pointer"
            >
              Luxury Safaris
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigateDestinations(); }}
              className="hover:text-brand-green transition-colors cursor-pointer"
            >
              Destinations
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); onNavigateBooking(); }}
              className="hover:text-brand-green transition-colors cursor-pointer"
            >
              Book Now
            </button>
            <button 
              onClick={() => handleScroll('news')}
              className="hover:text-brand-green transition-colors cursor-pointer"
            >
              Safari Blog
            </button>
            <button 
              onClick={() => handleScroll('contact')}
              className="hover:text-brand-green transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          {/* Actions / User profile */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-4 bg-white border border-brand-green/10 p-1.5 pl-3 rounded-full">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-stone-900 leading-none">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] text-brand-green font-semibold uppercase tracking-wider mt-0.5">
                    {currentUser.role === 'admin' ? '🛡️ System Admin' : 'Verified Patron'}
                  </span>
                </div>

                {currentUser.role === 'admin' && 
                 currentUser.email?.toLowerCase().trim() === 'karimhemedi@yahoo.com' && (
                  <button
                    id="btn_navbar_toggle_admin"
                    onClick={onToggleAdminView}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer ${
                      isAdminViewActive 
                        ? 'bg-brand-green text-white hover:bg-brand-olive' 
                        : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isAdminViewActive ? 'Exit Admin' : 'Admin Panel'}</span>
                  </button>
                )}

                <button
                  id="btn_logout_desktop"
                  onClick={onLogout}
                  className="p-2 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  title="Logout session"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  id="btn_nav_signin"
                  onClick={() => onOpenAuth('signin')}
                  className="px-4 py-2 text-brand-olive hover:text-brand-green font-bold text-xs uppercase tracking-widest cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="btn_nav_signup"
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2.5 bg-brand-green hover:bg-brand-olive text-white font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all shadow-sm active:scale-95"
                >
                  Book Adventure
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger trigger */}
          <div className="flex items-center md:hidden">
            <button
              id="btn_mobile_menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-emerald-800 hover:bg-stone-50 rounded-lg"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile directory guide"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div id="mobile_drawer" className="md:hidden border-t border-brand-green/10 bg-[#FDFCF8] shadow-xl animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-1.5">
            <button
              onClick={() => handleScroll('hero')}
              className="block w-full text-left px-3 py-2 text-brand-olive font-bold text-xs uppercase tracking-widest hover:bg-brand-green/5 hover:text-brand-green rounded-lg"
            >
              Home
            </button>
            <button
              onClick={() => handleScroll('packages')}
              className="block w-full text-left px-3 py-2 text-brand-olive font-bold text-xs uppercase tracking-widest hover:bg-brand-green/5 hover:text-brand-green rounded-lg"
            >
              Luxury Safaris
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigateDestinations(); }}
              className="block w-full text-left px-3 py-2 text-brand-olive font-bold text-xs uppercase tracking-widest hover:bg-brand-green/5 hover:text-brand-green rounded-lg"
            >
              Destinations
            </button>
            <button
              onClick={() => { setMobileMenuOpen(false); onNavigateBooking(); }}
              className="block w-full text-left px-3 py-2 text-brand-olive font-bold text-xs uppercase tracking-widest hover:bg-brand-green/5 hover:text-brand-green rounded-lg"
            >
              Book Now
            </button>
            <button
              onClick={() => handleScroll('news')}
              className="block w-full text-left px-3 py-2 text-brand-olive font-bold text-xs uppercase tracking-widest hover:bg-brand-green/5 hover:text-brand-green rounded-lg"
            >
              Safari Blog
            </button>
            <button
              onClick={() => handleScroll('feedback')}
              className="block w-full text-left px-3 py-2 text-brand-olive font-bold text-xs uppercase tracking-widest hover:bg-brand-green/5 hover:text-brand-green rounded-lg"
            >
              Reviews
            </button>
            <button
              onClick={() => handleScroll('contact')}
              className="block w-full text-left px-3 py-2 text-brand-olive font-bold text-xs uppercase tracking-widest hover:bg-brand-green/5 hover:text-brand-green rounded-lg"
            >
              Contact Us
            </button>

            {/* User credentials / Auth triggers inside Mobile Drawer */}
            <div className="pt-4 border-t border-brand-green/10 mt-4">
              {currentUser ? (
                <div className="space-y-3">
                  <div className="px-3">
                    <span className="block text-sm font-semibold text-stone-900 leading-tight">
                      {currentUser.displayName}
                    </span>
                    <span className="block text-[10px] font-bold text-brand-green uppercase tracking-wider mt-1">
                      {currentUser.role === 'admin' ? '🛡️ System Admin' : 'Verified Patron'}
                    </span>
                  </div>

                  {currentUser.role === 'admin' && 
                   currentUser.email?.toLowerCase().trim() === 'karimhemedi@yahoo.com' && (
                    <button
                      id="btn_mobile_menu_admin"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onToggleAdminView();
                      }}
                      className="flex items-center justify-center space-x-2 w-full py-2 bg-brand-green text-white font-semibold rounded-full text-sm shadow-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isAdminViewActive ? 'Exit Admin View' : 'Open Admin Dashboard'}</span>
                    </button>
                  )}

                  <button
                    id="btn_logout_mobile"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center justify-center space-x-2 w-full py-2 bg-[#FDFCF8] border border-brand-green/15 text-stone-750 hover:text-red-700 hover:bg-red-50 font-semibold rounded-full text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 px-3">
                  <button
                    id="btn_mobile_menu_signin"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signin');
                    }}
                    className="py-2.5 text-center text-brand-olive font-bold text-xs uppercase tracking-widest border border-brand-green/15 rounded-full"
                  >
                    Sign In
                  </button>
                  <button
                    id="btn_mobile_menu_signup"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuth('signup');
                    }}
                    className="py-2.5 text-center bg-brand-green text-white font-bold text-xs uppercase tracking-widest rounded-full"
                  >
                    Book Now
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
