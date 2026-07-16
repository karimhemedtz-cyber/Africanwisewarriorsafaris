/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Package, AppUser } from '../types';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface PackageFlowProps {
  packages: Package[];
  currentUser: AppUser | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onBookNow?: (packageId: string) => void;
}

export default function PackageFlow({ packages, onBookNow }: PackageFlowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef<(() => void) | null>(null);

  const slideNext = () => {
    if (packages.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % packages.length);
  };

  const slidePrev = () => {
    if (packages.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + packages.length) % packages.length);
  };

  // Define callback for autoplay
  useEffect(() => {
    autoPlayRef.current = slideNext;
  });

  // Automatically slide every 5 seconds
  useEffect(() => {
    const play = () => {
      if (autoPlayRef.current) autoPlayRef.current();
    };
    const interval = setInterval(play, 5000);
    return () => clearInterval(interval);
  }, []);

  if (packages.length === 0) {
    return (
      <section id="packages" className="py-24 bg-stone-50 text-center">
        <p className="text-stone-500">Retrieving exclusive packages from database...</p>
      </section>
    );
  }

  return (
    <section id="packages" className="py-24 bg-[#FDFCF8] border-b border-brand-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-olive italic">
            Exclusive Journeys
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-serif italic text-brand-green">
            Select Your Safari Venture
          </h2>
          <div className="mt-4 max-w-xl mx-auto text-brand-olive text-sm font-serif italic">
            Behold East Africa’s signature sights through custom private packages.
            Click any postcard to open its dedicated booking page.
          </div>
        </div>

        {/* Dynamic Carousel / Gallery Flow */}
        <div id="carousel_stage" className="relative flex flex-col items-center">

          {/* Main Package Carousel Container */}
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[40px] shadow-xl border border-brand-green/10 aspect-[9/16] bg-brand-dark">

            {packages.map((pkg, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  id={`carousel_item_${pkg.id}`}
                  key={pkg.id}
                  onClick={() => onBookNow?.(pkg.id)}
                  className={`absolute inset-0 w-full h-full cursor-pointer transition-all duration-1000 transform scale-100 ${
                    isActive
                      ? 'opacity-100 translate-x-0 z-10'
                      : 'opacity-0 translate-x-full z-0 pointer-events-none'
                  }`}
                >
                  {/* Package Portrait Image (1080x1920 / 9:16) */}
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-[12s] scale-100 hover:scale-110"
                    referrerPolicy="no-referrer"
                  />

                  {/* Subtle Top Gradient for text contrast */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/60 to-transparent" />

                  {/* Absolute positioning of package labels */}
                  <div className="absolute top-6 left-6 text-white uppercase tracking-widest font-bold text-[10px] bg-brand-green/90 backdrop-blur-md px-3 py-1.5 rounded-full">
                    {pkg.days} Days Expedition
                  </div>

                  {/* Absolute Price sticker */}
                  <div className="absolute top-6 right-6 text-white tracking-wider font-bold text-sm bg-brand-dark/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                    From ${pkg.price}
                  </div>

                  {/* Dark Base Vignette Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  {/* Overlay content coordinates */}
                  <div className="absolute bottom-10 inset-x-0 px-8 text-white">
                    <div className="flex items-center space-x-1 text-brand-olive font-semibold text-xs uppercase tracking-widest mb-2">
                       <MapPin className="w-3.5 h-3.5" />
                      <span>{pkg.route.split(' - ')[1]}</span>
                    </div>

                    <h3 className="font-serif italic text-2xl sm:text-3xl font-bold tracking-tight mb-2 leading-tight">
                      {pkg.name}
                    </h3>

                    <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-xl line-clamp-2 mb-4">
                      {pkg.description}
                    </p>

                    <span className="inline-flex items-center space-x-2 text-[11px] font-bold text-brand-olive tracking-widest uppercase hover:underline">
                      <span>Book This Safari</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                </div>
              );
            })}

          </div>

          {/* Carousel Navigation Controllers */}
          <div className="flex items-center space-x-6 mt-8">
            <button
              id="btn_carousel_prev"
              onClick={slidePrev}
              className="p-3 bg-[#FDFCF8] text-brand-dark hover:text-brand-green border border-brand-green/10 rounded-full shadow-md hover:shadow-lg transition-all focus:outline-none"
              aria-label="Previous package"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination Indicators */}
            <div className="flex items-center space-x-2.5">
              {packages.map((_, idx) => (
                <button
                  id={`btn_carousel_dot_${idx}`}
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'w-8 bg-brand-green' : 'w-2.5 bg-brand-green/20 hover:bg-brand-green/40'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              id="btn_carousel_next"
              onClick={slideNext}
              className="p-3 bg-[#FDFCF8] text-brand-dark hover:text-brand-green border border-brand-green/10 rounded-full shadow-md hover:shadow-lg transition-all focus:outline-none"
              aria-label="Next package"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
