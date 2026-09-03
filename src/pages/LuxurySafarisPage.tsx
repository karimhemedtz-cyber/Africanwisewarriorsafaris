/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { Package } from '../types';

interface LuxurySafarisPageProps {
  packages: Package[];
  onSelectPackage: (pkg: Package) => void;
}

export default function LuxurySafarisPage({
  packages,
  onSelectPackage
}: LuxurySafarisPageProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">
      <section className="bg-brand-dark text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          {packages[0]?.imageUrl && (
            <img
              src={packages[0].imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="relative max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-olive italic">
            Exclusive Journeys
          </span>

          <h1 className="mt-3 text-4xl md:text-5xl font-serif font-bold italic">
            Luxury Safaris
          </h1>

          <p className="mt-5 text-white/65 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            Explore our private safari packages. Select any journey below to
            read the complete itinerary and package details.
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
        {packages.length === 0 ? (
          <div className="text-center py-16 text-stone-500">
            No safari packages are currently available.
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => onSelectPackage(pkg)}
                className="group w-full text-left bg-white rounded-3xl overflow-hidden border border-brand-green/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-brand-green/40"
              >
                <div className="relative h-64 sm:h-80 overflow-hidden bg-brand-dark">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                    <span className="text-brand-green uppercase tracking-widest font-bold text-[10px]">
                      {pkg.days} Days Expedition
                    </span>

                    <span className="inline-flex items-center gap-1 text-stone-500 font-semibold text-[11px] uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{pkg.route}</span>
                    </span>
                  </div>

                  <h2 className="font-serif italic text-2xl sm:text-3xl font-bold leading-tight text-stone-900">
                    {pkg.name}
                  </h2>

                  <div className="mt-3 text-sm font-bold text-brand-green">
                    From ${pkg.price}
                  </div>

                  <p className="mt-4 text-xs text-stone-500 leading-relaxed line-clamp-3">
                    {pkg.description
                      .replace(/<[^>]*>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .trim()}
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <span className="text-xs text-stone-500">
                      Read full safari details
                    </span>

                    <span className="shrink-0 inline-flex items-center gap-1 text-brand-green text-[11px] font-bold uppercase tracking-wider">
                      Read More
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
