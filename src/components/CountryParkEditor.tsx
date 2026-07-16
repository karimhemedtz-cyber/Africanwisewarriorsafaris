/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { Country, Park } from '../eastAfricaData';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const IMAGE_PRESETS = [
  { name: 'Serengeti', url: '/images/package_serengeti_1779964123153.png' },
  { name: 'Maasai Mara', url: '/images/package_masaimara_1779964145785.png' },
  { name: 'Ngorongoro', url: '/images/package_ngorongoro_1779964167185.png' },
];

interface CountryEditorProps {
  country: Country;
  settings: SiteSettings;
  onSave: (updated: SiteSettings) => Promise<void>;
  onClose: () => void;
}

export function CountryEditor({ country, settings, onSave, onClose }: CountryEditorProps) {
  const existing = settings.countryOverrides[country.id] || {};
  const [tagline, setTagline] = useState(existing.tagline ?? country.tagline);
  const [description, setDescription] = useState(existing.description ?? country.description);
  const [heroImage, setHeroImage] = useState(existing.heroImage ?? country.heroImage);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updated: SiteSettings = {
      ...settings,
      countryOverrides: {
        ...settings.countryOverrides,
        [country.id]: { tagline, description, heroImage }
      }
    };
    await onSave(updated);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="h-1.5 bg-brand-green rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif font-bold italic text-brand-dark text-lg">Edit {country.name} Page</h2>
              <p className="text-xs text-stone-400 mt-0.5">Overrides the default country content.</p>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Tagline</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Hero Image</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {IMAGE_PRESETS.map(p => (
                  <button key={p.url} type="button" onClick={() => setHeroImage(p.url)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${heroImage === p.url ? 'border-brand-green' : 'border-transparent'}`}>
                    <img src={p.url} alt={p.name} className="w-full h-12 object-cover" />
                    <span className="block text-[9px] text-center py-0.5 truncate px-1 text-stone-500">{p.name}</span>
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Or custom URL…" value={heroImage} onChange={e => setHeroImage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none" />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="px-5 py-2.5 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm font-semibold">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-brand-green hover:bg-brand-olive text-white font-bold text-sm rounded-xl shadow-sm active:scale-95 disabled:opacity-60 transition-all">
              <Save className="w-4 h-4" />
              <span>{saved ? 'Saved!' : saving ? 'Saving…' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ParkEditorProps {
  park: Park;
  settings: SiteSettings;
  onSave: (updated: SiteSettings) => Promise<void>;
  onClose: () => void;
}

export function ParkEditor({ park, settings, onSave, onClose }: ParkEditorProps) {
  const existing = settings.parkOverrides[park.id] || {};
  const [tagline, setTagline] = useState(existing.tagline ?? park.tagline);
  const [description, setDescription] = useState(existing.description ?? park.description);
  const [coverImage, setCoverImage] = useState(existing.coverImage ?? park.coverImage);
  const [gallery, setGallery] = useState<{ url: string; caption: string }[]>(
    existing.gallery ?? park.gallery
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const addGalleryItem = () => setGallery(prev => [...prev, { url: '', caption: '' }]);
  const removeGalleryItem = (i: number) => setGallery(prev => prev.filter((_, idx) => idx !== i));
  const updateGalleryItem = (i: number, field: 'url' | 'caption', val: string) =>
    setGallery(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleSave = async () => {
    setSaving(true);
    const updated: SiteSettings = {
      ...settings,
      parkOverrides: {
        ...settings.parkOverrides,
        [park.id]: { tagline, description, coverImage, gallery }
      }
    };
    await onSave(updated);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1000);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="h-1.5 bg-brand-green rounded-t-2xl" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif font-bold italic text-brand-dark text-lg">Edit {park.name} Page</h2>
              <p className="text-xs text-stone-400 mt-0.5">Overrides default park content and gallery.</p>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Tagline</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none resize-none" />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Cover / Hero Image</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {IMAGE_PRESETS.map(p => (
                  <button key={p.url} type="button" onClick={() => setCoverImage(p.url)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${coverImage === p.url ? 'border-brand-green' : 'border-transparent'}`}>
                    <img src={p.url} alt={p.name} className="w-full h-12 object-cover" />
                    <span className="block text-[9px] text-center py-0.5 truncate px-1 text-stone-500">{p.name}</span>
                  </button>
                ))}
              </div>
              <input type="text" placeholder="Or custom URL…" value={coverImage} onChange={e => setCoverImage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:border-brand-green focus:outline-none" />
            </div>

            {/* Gallery */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600">Gallery Photos</label>
                <button type="button" onClick={addGalleryItem}
                  className="flex items-center space-x-1 text-xs text-brand-green font-bold hover:text-brand-olive transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>
              </div>
              <div className="space-y-3">
                {gallery.map((item, i) => (
                  <div key={i} className="bg-stone-50 rounded-xl p-3 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Photo {i + 1}</span>
                      <button type="button" onClick={() => removeGalleryItem(i)}
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {/* Quick presets for this gallery item */}
                    <div className="flex space-x-1.5">
                      {IMAGE_PRESETS.map(p => (
                        <button key={p.url} type="button" onClick={() => updateGalleryItem(i, 'url', p.url)}
                          className={`rounded overflow-hidden border transition-all flex-shrink-0 ${item.url === p.url ? 'border-brand-green' : 'border-transparent'}`}>
                          <img src={p.url} alt={p.name} className="w-10 h-8 object-cover" />
                        </button>
                      ))}
                    </div>
                    <input type="text" placeholder="Image URL…" value={item.url} onChange={e => updateGalleryItem(i, 'url', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:border-brand-green focus:outline-none" />
                    <input type="text" placeholder="Caption…" value={item.caption} onChange={e => updateGalleryItem(i, 'caption', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:border-brand-green focus:outline-none" />
                    {item.url && (
                      <img src={item.url} alt="preview" className="w-full h-24 object-cover rounded-lg mt-1" onError={e => (e.currentTarget.style.display = 'none')} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="px-5 py-2.5 text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl text-sm font-semibold">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center space-x-2 px-6 py-2.5 bg-brand-green hover:bg-brand-olive text-white font-bold text-sm rounded-xl shadow-sm active:scale-95 disabled:opacity-60 transition-all">
              <Save className="w-4 h-4" />
              <span>{saved ? 'Saved!' : saving ? 'Saving…' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
