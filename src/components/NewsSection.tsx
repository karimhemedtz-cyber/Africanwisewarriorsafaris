/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NewsItem } from '../types';
import { Calendar, Tag, ChevronRight, Bookmark } from 'lucide-react';

interface NewsSectionProps {
  news: NewsItem[];
}

const FALLBACK_IMAGES = [
  '/src/assets/images/package_serengeti_1779964123153.png',
  '/src/assets/images/package_masaimara_1779964145785.png',
  '/src/assets/images/package_ngorongoro_1779964167185.png',
];

export default function NewsSection({ news }: NewsSectionProps) {
  return (
    <section id="news" className="py-24 bg-[#FDFCF8]/60 border-b border-brand-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-olive italic">
            Warrior travelogues & bulletins
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-serif italic text-brand-green">
            Safari Blog & Bulletins
          </h2>
          <div className="mt-4 max-w-xl mx-auto text-brand-olive text-xs font-serif italic">
            Read our direct conservation bulletins, tracker field reports, and annual great crossing forecasts
            straight from the heart of the Tanzanian savannah.
          </div>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-12 p-12 bg-white rounded-[32px] border border-brand-green/10 max-w-md mx-auto">
            <Bookmark className="w-10 h-10 text-brand-green/40 mx-auto mb-3" />
            <span className="block font-semibold text-stone-800">No Articles Posted Yet</span>
            <span className="block text-xs text-brand-olive mt-1">Check back soon for safari bulletins and expedition news.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {news.map((item, idx) => {
              const displayImage = item.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
              return (
                <article
                  id={`news_article_${item.id}`}
                  key={item.id}
                  className="bg-white border border-brand-green/10 rounded-[32px] overflow-hidden shadow-xs hover:shadow-md hover:translate-y-[-2px] transition-all flex flex-col h-full text-left"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#FDFCF8]">
                    <img
                      src={displayImage}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-brand-green text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
                      Scout Bulletin
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-4 text-[10px] text-brand-olive font-semibold uppercase tracking-wider mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Wild Conservation</span>
                        </div>
                      </div>
                      <h3 className="font-serif italic text-lg font-bold text-brand-dark leading-tight mb-3">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-600 leading-relaxed mb-6 line-clamp-4">
                        {item.content}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-brand-green/10 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-brand-green uppercase tracking-widest inline-flex items-center space-x-1 hover:underline cursor-pointer">
                        <span>Read scouts notes</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
