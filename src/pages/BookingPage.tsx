/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Package, AppUser } from '../types';
import { submitBooking } from '../supabase-db';
import { ArrowLeft, Calendar, DollarSign, Clock, Users, Send, CheckCircle, AlertCircle, MapPin } from 'lucide-react';

interface BookingPageProps {
  packages: Package[];
  currentUser: AppUser | null;
  onBack: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  preselectedPackageId?: string | null;
}

export default function BookingPage({ packages, currentUser, onBack, onOpenAuth, preselectedPackageId }: BookingPageProps) {
  const [selectedPackageId, setSelectedPackageId] = useState(preselectedPackageId || '');
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    people: 2,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName,
        email: currentUser.email
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (preselectedPackageId) setSelectedPackageId(preselectedPackageId);
  }, [preselectedPackageId]);

  const selectedPackage = packages.find(p => p.id === selectedPackageId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('signin');
      return;
    }
    if (!selectedPackageId) {
      setFormError('Please select a safari package.');
      return;
    }
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Name and email are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      await submitBooking({
        name: formData.name,
        email: formData.email,
        packageId: selectedPackageId,
        packageName: selectedPackage?.name || '',
        people: formData.people,
        message: formData.message
      });
      setBookingSuccess(true);
    } catch (err: any) {
      setFormError(err.message || 'Booking submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center p-4 animate-fade-in">
        <div className="max-w-md w-full bg-white rounded-3xl border border-brand-green/10 shadow-xl p-10 text-center">
          <CheckCircle className="w-16 h-16 text-brand-green mx-auto mb-4 animate-bounce" />
          <h2 className="font-serif text-2xl font-bold italic text-brand-dark mb-2">Booking Submitted!</h2>
          <p className="text-stone-500 text-sm mb-2">
            Your safari request for <strong className="text-brand-dark">{selectedPackage?.name}</strong> has been received.
          </p>
          <p className="text-stone-400 text-xs mb-8">Our team will reach out to <strong>{formData.email}</strong> within 24 hours to confirm your adventure.</p>
          <button
            onClick={onBack}
            className="w-full py-3 bg-brand-green hover:bg-brand-olive text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCF8] animate-fade-in">
      {/* Header */}
      <div className="bg-brand-dark text-white py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/images/safari_hero_1779964102826.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-white/60 hover:text-white text-sm font-semibold mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-serif font-bold italic text-white mb-2">Book Your Safari</h1>
          <p className="text-white/50 text-sm">Fill in the form below and our team will confirm your adventure within 24 hours.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Form */}
          <div className="md:col-span-3">
            {!currentUser && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Sign in to complete booking</p>
                  <p className="text-xs text-amber-600 mt-1">
                    <button onClick={() => onOpenAuth('signin')} className="underline font-bold">Sign in</button> or{' '}
                    <button onClick={() => onOpenAuth('signup')} className="underline font-bold">create an account</button> to submit your booking request.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Package Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Select Safari Package *</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors"
                  required
                >
                  <option value="">Choose a package…</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — ${pkg.price.toLocaleString()} / person ({pkg.days} days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* People */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Number of Travellers</label>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, people: Math.max(1, prev.people - 1) }))}
                    className="w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-brand-dark font-bold hover:border-brand-green transition-colors"
                  >−</button>
                  <span className="text-lg font-bold text-brand-dark w-8 text-center">{formData.people}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, people: Math.min(20, prev.people + 1) }))}
                    className="w-10 h-10 bg-white border border-stone-200 rounded-xl flex items-center justify-center text-brand-dark font-bold hover:border-brand-green transition-colors"
                  >+</button>
                  <span className="text-xs text-stone-400 ml-2">traveller{formData.people !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Special Requests or Notes</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Any dietary requirements, accessibility needs, or special occasions…"
                  rows={4}
                  className="w-full px-4 py-3 text-sm bg-white border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none transition-colors resize-none"
                />
              </div>

              {formError && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-green hover:bg-brand-olive text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting…' : 'Submit Booking Request'}</span>
              </button>
            </form>
          </div>

          {/* Package Summary Sidebar */}
          <div className="md:col-span-2">
            {selectedPackage ? (
              <div className="bg-white border border-brand-green/10 rounded-2xl overflow-hidden shadow-sm sticky top-24">
                <img src={selectedPackage.imageUrl} alt={selectedPackage.name} className="w-full h-36 object-cover" />
                <div className="p-5 space-y-4">
                  <h3 className="font-serif font-bold italic text-brand-dark text-base">{selectedPackage.name}</h3>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">{selectedPackage.description}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-stone-600">
                      <Clock className="w-3.5 h-3.5 text-brand-green" />
                      <span>{selectedPackage.days} days</span>
                    </div>
                    <div className="flex items-center space-x-2 text-stone-600">
                      <MapPin className="w-3.5 h-3.5 text-brand-green" />
                      <span className="line-clamp-1">{selectedPackage.route}</span>
                    </div>
                    <div className="flex items-center space-x-2 font-bold text-brand-dark">
                      <DollarSign className="w-3.5 h-3.5 text-brand-green" />
                      <span>${selectedPackage.price.toLocaleString()} per person</span>
                    </div>
                  </div>
                  <div className="border-t border-stone-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">Estimated total ({formData.people} pax)</span>
                      <span className="font-bold text-brand-dark text-sm">
                        ${(selectedPackage.price * formData.people).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-brand-green/10 rounded-2xl p-8 text-center text-stone-400 shadow-sm">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-xs">Select a package to see summary</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
