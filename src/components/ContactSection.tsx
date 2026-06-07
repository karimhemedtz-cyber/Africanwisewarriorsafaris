/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail, Phone, MapPin, MessageCircle, Anchor, Compass, Pencil } from 'lucide-react';
import { SiteSettings } from '../types';

interface ContactSectionProps {
  settings: SiteSettings;
  isAdmin?: boolean;
  onEdit?: () => void;
}

export default function ContactSection({ settings, isAdmin, onEdit }: ContactSectionProps) {
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber}?text=Jambo!%20I%20am%20interested%20in%20booking%20a%20luxury%20safari%20with%20African%20Wase%20Warrior%20Safaris.`;

  return (
    <section id="contact" className="py-24 bg-[#FDFCF8]/60 border-b border-brand-green/10 relative">
      {isAdmin && onEdit && (
        <button
          onClick={onEdit}
          className="absolute top-6 right-6 flex items-center space-x-2 bg-white border border-brand-green/20 hover:bg-brand-green hover:text-white text-brand-green font-bold text-xs px-4 py-2 rounded-full shadow transition-all z-10"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Contact</span>
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-olive italic">
            Secure Consultation
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-serif italic text-brand-green">
            Plan Your Journey
          </h2>
          <div className="mt-4 max-w-xl mx-auto text-brand-olive text-xs font-serif italic">
            Reach out directly. Our safari consultants are available for WhatsApp guidance,
            phone inquiries, and custom package formulation around the clock.
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

          <div className="lg:col-span-12 xl:col-span-5 space-y-6 flex flex-col justify-between">
            <div className="space-y-6 text-left">

              <div className="flex items-start space-x-4 p-5 bg-white border border-brand-green/10 rounded-[24px]">
                <div className="flex items-center justify-center w-12 h-12 bg-brand-green/5 text-brand-green rounded-2xl shrink-0 shadow-xs">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-brand-olive text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Telephone Line</h4>
                  <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="block text-base font-bold text-brand-dark hover:text-brand-olive transition-colors">
                    {settings.phone}
                  </a>
                  <p className="text-xs text-brand-olive mt-1 leading-normal font-sans">Available 24/7 for emergency safari coordinates.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-5 bg-white border border-brand-green/10 rounded-[24px]">
                <div className="flex items-center justify-center w-12 h-12 bg-brand-green/5 text-brand-green rounded-2xl shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-brand-olive text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Email Dispatch</h4>
                  <a href={`mailto:${settings.email}`} className="block text-base font-bold text-brand-dark hover:text-brand-olive transition-colors">
                    {settings.email}
                  </a>
                  <p className="text-xs text-brand-olive mt-1 leading-normal font-sans">Written booking proposals reviewed within 4 hours.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-5 bg-white border border-brand-green/10 rounded-[24px]">
                <div className="flex items-center justify-center w-12 h-12 bg-brand-green/5 text-brand-green rounded-2xl shrink-0 shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-brand-olive text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Headquarters</h4>
                  <span className="block text-sm font-semibold text-brand-green font-serif italic leading-tight">
                    {settings.address}
                  </span>
                </div>
              </div>

            </div>

            <div className="p-6 bg-brand-green text-white rounded-[32px] border border-brand-green/15 shadow-lg text-left relative overflow-hidden">
              <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h5 className="font-serif italic text-lg font-bold mb-1 flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-brand-olive animate-pulse" />
                  <span>Instant WhatsApp Consultant</span>
                </h5>
                <p className="text-xs text-brand-cream/90 leading-relaxed mb-4 font-sans">
                  Chat directly with lead supervisor Karimu Hemedi — check live weather updates or wildebeest crossing progress.
                </p>
                <a
                  id="btn_whatsapp_redirect"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center space-x-2 w-full py-3 bg-[#FDFCF8] hover:bg-brand-cream text-brand-green font-bold text-xs uppercase tracking-widest rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-brand-green" />
                  <span>Begin Live WhatsApp Chat</span>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col">
            <div id="location_map_widget" className="relative flex-1 min-h-[400px] border border-brand-green/15 rounded-[32px] overflow-hidden bg-brand-dark flex flex-col justify-between p-8 text-left shadow-2xl">
              <div className="absolute inset-0 bg-radial-at-t from-black/20 to-brand-dark z-0 pointer-events-none" />
              <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#5a6a40 1px, transparent 1px), linear-gradient(90deg, #5a6a40 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 bg-brand-olive rounded-full" />
                  <span className="text-[10px] text-brand-olive font-mono tracking-widest uppercase font-bold">GPS Coordinates</span>
                </div>
                <Compass className="w-5 h-5 text-white/30" />
              </div>

              <div className="relative z-10 py-12 flex flex-col items-center justify-center text-center">
                <Anchor className="w-16 h-16 text-brand-olive mb-4 animate-bounce shrink-0" />
                <span className="block text-2xl font-serif italic text-brand-cream leading-none">AICC Area, Arusha</span>
                <span className="block text-xs text-brand-olive font-mono mt-1.5 leading-none">Lat: -3.3731° S, Lon: 36.6830° E</span>
                <p className="max-w-xs text-[11px] text-brand-cream/70 mt-3 leading-relaxed font-sans">
                  Headquarters positioned in the major gateway hub to Serengeti and Ngorongoro Crater expeditions.
                </p>
              </div>

              <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-brand-green/20 pt-4 text-xs text-brand-olive">
                <div>
                  <span className="block font-bold text-brand-cream text-[10px] uppercase tracking-wider font-serif italic">Gateway Terminal</span>
                  <p className="mt-1 text-[11px] font-sans">Kilimanjaro Int. Airport (JRO)</p>
                </div>
                <div>
                  <span className="block font-bold text-brand-cream text-[10px] uppercase tracking-wider font-serif italic">Lodging Base</span>
                  <p className="mt-1 text-[11px] font-sans">Arusha Serena Luxury Lodge</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
