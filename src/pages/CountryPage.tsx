/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Country, Park } from '../eastAfricaData';
import { MapPin, ArrowLeft, Calendar, Star, ChevronRight, Pencil } from 'lucide-react';
import { SiteSettings } from '../types';

interface CountryPageProps {
  country: Country;
  onBack: () => void;
  onSelectPark: (park: Park) => void;
  settings: SiteSettings;
  isAdmin?: boolean;
  onEditCountry?: () => void;
}

export default function CountryPage({ country, onBack, onSelectPark, settings, isAdmin, onEditCountry }: CountryPageProps) {
  const overrides = settings.countryOverrides[country.id] || {};
  const tagline = overrides.tagline ?? country.tagline;
  const description = overrides.description ?? country.description;
  const heroImage = overrides.heroImage ?? country.heroImage;

  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">
      <div className="relative h-72 md:h-96 overflow-hidden">
        <img src={heroImage} alt={country.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="absolute top-5 left-5 md:top-8 md:left-10 flex items-center space-x-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 px-4 py-2 rounded-full text-sm font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Destinations</span>
          </button>
          {/* Admin edit button */}
          {isAdmin && onEditCountry && (
            <button
              onClick={onEditCountry}
              className="absolute top-5 right-5 md:top-8 md:right-10 flex items-center space-x-2 bg-white/90 hover:bg-white text-brand-green font-bold text-xs px-4 py-2 rounded-full shadow-lg transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Page</span>
            </button>
          )}
          <div className="text-white">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-4xl">{country.flag}</span>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">East Africa</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold italic">{country.name}</h1>
            <p className="mt-2 text-brand-olive font-semibold text-sm md:text-base">{tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-14">
          <div className="md:col-span-2">
            <h2 className="font-serif text-2xl font-bold text-brand-dark italic mb-4">About {country.name}</h2>
            <p className="text-stone-600 leading-relaxed text-sm md:text-base">{description}</p>
          </div>
          <div className="space-y-4">
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Capital</span>
              </div>
              <p className="font-semibold text-brand-dark">{country.capital}</p>
            </div>
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 mb-1">
                <Star className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">National Parks</span>
              </div>
              <p className="font-semibold text-brand-dark">{country.parks.length} Protected Areas</p>
            </div>
          </div>
        </div>

        <h2 className="font-serif text-2xl font-bold text-brand-dark italic mb-6">Featured Parks & Reserves</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {country.parks.map((park) => {
            const parkOverride = settings.parkOverrides[park.id] || {};
            const parkCover = parkOverride.coverImage ?? park.coverImage;
            const parkTagline = parkOverride.tagline ?? park.tagline;
            return (
              <button
                key={park.id}
                onClick={() => onSelectPark(park)}
                className="group text-left bg-white rounded-2xl overflow-hidden border border-brand-green/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-44 overflow-hidden">
                  <img src={parkCover} alt={park.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <div className="flex items-center space-x-1 text-[10px] text-brand-olive font-bold uppercase tracking-wider mb-1">
                      <Calendar className="w-3 h-3" />
                      <span>{park.bestTime.split('(')[0].trim()}</span>
                    </div>
                    <h3 className="font-serif font-bold italic text-lg leading-tight">{park.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-brand-olive font-semibold italic mb-2">{parkTagline}</p>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{park.description.slice(0, 100)}…</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{park.highlights.length} highlights</span>
                    <ChevronRight className="w-4 h-4 text-brand-green group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
