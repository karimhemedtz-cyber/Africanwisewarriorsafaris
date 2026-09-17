/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowLeft, Calendar, ChevronRight, Bookmark } from 'lucide-react';
import { NewsItem } from '../types';

interface BlogPageProps {
  news: NewsItem[];
}

const FALLBACK_IMAGES = [
  '/images/package_serengeti_1779964123153.png',
  '/images/package_masaimara_1779964145785.png',
  '/images/package_ngorongoro_1779964167185.png',
];

export default function BlogPage({ news }: BlogPageProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  if (selectedArticle) {
    const displayImage =
      selectedArticle.imageUrl ||
      FALLBACK_IMAGES[news.findIndex((item) => item.id === selectedArticle.id) % FALLBACK_IMAGES.length];

    return (
      <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">
        <section className="relative h-[42vh] min-h-[320px] bg-brand-dark overflow-hidden">
          <img
            src={displayImage}
            alt={selectedArticle.title}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

          <button
            type="button"
            onClick={() => setSelectedArticle(null)}
            className="absolute top-6 left-4 sm:left-8 z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/45 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md hover:bg-black/65 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Safari Blog
          </button>
        </section>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <article className="bg-white rounded-3xl border border-brand-green/10 shadow-sm p-6 sm:p-8 md:p-10">
            <div className="flex items-center gap-2 text-[10px] text-brand-olive font-semibold uppercase tracking-widest mb-4">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(selectedArticle.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="font-serif italic font-bold text-3xl sm:text-4xl md:text-5xl text-brand-dark leading-tight">
              {selectedArticle.title}
            </h1>

            <div
              className="mt-8 prose prose-stone max-w-none
                prose-headings:font-serif
                prose-headings:italic
                prose-headings:text-brand-dark
                prose-p:text-stone-600
                prose-p:leading-relaxed
                prose-li:text-stone-600
                prose-strong:text-brand-dark
                [&_ul]:list-disc
                [&_ol]:list-decimal
                [&_p]:mb-5
                [&_ul]:mb-5
                [&_ol]:mb-5
                [&_li]:mb-1"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">
      <section className="py-16 sm:py-20 border-b border-brand-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-olive italic">
            Warrior travelogues & bulletins
          </span>

          <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-serif italic text-brand-green">
            Safari Blog
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-sm sm:text-base text-stone-600 leading-relaxed">
            Discover expedition stories, conservation updates, field reports and
            news from the heart of East Africa.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {news.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white rounded-3xl border border-brand-green/10 max-w-lg mx-auto">
            <Bookmark className="w-10 h-10 text-brand-green/40 mx-auto mb-4" />
            <span className="block font-semibold text-stone-800">
              No Articles Posted Yet
            </span>
            <span className="block text-sm text-brand-olive mt-2">
              Check back soon for safari bulletins and expedition news.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
            {news.map((item, idx) => {
              const displayImage =
                item.imageUrl || FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];

              return (
                <article
                  key={item.id}
                  className="bg-white border border-brand-green/10 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img
                      src={displayImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />

                    <div className="absolute top-4 left-4 bg-brand-green text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full">
                      Safari Bulletin
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-[10px] text-brand-olive font-semibold uppercase tracking-wider mb-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    <h2 className="font-serif italic text-xl font-bold text-brand-dark leading-tight">
                      {item.title}
                    </h2>

                    <div
                      className="mt-4 text-sm text-stone-600 leading-relaxed line-clamp-4 prose prose-stone prose-sm max-w-none
                        [&_ul]:list-disc
                        [&_ol]:list-decimal
                        [&_p]:mb-2"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />

                    <div className="mt-auto pt-6">
                      <button
                        type="button"
                        onClick={() => setSelectedArticle(item)}
                        className="inline-flex items-center gap-2 text-[10px] font-bold text-brand-green uppercase tracking-widest hover:text-brand-olive transition-colors"
                      >
                        Read Full Article
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
