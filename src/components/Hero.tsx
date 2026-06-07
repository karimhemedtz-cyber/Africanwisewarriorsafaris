/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Compass, ShieldCheck, Pencil } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  onExploreClick: () => void;
  onContactClick: () => void;
  settings: SiteSettings;
  isAdmin?: boolean;
  onEditHero?: () => void;
}

export default function Hero({ onExploreClick, onContactClick, settings, isAdmin, onEditHero }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center justify-center bg-stone-900 overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <img
          src={settings.heroImage}
          alt="African Wase Warrior Safaris Landscape"
          className="w-full h-full object-cover scale-105 animate-subtle-spin"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-black/60" />
        <div className="absolute inset-0 bg-emerald-950/20 mix-blend-color" />
      </div>

      {/* Admin Edit Button */}
      {isAdmin && onEditHero && (
        <button
          onClick={onEditHero}
          className="absolute top-5 right-5 z-20 flex items-center space-x-2 bg-white/90 hover:bg-white text-brand-green font-bold text-xs px-4 py-2 rounded-full shadow-lg transition-all border border-brand-green/20"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Hero</span>
        </button>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16">

        <div className="inline-flex items-center space-x-2 px-3 py-1.5 bg-[#2D4A22]/30 border border-[#2D4A22]/20 backdrop-blur-md rounded-full text-white text-xs font-semibold uppercase tracking-widest mb-6 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-brand-olive" />
          <span>{settings.heroBadgeText}</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-none mb-6 animate-slide-up">
          <span className="block text-brand-olive font-serif italic text-3xl sm:text-4xl lg:text-5xl font-normal tracking-wide normal-case mb-2">
            {settings.heroSubtitle}
          </span>
          {settings.heroTitle}
        </h1>

        <p className="max-w-2xl mx-auto text-stone-200 text-base sm:text-lg lg:text-xl font-medium leading-relaxed mb-10">
          {settings.heroDescription}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="btn_hero_explore"
            onClick={onExploreClick}
            className="group flex items-center space-x-2.5 px-8 py-4 bg-brand-green hover:bg-brand-olive text-white font-bold text-sm tracking-wider uppercase rounded-full transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <span>Explore Expeditions</span>
            <Compass className="w-4 h-4 transform group-hover:rotate-45 transition-transform" />
          </button>

          <button
            id="btn_hero_contact"
            onClick={onContactClick}
            className="flex items-center space-x-2 px-8 py-4 bg-transparent border border-white hover:bg-white hover:text-[#1A1A1A] text-white font-bold text-sm tracking-wider uppercase rounded-full transition-all active:scale-95 cursor-pointer"
          >
            <span>Speak with a Consultant</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      <div
        onClick={onExploreClick}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/60 hover:text-white cursor-pointer transition-colors z-10"
      >
        <span className="text-[10px] uppercase font-bold tracking-widest mb-1.5">Slide to Wilderness</span>
        <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center p-1">
          <div className="w-1 h-2 bg-emerald-400 rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
}
