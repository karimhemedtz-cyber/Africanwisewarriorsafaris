/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Park, Country } from '../eastAfricaData';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  X,
  Pencil,
} from 'lucide-react';
import { AppUser, SiteSettings } from '../types';

interface ParkPageProps {
  park: Park;
  country: Country;
  onBack: () => void;
  onBackToCountry: () => void;
  onBook: () => void;
  currentUser: AppUser | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  settings: SiteSettings;
  isAdmin?: boolean;
  onEditPark?: () => void;
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

export default function ParkPage({
  park,
  country,
  onBack,
  onBackToCountry,
  onBook,
  currentUser,
  onOpenAuth,
  settings,
  isAdmin,
  onEditPark,
}: ParkPageProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  /*
   * Park data comes from either:
   * 1. the original static country data, or
   * 2. a custom country created from Admin.
   *
   * Therefore the park object itself is the primary source.
   * Existing parkOverrides are applied only when available.
   */
  const overrides = settings.parkOverrides[park.id] || {};

  const name = overrides.name ?? park.name;
  const tagline = overrides.tagline ?? park.tagline;
  const description = overrides.description ?? park.description;
  const coverImage = overrides.coverImage ?? park.coverImage;
  const gallery = overrides.gallery ?? park.gallery;
  const highlights = overrides.highlights ?? park.highlights;

  const countryName = country.name;
  const countryFlag = country.flag || '🌍';

  const bestTime = park.bestTime || 'Year-round';
  const location = park.country || countryName;

  const prevImage = () => {
    if (gallery.length <= 1) return;

    setGalleryIndex(
      (index) => (index - 1 + gallery.length) % gallery.length
    );
  };

  const nextImage = () => {
    if (gallery.length <= 1) return;

    setGalleryIndex(
      (index) => (index + 1) % gallery.length
    );
  };

  const currentGalleryImage = gallery[galleryIndex];

  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in overflow-x-hidden">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative h-[360px] sm:h-[420px] md:h-[520px] overflow-hidden">

        <img
          src={coverImage}
          alt={name}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/15 to-black/80" />

        <div className="absolute inset-0">
          <div className="max-w-6xl mx-auto h-full px-4 sm:px-6 lg:px-8 relative flex flex-col justify-end pb-8 sm:pb-10 md:pb-14">

            {/* Back to destinations */}
            <button
              onClick={onBack}
              className="absolute top-5 left-4 sm:left-6 md:left-8 flex items-center gap-2 text-white/90 hover:text-white bg-black/35 hover:bg-black/55 backdrop-blur-sm px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all touch-manipulation"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Destinations</span>
            </button>

            {/* Admin */}
            {isAdmin && onEditPark && (
              <button
                onClick={onEditPark}
                className="absolute top-5 right-4 sm:right-6 md:right-8 flex items-center gap-2 bg-white/90 hover:bg-white text-brand-green font-bold text-xs px-4 py-2.5 rounded-full shadow-lg transition-all touch-manipulation"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Park</span>
              </button>
            )}

            {/* Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs mb-4 text-white/70">
              <button
                onClick={onBack}
                className="hover:text-white transition-colors"
              >
                Destinations
              </button>

              <span>/</span>

              <button
                onClick={onBackToCountry}
                className="hover:text-white transition-colors"
              >
                {countryName}
              </button>

              <span>/</span>

              <span className="text-white font-semibold">
                {name}
              </span>
            </div>

            {/* Park title */}
            <div className="text-white max-w-3xl">

              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl sm:text-2xl">
                  {countryFlag}
                </span>

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.3em] text-white/65">
                  {location}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold italic leading-tight">
                {name}
              </h1>

              {tagline && (
                <p className="mt-3 text-brand-olive font-semibold text-sm sm:text-base md:text-lg">
                  {tagline}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MAIN CONTENT
      ========================================================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">

          {/* =====================================================
              LEFT / MAIN
          ===================================================== */}
          <div className="lg:col-span-2 space-y-10 min-w-0">

            {/* About */}
            <section>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold italic text-brand-dark mb-4">
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
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
              />
            </section>

            {/* Highlights */}
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold italic text-brand-dark mb-5">
                Park Highlights
              </h2>

              {highlights.length === 0 ? (
                <div className="bg-white border border-brand-green/10 rounded-2xl p-6">
                  <p className="text-sm text-stone-500">
                    Highlights for this park have not been added yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlights.map((highlight, index) => (
                    <div
                      key={`${highlight}-${index}`}
                      className="flex items-start gap-3 bg-white border border-brand-green/10 rounded-xl p-4 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />

                      <span className="text-sm text-stone-700 leading-relaxed">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ===================================================
                PHOTO GALLERY
            =================================================== */}
            {gallery.length > 0 && currentGalleryImage && (
              <section>
                <h2 className="font-serif text-xl sm:text-2xl font-bold italic text-brand-dark mb-5">
                  Photo Gallery
                </h2>

                {/* Main gallery */}
                <div
                  className="relative rounded-2xl overflow-hidden bg-stone-100 shadow-md cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                >
                  <img
                    src={currentGalleryImage.url}
                    alt={currentGalleryImage.caption || name}
                    className="w-full h-64 sm:h-80 md:h-[420px] object-cover transition-transform duration-500 hover:scale-[1.02]"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-5">
                    {currentGalleryImage.caption && (
                      <p className="text-white text-xs sm:text-sm font-medium">
                        {currentGalleryImage.caption}
                      </p>
                    )}
                  </div>

                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous image"
                        onClick={(event) => {
                          event.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/70 text-white rounded-full p-2.5 transition-all touch-manipulation"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>

                      <button
                        type="button"
                        aria-label="Next image"
                        onClick={(event) => {
                          event.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-black/45 hover:bg-black/70 text-white rounded-full p-2.5 transition-all touch-manipulation"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {gallery.length > 1 && (
                  <div className="flex gap-3 mt-3 overflow-x-auto pb-2">
                    {gallery.map((image, index) => (
                      <button
                        key={`${image.url}-${index}`}
                        type="button"
                        onClick={() => setGalleryIndex(index)}
                        className={`relative h-16 w-24 sm:h-20 sm:w-28 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                          galleryIndex === index
                            ? 'border-brand-green scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `${name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* No gallery */}
            {gallery.length === 0 && (
              <section>
                <h2 className="font-serif text-xl sm:text-2xl font-bold italic text-brand-dark mb-5">
                  Photo Gallery
                </h2>

                <div className="bg-white border border-brand-green/10 rounded-2xl p-8 text-center">
                  <p className="text-sm text-stone-500">
                    Photos for this park have not been added yet.
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* =====================================================
              SIDEBAR
          ===================================================== */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">

            {/* Best time */}
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-brand-green" />

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                  Best Time to Visit
                </span>
              </div>

              <p className="text-sm font-semibold text-brand-dark leading-relaxed">
                {bestTime}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-brand-green" />

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                  Location
                </span>
              </div>

              <p className="text-sm font-semibold text-brand-dark">
                {location}
              </p>
            </div>

            {/* Highlights count */}
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-brand-green" />

                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500">
                  Safari Experience
                </span>
              </div>

              <p className="text-sm font-semibold text-brand-dark">
                {highlights.length} highlights
              </p>
            </div>

            {/* Booking */}
            <div className="bg-brand-dark rounded-2xl p-6 text-white shadow-lg">
              <h3 className="font-serif font-bold italic text-xl mb-2">
                Plan Your Visit
              </h3>

              <p className="text-white/65 text-xs sm:text-sm leading-relaxed mb-5">
                Book a guided safari to {name} with our expert Warrior guides.
              </p>

              <button
                onClick={() => {
                  if (currentUser) {
                    onBook();
                  } else {
                    onOpenAuth('signup');
                  }
                }}
                className="w-full py-3.5 bg-brand-green hover:bg-brand-olive text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 touch-manipulation"
              >
                Book This Safari
              </button>

              {!currentUser && (
                <p className="text-center text-[11px] text-white/40 mt-3">
                  <button
                    onClick={() => onOpenAuth('signin')}
                    className="underline hover:text-white/70 transition-colors"
                  >
                    Sign in
                  </button>{' '}
                  to access booking
                </p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* =========================================================
          LIGHTBOX
      ========================================================= */}
      {lightboxOpen && currentGalleryImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            aria-label="Close gallery"
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                onClick={(event) => {
                  event.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                aria-label="Next image"
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={currentGalleryImage.url}
            alt={currentGalleryImage.caption || name}
            className="max-h-[82vh] max-w-full rounded-xl object-contain shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          />

          {currentGalleryImage.caption && (
            <div className="absolute bottom-5 left-0 right-0 text-center text-white/70 text-xs sm:text-sm px-6">
              {currentGalleryImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
