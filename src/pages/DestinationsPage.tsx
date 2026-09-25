/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import type { Country } from '../eastAfricaData';

interface DestinationsPageProps {
  countries: Country[];
  onSelectCountry: (country: Country) => void;
}

export default function DestinationsPage({
  countries,
  onSelectCountry,
}: DestinationsPageProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">
      {/* Page Header */}
      <div className="bg-brand-dark text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/images/safari_hero_1779964102826.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <MapPin className="w-4 h-4 text-brand-olive" />

            <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-olive">
              East African Destinations
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold italic text-white mb-4">
            Explore Our Countries
          </h1>

          <p className="text-white/60 text-sm md:text-base leading-relaxed">
            Discover the wild heart of East Africa — extraordinary countries,
            iconic parks and reserves, and a lifetime of memories waiting to be
            made.
          </p>
        </div>
      </div>

      {/* Countries Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {countries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 text-sm">
              No destinations are currently available.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {countries.map((country) => (
              <button
                key={country.id}
                type="button"
                onClick={() => onSelectCountry(country)}
                className="group text-left bg-white rounded-2xl overflow-hidden border border-brand-green/10 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={
                      country.heroImage ||
                      '/images/safari_hero_1779964102826.png'
                    }
                    alt={country.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 p-5 text-white">
                    <span className="text-3xl">{country.flag}</span>

                    <h2 className="font-serif font-bold italic text-2xl mt-1">
                      {country.name}
                    </h2>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <p className="text-brand-olive font-semibold text-sm italic mb-2">
                    {country.tagline}
                  </p>

                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                    {country.description
                      ? country.description
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .slice(0, 120)
                      : 'Explore this destination and discover its national parks and safari experiences.'}
                    …
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-[11px] text-stone-400 font-semibold">
                      <MapPin className="w-3 h-3" />

                      <span>
                        {country.parks.length} Park
                        {country.parks.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <span className="text-brand-green text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform flex items-center space-x-1">
                      <span>Explore</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
