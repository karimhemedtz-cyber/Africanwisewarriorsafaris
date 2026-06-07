/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Package, Booking, AppUser } from '../types';
import { submitBooking } from '../supabase-db';
import { ChevronLeft, ChevronRight, Calendar, MapPin, DollarSign, Clock, Check, Send, AlertCircle } from 'lucide-react';

interface PackageFlowProps {
  packages: Package[];
  currentUser: AppUser | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onBookNow?: (packageId: string) => void;
}

export default function PackageFlow({ packages, currentUser, onOpenAuth, onBookNow }: PackageFlowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [bookingFormData, setBookingFormData] = useState({
    name: '',
    email: '',
    people: 2,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const autoPlayRef = useRef<(() => void) | null>(null);

  // Sync user details to form
  useEffect(() => {
    if (currentUser) {
      setBookingFormData(prev => ({
        ...prev,
        name: currentUser.displayName,
        email: currentUser.email
      }));
    }
  }, [currentUser]);

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

  const handleOpenDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setBookingSuccess(false);
    setFormError('');
    // Keep user's details filled in
    if (currentUser) {
      setBookingFormData({
        name: currentUser.displayName,
        email: currentUser.email,
        people: 2,
        message: ''
      });
    } else {
      setBookingFormData({
        name: '',
        email: '',
        people: 2,
        message: ''
      });
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!bookingFormData.name.trim() || !bookingFormData.email.trim()) {
        throw new Error('Please fill out your name and email address.');
      }
      if (bookingFormData.people <= 0) {
        throw new Error('Please enter a valid number of travelers.');
      }

      await submitBooking({
        name: bookingFormData.name,
        email: bookingFormData.email,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        people: bookingFormData.people,
        message: bookingFormData.message
      });

      setBookingSuccess(true);
      // Reset non-essential form fields
      setBookingFormData(prev => ({ ...prev, message: '', people: 2 }));
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while submitting your booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Click any postcard to review details, destinations, routes, and book instantly.
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
                  onClick={() => handleOpenDetails(pkg)}
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
                      <span>Review Details & Book</span>
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

        {/* PACKAGE DETAILS / BOOKING POPUP MODAL */}
        {selectedPackage && (
          <div id="package_detail_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/75 backdrop-blur-sm overflow-y-auto">
            <div 
              id="package_detail_card" 
              className="bg-[#FDFCF8] rounded-[32px] overflow-hidden shadow-2xl w-full max-w-4xl relative border border-brand-green/15 animate-fade-in my-8"
            >
              
              {/* Dismiss detail modal button */}
              <button
                id="btn_dismiss_package_detail"
                onClick={() => setSelectedPackage(null)}
                className="absolute z-10 p-2 text-white bg-black/40 hover:bg-black/60 rounded-full top-4 right-4 transition-colors"
                aria-label="Close package details"
              >
                <XIcon className="w-6 h-6" />
               </button>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-12">
                
                {/* Left side: Package Postcard Info and Image */}
                <div className="md:col-span-12 lg:col-span-5 relative bg-brand-green aspect-[4/5] md:aspect-auto md:min-h-[550px]">
                  <img
                    src={selectedPackage.imageUrl}
                    alt={selectedPackage.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white text-left">
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-brand-green px-2.5 py-1 rounded-full text-white inline-block mb-3">
                      Exclusive Safari Code: {selectedPackage.id.replace(/_/g, '-').toUpperCase()}
                    </span>
                    <h3 className="font-serif italic text-2xl font-bold leading-tight mb-2">
                      {selectedPackage.name}
                    </h3>
                    <div className="flex items-center space-x-1.5 text-brand-olive font-semibold text-xs uppercase tracking-wider">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{selectedPackage.days} Days Itinerary</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Detailed descriptions and Booking request form */}
                <div className="md:col-span-12 lg:col-span-7 p-6 sm:p-8 text-left max-h-[85vh] overflow-y-auto">
                  
                  <span className="text-xs font-bold text-brand-olive tracking-widest uppercase">
                    Detailed Itinerary Specifications
                  </span>
                  
                  <h4 className="font-serif italic text-2xl font-bold text-brand-green mt-1 mb-4">
                    {selectedPackage.name}
                  </h4>

                  {/* Features quick details panel */}
                  <div className="grid grid-cols-2 gap-4 bg-white border border-brand-green/10 p-4 rounded-2xl mb-6">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-brand-green shrink-0" />
                      <div>
                        <span className="block text-[10px] text-brand-olive font-bold uppercase tracking-wider leading-none">Starting price</span>
                        <span className="text-sm font-bold text-brand-dark">${selectedPackage.price} / person</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-brand-green shrink-0" />
                      <div>
                        <span className="block text-[10px] text-brand-olive font-bold uppercase tracking-wider leading-none">Tour Duration</span>
                        <span className="text-sm font-bold text-brand-dark">{selectedPackage.days} Days & 4 Nights</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center space-x-2 pt-2 border-t border-brand-green/10">
                      <MapPin className="w-5 h-5 text-brand-green shrink-0" />
                      <div>
                        <span className="block text-[10px] text-brand-olive font-bold uppercase tracking-wider leading-none">Route destination path</span>
                        <span className="text-sm font-semibold text-brand-green leading-tight">{selectedPackage.route}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description text */}
                  <p className="text-sm text-stone-605 leading-relaxed mb-8 font-sans">
                    {selectedPackage.description}
                  </p>

                  <hr className="border-brand-green/10 my-6" />

                  {/* INTERACTIVE BOOKING REQUEST ZONE */}
                  <div className="text-left bg-brand-green/[0.04] border border-brand-green/[0.08] p-6 rounded-2xl">
                    <h5 className="font-serif text-lg font-bold text-brand-green mb-1">
                      Request a Booking Proposal
                    </h5>
                    <p className="text-brand-olive text-xs mb-4">
                      Submit a provisional booking request. Our warrior scouts will review and reply within 4 hours.
                    </p>

                    {bookingSuccess ? (
                      <div id="booking_success_alert" className="flex flex-col items-center py-4 text-center bg-white border border-brand-green/20 rounded-2xl p-4">
                        <div className="w-10 h-10 bg-brand-green/10 text-brand-green rounded-full flex items-center justify-center mb-2">
                          <Check className="w-5 h-5" />
                        </div>
                        <h6 className="text-sm font-bold text-brand-green">Request Dispatched!</h6>
                        <p className="text-xs text-brand-olive mt-1">
                          Thank you {bookingFormData.name}! Your request has been logged. Admin is assembling proposal highlights.
                        </p>
                      </div>
                    ) : (
                      <form id="booking_submission_form" onSubmit={handleBookingSubmit} className="space-y-3.5">
                        
                        {formError && (
                          <div id="booking_error_alert" className="flex items-start p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-800 text-[11px]">
                            <AlertCircle className="w-4 h-4 mr-1.5 shrink-0 mt-0.5" />
                            <span>{formError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-brand-olive uppercase tracking-wider mb-1">Your Full Name</label>
                            <input
                              id="input_booking_name"
                              type="text"
                              required
                              className="w-full text-xs px-4 py-2 bg-white border border-brand-green/15 rounded-full focus:outline-brand-green focus:ring-1 focus:ring-brand-green focus:border-brand-green"
                              placeholder="Marcus Thorne"
                              value={bookingFormData.name}
                              onChange={(e) => setBookingFormData({...bookingFormData, name: e.target.value})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-brand-olive uppercase tracking-wider mb-1">Email Address</label>
                            <input
                              id="input_booking_email"
                              type="email"
                              required
                              className="w-full text-xs px-4 py-2 bg-white border border-brand-green/15 rounded-full focus:outline-brand-green focus:ring-1 focus:ring-brand-green"
                              placeholder="marcus@example.com"
                              value={bookingFormData.email}
                              onChange={(e) => setBookingFormData({...bookingFormData, email: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-brand-olive uppercase tracking-wider mb-1">Number of Travellers</label>
                            <input
                              id="input_booking_people"
                              type="number"
                              min={1}
                              max={100}
                              required
                              className="w-full text-xs px-4 py-2 bg-white border border-brand-green/15 rounded-full focus:outline-brand-green focus:ring-1 focus:ring-brand-green font-semibold"
                              value={bookingFormData.people}
                              onChange={(e) => setBookingFormData({...bookingFormData, people: parseInt(e.target.value) || 1})}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-brand-olive uppercase tracking-wider mb-1">Preferred Time of Year</label>
                            <span className="block text-[10px] text-brand-olive mt-1.5 font-semibold">Dry Season (June-October) / Autumn</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-brand-olive uppercase tracking-wider mb-1">Additional Notes / Custom Message</label>
                          <textarea
                            id="textarea_booking_message"
                            className="w-full text-xs px-4 py-2 bg-white border border-brand-green/15 rounded-2xl focus:outline-brand-green h-16 resize-none"
                            placeholder="Specify custom desires (e.g. vegetarian dining, luxury balloon takeoff, flight pick-up details)..."
                            value={bookingFormData.message}
                            onChange={(e) => setBookingFormData({...bookingFormData, message: e.target.value})}
                          />
                        </div>

                        <button
                          id="btn_submit_booking"
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-2.5 bg-brand-green hover:bg-brand-olive text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Transmitting Request...' : 'Submit Proposal Request'}</span>
                        </button>

                        {onBookNow && selectedPackage && (
                          <button
                            type="button"
                            onClick={() => { onBookNow(selectedPackage.id); }}
                            className="w-full py-2.5 border border-brand-green/30 text-brand-green hover:bg-brand-green/5 font-bold text-xs uppercase tracking-wider rounded-full transition-all flex items-center justify-center space-x-2"
                          >
                            <span>Open Full Booking Page →</span>
                          </button>
                        )}

                      </form>
                    )}

                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}

// Inline localized replacement for generic CloseIcon to avoid import issue
function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
