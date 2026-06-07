/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Park, Country } from '../eastAfricaData';
import { ArrowLeft, Calendar, CheckCircle, ChevronLeft, ChevronRight, MapPin, X, Pencil } from 'lucide-react';
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

export default function ParkPage({ park, country, onBack, onBackToCountry, onBook, currentUser, onOpenAuth, settings, isAdmin, onEditPark }: ParkPageProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const overrides = settings.parkOverrides[park.id] || {};
  const tagline = overrides.tagline ?? park.tagline;
  const description = overrides.description ?? park.description;
  const coverImage = overrides.coverImage ?? park.coverImage;
  const gallery = overrides.gallery ?? park.gallery;

  const prevImage = () => setGalleryIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const nextImage = () => setGalleryIndex((i) => (i + 1) % gallery.length);

  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">
      <div className="relative h-72 md:h-[480px] overflow-hidden">
        <img src={coverImage} alt={park.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/75" />

        {/* Breadcrumb */}
        <div className="absolute top-5 left-5 md:top-8 md:left-10 flex items-center space-x-2 text-sm">
          <button onClick={onBack} className="text-white/70 hover:text-white font-semibold transition-colors">Destinations</button>
          <span className="text-white/40">/</span>
          <button onClick={onBackToCountry} className="text-white/70 hover:text-white font-semibold transition-colors">{country.name}</button>
          <span className="text-white/40">/</span>
          <span className="text-white font-semibold">{park.name}</span>
        </div>

        {/* Admin Edit */}
        {isAdmin && onEditPark && (
          <button
            onClick={onEditPark}
            className="absolute top-5 right-5 md:top-8 md:right-10 flex items-center space-x-2 bg-white/90 hover:bg-white text-brand-green font-bold text-xs px-4 py-2 rounded-full shadow-lg transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Park</span>
          </button>
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 max-w-5xl mx-auto">
          <div className="text-white">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{country.flag}</span>
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/60">{park.country}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-bold italic">{park.name}</h1>
            <p className="mt-2 text-brand-olive font-semibold">{tagline}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-10">

            <div>
              <h2 className="font-serif text-2xl font-bold italic text-brand-dark mb-4">About {park.name}</h2>
              <p className="text-stone-600 leading-relaxed">{description}</p>
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold italic text-brand-dark mb-4">Park Highlights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {park.highlights.map((h, i) => (
                  <div key={i} className="flex items-start space-x-3 bg-white border border-brand-green/10 rounded-xl p-3 shadow-xs">
                    <CheckCircle className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <span className="text-sm text-stone-700">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Photo Gallery */}
            {gallery.length > 0 && (
              <div>
                <h3 className="font-serif text-lg font-bold italic text-brand-dark mb-4">Photo Gallery</h3>
                <div className="relative rounded-2xl overflow-hidden cursor-pointer shadow-md" onClick={() => setLightboxOpen(true)}>
                  <img
                    src={gallery[galleryIndex].url}
                    alt={gallery[galleryIndex].caption}
                    className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                    <p className="text-white text-sm font-medium">{gallery[galleryIndex].caption}</p>
                  </div>
                  {gallery.length > 1 && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
                {gallery.length > 1 && (
                  <div className="flex space-x-3 mt-3">
                    {gallery.map((img, i) => (
                      <button key={i} onClick={() => setGalleryIndex(i)}
                        className={`relative h-16 w-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${galleryIndex === i ? 'border-brand-green scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                        <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Best Time to Visit</span>
              </div>
              <p className="text-sm font-semibold text-brand-dark">{park.bestTime}</p>
            </div>
            <div className="bg-white border border-brand-green/10 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-brand-green" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Location</span>
              </div>
              <p className="text-sm font-semibold text-brand-dark">{park.country}</p>
            </div>
            <div className="bg-brand-dark rounded-2xl p-6 text-white">
              <h4 className="font-serif font-bold italic text-lg mb-2">Plan Your Visit</h4>
              <p className="text-white/60 text-xs mb-4">Book a guided safari to {park.name} with our expert Warrior guides.</p>
              <button
                onClick={() => { if (currentUser) { onBook(); } else { onOpenAuth('signup'); } }}
                className="w-full py-3 bg-brand-green hover:bg-brand-olive text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95"
              >
                Book This Safari
              </button>
              {!currentUser && (
                <p className="text-center text-[11px] text-white/40 mt-3">
                  <button onClick={() => onOpenAuth('signin')} className="underline hover:text-white/70 transition-colors">Sign in</button> to access booking
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2" onClick={() => setLightboxOpen(false)}>
            <X className="w-6 h-6" />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-3" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <img src={gallery[galleryIndex].url} alt={gallery[galleryIndex].caption} className="max-h-[85vh] max-w-full rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 rounded-full p-3" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/60 text-sm px-4">{gallery[galleryIndex].caption}</div>
        </div>
      )}
    </div>
  );
}
