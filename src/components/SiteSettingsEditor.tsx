/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { X, Save, Image, Globe, Phone, MapPin, Upload, Loader2 } from 'lucide-react';
import { uploadSiteImage } from '../supabase-media';

const IMAGE_PRESETS = [
  { name: 'Serengeti Migration', url: '/images/package_serengeti_1779964123153.png' },
  { name: 'Maasai Mara', url: '/images/package_masaimara_1779964145785.png' },
  { name: 'Ngorongoro Crater', url: '/images/package_ngorongoro_1779964167185.png' },
];

type EditMode = 'hero' | 'contact' | null;

interface SiteSettingsEditorProps {
  mode: EditMode;
  settings: SiteSettings;
  onSave: (updated: SiteSettings) => Promise<void>;
  onClose: () => void;
}

export default function SiteSettingsEditor({ mode, settings, onSave, onClose }: SiteSettingsEditorProps) {
  const [form, setForm] = useState<SiteSettings>({ ...settings });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');

  if (!mode) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 1200);
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof SiteSettings, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleHeroImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageUploadError('');
    setUploadingImage(true);

    try {
      const publicUrl = await uploadSiteImage(file, 'hero');
      set('heroImage', publicUrl);
    } catch (err) {
      console.error('Hero image upload failed:', err);

      setImageUploadError(
        err instanceof Error
          ? err.message
          : 'Could not upload hero image.'
      );
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-stone-200">
        <div className="h-1.5 bg-brand-green rounded-t-2xl" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-serif font-bold italic text-brand-dark">
                {mode === 'hero' ? 'Edit Hero Section' : 'Edit Contact Details'}
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">Changes apply immediately when saved.</p>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {mode === 'hero' && (
            <div className="space-y-4">
              {/* Badge */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Badge Text</label>
                <input
                  type="text"
                  value={form.heroBadgeText}
                  onChange={e => set('heroBadgeText', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none"
                />
              </div>
              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Subtitle (italic line)</label>
                <input
                  type="text"
                  value={form.heroSubtitle}
                  onChange={e => set('heroSubtitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none"
                />
              </div>
              {/* Main Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Main Heading</label>
                <input
                  type="text"
                  value={form.heroTitle}
                  onChange={e => set('heroTitle', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Description Paragraph</label>
                <textarea
                  value={form.heroDescription}
                  onChange={e => set('heroDescription', e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none resize-none"
                />
              </div>
              {/* Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                  Background Image
                </label>

                {/* Current preview */}
                <div className="mb-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
                  {form.heroImage ? (
                    <img
                      src={form.heroImage}
                      alt="Hero preview"
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="h-40 flex items-center justify-center text-stone-400 text-xs">
                      No hero image selected
                    </div>
                  )}
                </div>

                {/* Upload */}
                <label
                  htmlFor="hero-image-upload"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed transition-colors ${
                    uploadingImage
                      ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed'
                      : 'border-brand-green/40 bg-brand-green/5 text-brand-green hover:bg-brand-green/10 cursor-pointer'
                  }`}
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm font-semibold">
                        Uploading image…
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Upload New Hero Image
                      </span>
                    </>
                  )}

                  <input
                    id="hero-image-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={uploadingImage}
                    onChange={handleHeroImageUpload}
                    className="hidden"
                  />
                </label>

                {imageUploadError && (
                  <p className="mt-2 text-xs font-medium text-red-600">
                    {imageUploadError}
                  </p>
                )}

                {/* Presets */}
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Or choose a preset
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {IMAGE_PRESETS.map(p => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => set('heroImage', p.url)}
                        className={`rounded-lg overflow-hidden border-2 transition-all ${
                          form.heroImage === p.url
                            ? 'border-brand-green'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="w-full h-14 object-cover"
                        />
                        <span className="block text-[9px] text-center text-stone-500 py-0.5 truncate px-1">
                          {p.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom URL */}
                <div className="mt-3">
                  <input
                    type="text"
                    placeholder="Or paste a custom image URL…"
                    value={form.heroImage}
                    onChange={e => set('heroImage', e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {mode === 'contact' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center space-x-1"><Phone className="w-3 h-3" /><span>Phone Number</span></label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Email Address</label>
                <input
                  type="text"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">WhatsApp Number (digits only)</label>
                <input
                  type="text"
                  value={form.whatsappNumber}
                  onChange={e => set('whatsappNumber', e.target.value)}
                  placeholder="255750916698"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5 flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>Address</span></label>
                <textarea
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none resize-none"
                />
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-end space-x-3">
            <button onClick={onClose} className="px-5 py-2.5 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm font-semibold transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-brand-green hover:bg-brand-olive text-white font-bold text-sm rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              <span>{saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
