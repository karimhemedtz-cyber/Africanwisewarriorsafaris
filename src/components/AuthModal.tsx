/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { signUp, signIn } from '../supabase-db';
import { X, Mail, Lock, User, CheckCircle, ShieldAlert } from 'lucide-react';
import { AppUser } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AppUser) => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Re-sync to whichever mode (Sign In / Sign Up) triggered this open,
  // and clear any leftover error/state from the previous time it was opened.
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setVerificationSent(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
          throw new Error('All fields are required.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        
        const registered = await signUp(fullName, email, password);
        setVerificationSent(true);
        setLoading(false);
        if (registered.emailVerified) {
          onSuccess(registered);
          onClose();
        }
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Email and password are required.');
        }
        const loggedIn = await signIn(email, password);
        onSuccess(loggedIn);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth_overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        id="auth_modal_content" 
        className="relative w-full max-w-md overflow-hidden bg-white border border-stone-200 rounded-2xl shadow-2xl animate-fade-in"
      >
        {/* Upper Accent Border */}
        <div className="h-2 bg-emerald-800" />

        {/* Close Button */}
        <button 
          id="btn_close_auth"
          onClick={onClose}
          className="absolute p-2 text-stone-400 transition-colors hover:text-stone-700 top-4 right-4"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-serif font-semibold tracking-tight text-emerald-950">
              {mode === 'signup' ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              {mode === 'signup' 
                ? 'Register to leave feedback and track safari bookings' 
                : 'Sign in to access premium safari services'}
            </p>
          </div>

          {verificationSent ? (
            <div id="verification_state" className="flex flex-col items-center py-6 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-600 mb-4 animate-bounce" />
              <h3 className="text-lg font-medium text-stone-900 mb-2">Verification Email Dispatched!</h3>
              <p className="text-sm text-stone-600 max-w-xs">
                We sent a secure validation link to <strong className="text-emerald-900">{email}</strong>. Please check your inbox and verify your email to log in and comment.
              </p>
              <button
                id="btn_verify_ack"
                onClick={() => {
                  setVerificationSent(false);
                  setMode('signin');
                }}
                className="mt-6 px-6 py-2.5 bg-emerald-800 text-white font-medium rounded-xl hover:bg-emerald-900 transition-colors w-full"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form id="auth_form" onSubmit={handleSubmit} className="space-y-4">
              
              {/* Alert Message */}
              {error && (
                <div id="auth_error_alert" className="flex items-start p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs">
                  <ShieldAlert className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name field (Only during Sign Up) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      id="input_auth_fullname"
                      type="text"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-colors"
                      placeholder="e.g. Karimu Hemedi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="input_auth_email"
                    type="email"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-colors"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    id="input_auth_password"
                    type="password"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-emerald-600 focus:bg-white focus:outline-none transition-colors"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {mode === 'signin' && (
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-500">
                  <span className="font-semibold text-emerald-800">Admin access:</span> Use your administrator credentials to unlock the dashboard control panel.
                </div>
              )}

              {/* Submit Button */}
              <button
                id="btn_auth_submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Processing...' : mode === 'signup' ? 'Sign Up & Verify' : 'Sign In'}
              </button>

              {/* Switch Modes */}
              <div className="text-center pt-2 text-xs text-stone-500">
                {mode === 'signin' ? (
                  <>
                    Don't have an account?{' '}
                    <button
                      id="btn_toggle_signup"
                      type="button"
                      onClick={() => setMode('signup')}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already registered?{' '}
                    <button
                      id="btn_toggle_signin"
                      type="button"
                      onClick={() => setMode('signin')}
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
