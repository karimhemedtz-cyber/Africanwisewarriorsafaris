/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CommentItem, AppUser } from '../types';
import { submitComment, deleteComment } from '../supabase-db';
import { MessageSquare, Calendar, User, Trash2, ShieldAlert, Send, Stars, Lock, AlertCircle } from 'lucide-react';

interface FeedbackSectionProps {
  comments: CommentItem[];
  currentUser: AppUser | null;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
  onRefreshComments: () => Promise<void>;
}

export default function FeedbackSection({ 
  comments, 
  currentUser, 
  onOpenAuth, 
  onRefreshComments 
}: FeedbackSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) return;

    // Email verification is required in production.
    if (!currentUser.emailVerified) {
      setErrorMsg('Unauthorized creation: Your email has not been verified yet. Please check your inbox and click the verification link first.');
      return;
    }

    if (!commentText.trim()) {
      setErrorMsg('Comment message query cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitComment(commentText, currentUser);
      setCommentText('');
      await onRefreshComments();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error occurred while saving your feedback review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceDelete = async (id: string) => {
    if (!confirm('Mod-Control: Purge this user review from the public board?')) return;
    try {
      await deleteComment(id);
      await onRefreshComments();
    } catch (err) {
      console.error(err);
      alert('Failed to remove feedback comment from server.');
    }
  };

  return (
    <section id="feedback" className="py-24 bg-[#FDFCF8] border-b border-brand-green/10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-brand-olive italic">
            Patron reviews & feedback
          </span>
          <h2 className="mt-2 text-3xl sm:text-5xl font-serif italic text-brand-green">
            Wise Patrons Discussion
          </h2>
          <div className="mt-4 max-w-xl mx-auto text-brand-olive text-xs font-serif italic">
            Read testimonials from global adventurers who joined our expeditions, 
            or sign in to leave your custom rating.
          </div>
        </div>

        {/* FEEDBACK COMMENT WRITER FORM ZONE */}
        <div className="mb-12">
          {currentUser ? (
            <div className="p-6 md:p-8 bg-white border border-brand-green/10 rounded-[32px] text-left">
              <h3 className="text-sm font-bold text-brand-dark leading-none mb-2 flex items-center space-x-2">
                <Stars className="w-4 h-4 text-brand-green" />
                <span>Share Your Safari Experience</span>
              </h3>
              <p className="text-xs text-brand-olive mb-4">
                Posting public feedback review on-board as <strong className="text-brand-green font-serif italic">{currentUser.displayName}</strong>.
              </p>

              <form id="feedback_comment_form" onSubmit={handleCommentSubmit} className="space-y-4">
                
                {errorMsg && (
                  <div id="comment_error_alert" className="flex items-start p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs leading-relaxed">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Verification nudge if user registers but hasn't activated email yet */}
                {!currentUser.emailVerified && (
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl leading-relaxed flex items-start space-x-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                    <span>
                      <strong>Verification Required:</strong> You cannot leave comments until your account is fully verified. We dispatched a confirmation email to <code className="bg-white/60 px-1 rounded">{currentUser.email}</code>. Please confirm.
                    </span>
                  </div>
                )}

                <div>
                  <textarea
                    id="textarea_feedback_comment"
                    required
                    className="w-full text-sm px-4 py-3.5 bg-white border border-brand-green/15 rounded-2xl focus:outline-brand-green h-24 resize-none"
                    placeholder="We loved the Serengeti great river crossings, tracking the male lions kopje with guide Karimu, and our private luxury camp..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-brand-olive font-semibold uppercase tracking-wider">Please be respectful of fellow travelers.</span>
                  <button
                    id="btn_submit_comment"
                    type="submit"
                    disabled={isSubmitting || !currentUser.emailVerified}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-brand-green hover:bg-brand-olive text-white font-bold text-xs uppercase tracking-wider rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Posting...' : 'Post Testimonial'}</span>
                  </button>
                </div>

              </form>
            </div>
          ) : (
            <div id="feedback_lockout_block" className="p-8 bg-white border border-brand-green/10 rounded-[32px] text-center space-y-4 max-w-lg mx-auto">
              <Lock className="w-10 h-10 text-brand-olive mx-auto" />
              <div>
                <h3 className="font-serif italic font-bold text-brand-green text-base leading-none">Patron Sign In Required</h3>
                <p className="text-brand-olive text-xs mt-1.5 leading-relaxed">
                  Only registered and signed-in safari patrons are allowed to write testimonials or review ratings.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  id="btn_feedback_lockout_signin"
                  onClick={() => onOpenAuth('signin')}
                  className="px-5 py-2 bg-[#FDFCF8] border border-brand-green/15 hover:bg-brand-green/5 text-brand-olive text-xs font-bold rounded-full cursor-pointer transition-colors"
                >
                  Sign In
                </button>
                <button
                  id="btn_feedback_lockout_signup"
                  onClick={() => onOpenAuth('signup')}
                  className="px-5 py-2 bg-brand-green hover:bg-brand-olive text-white text-xs font-bold rounded-full cursor-pointer transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* FEEDBACK DISCUSSION FORUM TIMELINE */}
        <div id="comments_feed" className="space-y-6">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-brand-olive text-sm font-serif italic">
              Be the first to leave a feedback testimonial on African Wise Warrior Safaris!
            </div>
          ) : (
            comments.map(c => {
              const isAdmin = currentUser?.role === 'admin';
              return (
                <div 
                  id={`comment_tile_${c.id}`} 
                  key={c.id} 
                  className="p-5 border border-brand-green/10 bg-white rounded-[24px] flex items-start justify-between gap-4 text-left hover:border-brand-green/20 hover:shadow-xs transition-all shadow-xs"
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Circle Avatar Icon with initial letters */}
                    <div className="w-10 h-10 bg-brand-green/5 text-brand-green font-bold border border-brand-green/10 rounded-full flex items-center justify-center shrink-0">
                      {c.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-brand-dark text-sm">{c.username}</span>
                        {c.userId.startsWith('admin_') && (
                          <span className="text-[9px] font-extrabold text-brand-green bg-brand-green/5 border border-brand-green/10 px-1.5 py-0.5 rounded-full leading-none uppercase tracking-wide">
                            🛡️ Staff Guide
                          </span>
                        )}
                      </div>
                      
                      {/* Body statement */}
                      <p className="text-xs text-brand-dark font-serif leading-relaxed mt-1.5 max-w-xl italic">
                        "{c.comment}"
                      </p>

                      {/* Posted meta Date */}
                      <div className="flex items-center space-x-1 mt-2.5 text-[10px] text-brand-olive font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Immediate Admin Moderation Delete trigger */}
                  {isAdmin && (
                    <button
                      id={`btn_tile_purge_comment_${c.id}`}
                      onClick={() => handleForceDelete(c.id)}
                      className="p-2 text-stone-400 hover:text-red-700 bg-white border border-brand-green/10 hover:bg-red-50 rounded-full shrink-0 transition-colors cursor-pointer"
                      title="Admin Purge comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
