/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Country, Park } from '../eastAfricaData';
import {
  MapPin,
  ArrowLeft,
  Calendar,
  Star,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import { SiteSettings } from '../types';

interface CountryPageProps {
  country: Country;
  onBack: () => void;
  onSelectPark: (park: Park) => void;
  settings: SiteSettings;
  isAdmin?: boolean;
  onEditCountry?: () => void;
}

function stripHtml(html: string) {
  if (!html) return '';

  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function CountryPage({
  country,
  onBack,
  onSelectPark,
  settings,
  isAdmin,
  onEditCountry,
}: CountryPageProps) {
  const overrides = settings.countryOverrides[country.id] || {};

  const name = overrides.name ?? country.name;
  const capital = overrides.capital ?? country.capital;
  const tagline = overrides.tagline ?? country.tagline;
  const description = overrides.description ?? country.description;
  const heroImage = overrides.heroImage ?? country.heroImage;

  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in overflow-x-hidden">
      {/* Country Hero */}
      <section className="relative h-[360px] sm:h-80 md:h-96 overflow-hidden">
        <img
          src={heroImage}
          alt={name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/75" />

        <div className="absolute inset-0">
          <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative flex flex-col justify-end pb-8 sm:pb-10 md:pb-12">
            {/* Back */}
            <button
              onClick={onBack}
              className="absolute top-5 left-4 sm:left-6 md:left-8 flex items-center gap-2 text-white/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-4 py-2.5 rounded-full text-sm font-semibold transition-all touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Destinations</span>
            </button>

            {/* Admin */}
            {isAdmin && onEditCountry && (
              <button
                onClick={onEditCountry}
                className="absolute top-5 right-4 sm:right-6 md:right-8 flex items-center gap-2 bg-white/90 hover:bg-white text-brand-green font-bold text-xs px-4 py-2.5 rounded-full shadow-lg transition-all touch-manipulation"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Page</span>
              </button>
            )}

            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl sm:text-4xl">
                  {country.flag || '🌍'}
                </span>

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/65">
                  East Africa
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold italic leading-tight">
                {name}
              </h1>

              <p className="mt-2 text-brand-olive font-semibold text-sm sm:text-base max-w-2xl">
                {tagline}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Country Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
        {/* About + Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-14 sm:mb-16">
          <div className="md:col-span-2 min-w-0">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark italic mb-4">
              About {name}
            </h2>

            <div
              className="prose prose-stone max-w-none text-sm sm:text-base leading-relaxed
                         prose-p:my-3
                         prose-headings:font-serif
                         prose-headings:text-brand-dark
                         prose-ul:list-disc
                         prose-ol:list-decimal
                         prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>

          <div className="space-y-4">
            {/* Capital */}
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-brand-green" />

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                  Capital
                </span>
              </div>

              <p className="font-semibold text-brand-dark">
                {capital}
              </p>
            </div>

            {/* Parks count */}
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-brand-green" />

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                  National Parks
                </span>
              </div>

              <p className="font-semibold text-brand-dark">
                {country.parks.length} Protected Areas
              </p>
            </div>
          </div>
        </section>

        {/* Parks */}
        <section>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-dark italic">
                Featured Parks & Reserves
              </h2>

              <p className="text-sm text-stone-500 mt-1">
                Explore protected areas and safari destinations in {name}.
              </p>
            </div>
          </div>

          {country.parks.length === 0 ? (
            <div className="bg-white border border-brand-green/10 rounded-2xl p-8 text-center">
              <p className="text-sm text-stone-500">
                No parks or protected areas have been added yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {country.parks.map((park) => {
                const parkOverride = settings.parkOverrides[park.id] || {};

                const parkName = parkOverride.name ?? park.name;
                const parkCover =
                  parkOverride.coverImage ?? park.coverImage;
                const parkTagline =
                  parkOverride.tagline ?? park.tagline;
                const parkDescription =
                  parkOverride.description ?? park.description;
                const parkHighlights =
                  parkOverride.highlights ?? park.highlights;

                const descriptionPreview = stripHtml(
                  parkDescription
                );

                return (
                  <button
                    key={park.id}
                    onClick={() => onSelectPark(park)}
                    className="group w-full text-left bg-white rounded-2xl overflow-hidden border border-brand-green/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 touch-manipulation"
                  >
                    {/* Image */}
                    <div className="relative h-48 sm:h-44 overflow-hidden">
                      <img
                        src={parkCover}
                        alt={parkName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <div className="flex items-center gap-1 text-[10px] text-brand-olive font-bold uppercase tracking-wider mb-1">
                          <Calendar className="w-3 h-3" />

                          <span>
                            {park.bestTime
                              ? park.bestTime.split('(')[0].trim()
                              : 'Year-round'}
                          </span>
                        </div>

                        <h3 className="font-serif font-bold italic text-lg leading-tight">
                          {parkName}
                        </h3>
                      </div>
                    </div>

                    {/* Card content */}
                    <div className="p-4">
                      {parkTagline && (
                        <p className="text-xs text-brand-olive font-semibold italic mb-2">
                          {parkTagline}
                        </p>
                      )}

                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 min-h-[32px]">
                        {descriptionPreview || 'Explore this protected area.'}
                      </p>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                          {parkHighlights.length} highlights
                        </span>

                        <span className="flex items-center gap-1 text-xs font-bold text-brand-green">
                          Explore

                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
