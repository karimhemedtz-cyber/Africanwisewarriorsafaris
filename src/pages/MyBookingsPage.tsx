import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft, CalendarDays, Users, RefreshCw,
  Clock3, CheckCircle2, XCircle, AlertCircle, ClipboardList
} from 'lucide-react';
import type { AppUser, Booking } from '../types';
import { fetchMyBookings } from '../supabase-db';

interface MyBookingsPageProps {
  currentUser: AppUser | null;
  onBack: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

const statusStyles: Record<Booking['status'], string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  rejected: 'bg-red-50 text-red-800 border-red-200',
  reviewed: 'bg-blue-50 text-blue-800 border-blue-200',
};

const statusLabels: Record<Booking['status'], string> = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Rejected',
  reviewed: 'Reviewed',
};

export default function MyBookingsPage({
  currentUser,
  onBack,
  onOpenAuth,
}: MyBookingsPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBookings = useCallback(async () => {
    if (!currentUser) {
      setBookings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await fetchMyBookings();
      setBookings(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not load your bookings. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? 'Date unavailable'
      : date.toLocaleString();
  };

  return (
    <section className="min-h-screen bg-[#FDFCF8] py-10 sm:py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <button
          onClick={onBack}
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-olive hover:text-brand-green"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-olive">
            Your safari account
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold italic text-brand-dark sm:text-4xl">
            My Bookings
          </h1>
          <p className="mt-3 break-words text-sm leading-6 text-stone-600">
            Track your safari requests and check their latest status.
          </p>
        </div>

        {!currentUser ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-7 text-center">
            <p className="text-stone-700">Sign in to view your bookings.</p>
            <button
              onClick={() => onOpenAuth('signin')}
              className="mt-5 rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white hover:bg-brand-olive"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-stone-600">
                {loading
                  ? 'Loading bookings…'
                  : `${bookings.length} booking${bookings.length === 1 ? '' : 's'}`}
              </p>
              <button
                onClick={() => void loadBookings()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-brand-green/20 bg-white px-4 py-2 text-sm font-semibold text-brand-green disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {error && (
              <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                <p>{error}</p>
                <button
                  onClick={() => void loadBookings()}
                  className="mt-2 font-bold underline"
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center">
                <RefreshCw className="mx-auto h-7 w-7 animate-spin text-brand-green" />
                <p className="mt-3 text-sm text-stone-500">Loading your bookings…</p>
              </div>
            ) : !error && bookings.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-stone-300" />
                <h2 className="mt-4 font-serif text-xl font-bold text-brand-dark">
                  No bookings yet
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Your safari requests will appear here after you submit a booking.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <article
                    key={booking.id}
                    className="min-w-0 rounded-2xl border border-brand-green/10 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Booking reference
                        </p>
                        <p className="mt-1 break-all text-sm font-semibold text-stone-700">
                          {booking.id}
                        </p>
                        <h2 className="mt-3 break-words font-serif text-xl font-bold text-brand-dark">
                          {booking.packageName || 'Safari package'}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusStyles[booking.status] || 'border-stone-200 bg-stone-50 text-stone-700'}`}
                      >
                        {booking.status === 'approved' ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : booking.status === 'rejected' ? (
                          <XCircle className="h-3.5 w-3.5" />
                        ) : booking.status === 'pending' ? (
                          <Clock3 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5" />
                        )}
                        {statusLabels[booking.status] || booking.status}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 border-t border-stone-100 pt-4 text-sm text-stone-600 sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-olive" />
                        <span>{booking.people} traveller{booking.people === 1 ? '' : 's'}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-olive" />
                        <span>{formatDate(booking.createdAt)}</span>
                      </div>
                    </div>

                    {booking.message?.trim() && (
                      <div className="mt-4 rounded-xl bg-stone-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          Your message
                        </p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-700">
                          {booking.message}
                        </p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
