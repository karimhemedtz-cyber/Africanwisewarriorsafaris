/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, CalendarDays, MapPin, Banknote } from 'lucide-react';
import { Package } from '../types';

interface PackageDetailPageProps {
  pkg: Package;
  onBack: () => void;
  onBook: () => void;
}

export default function PackageDetailPage({
  pkg,
  onBack,
  onBook
}: PackageDetailPageProps) {
  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">

      {/* Package Image */}
      <section className="relative h-[45vh] min-h-[360px] bg-brand-dark overflow-hidden">
        <img
          src={pkg.imageUrl}
          alt={pkg.name}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <button
          type="button"
          onClick={onBack}
          className="absolute top-6 left-4 sm:left-8 z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/45 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md hover:bg-black/65 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Luxury Safaris
        </button>
      </section>

      {/* Package Information */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-14">

        <div className="bg-white rounded-3xl border border-brand-green/10 shadow-sm p-6 sm:p-8 md:p-10">

          {/* Days + Destination */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">

            <span className="inline-flex items-center gap-2 text-brand-green text-sm font-bold uppercase tracking-widest">
              <CalendarDays className="w-4 h-4" />
              {pkg.days} Days
            </span>

            <span className="inline-flex items-center gap-2 text-stone-500 text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              {pkg.route}
            </span>

          </div>

          {/* Package Name */}
          <h1 className="font-serif italic font-bold text-4xl md:text-5xl text-brand-dark leading-tight">
            {pkg.name}
          </h1>

          {/* Price */}
          <div className="mt-4 inline-flex items-center gap-2 text-brand-green font-bold text-xl">
            <Banknote className="w-5 h-5" />
            <span>From ${pkg.price}</span>
          </div>

          {/* Full Package Description */}
          <article className="mt-8">

            <div
              className="prose prose-stone max-w-none
                prose-headings:font-serif
                prose-headings:italic
                prose-headings:text-brand-dark
                prose-p:text-stone-600
                prose-p:leading-relaxed
                prose-li:text-stone-600
                prose-strong:text-brand-dark
                [&_ul]:list-disc
                [&_ol]:list-decimal
                [&_p]:mb-5"
              dangerouslySetInnerHTML={{ __html: pkg.description }}
            />

          </article>

          {/* Booking */}
          <div className="mt-10 pt-8 border-t border-stone-200">

            <button
              type="button"
              onClick={onBook}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-brand-green hover:bg-brand-olive text-white text-xs font-bold uppercase tracking-widest transition-colors"
            >
              Book This Safari
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}
