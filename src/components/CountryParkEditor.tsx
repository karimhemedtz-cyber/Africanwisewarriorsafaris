import React, { useEffect, useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import MediaPicker from './MediaPicker';
import type { Country, Park } from '../eastAfricaData';
import type { SiteSettings } from '../types';

interface CountryEditorProps {
  country: Country;
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
  onClose: () => void;
}

interface ParkEditorProps {
  park: Park;
  country: Country;
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
  onClose: () => void;
}

export const CountryEditor: React.FC<CountryEditorProps> = ({
  country,
  settings,
  onSave,
  onClose,
}) => {
  const existing = settings.countryOverrides[country.id] || {};

  const [name, setName] = useState(existing.name ?? country.name);
  const [capital, setCapital] = useState(existing.capital ?? country.capital);
  const [tagline, setTagline] = useState(existing.tagline ?? country.tagline);
  const [description, setDescription] = useState(
    existing.description ?? country.description
  );
  const [heroImage, setHeroImage] = useState(
    existing.heroImage ?? country.heroImage
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !capital.trim() || !tagline.trim() || !description.trim()) {
      alert('Country name, capital, tagline and description are required.');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...settings,
        countryOverrides: {
          ...settings.countryOverrides,
          [country.id]: {
            ...settings.countryOverrides[country.id],
            name: name.trim(),
            capital: capital.trim(),
            tagline: tagline.trim(),
            description,
            heroImage,
          },
        },
      });

      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to save country settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              Edit Country
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {country.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-200 text-stone-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-stone-600">
                Country Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-stone-600">
                Capital
              </span>
              <input
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-bold text-stone-600">
              Tagline
            </span>
            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
            />
          </label>

          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write the country description..."
            minHeight="220px"
          />

          <MediaPicker
            value={heroImage}
            onChange={setHeroImage}
            folder="countries"
            label="Country Hero Image"
            aspectClassName="h-56"
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-4 border-t border-stone-200 bg-stone-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm font-bold text-stone-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-green text-white text-sm font-bold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Country'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ParkEditor: React.FC<ParkEditorProps> = ({
  park,
  country,
  settings,
  onSave,
  onClose,
}) => {
  const existing = settings.parkOverrides[park.id] || {};

  const [name, setName] = useState(existing.name ?? park.name);
  const [tagline, setTagline] = useState(existing.tagline ?? park.tagline);
  const [description, setDescription] = useState(
    existing.description ?? park.description
  );
  const [coverImage, setCoverImage] = useState(
    existing.coverImage ?? park.coverImage
  );
  const [highlights, setHighlights] = useState<string[]>(
    existing.highlights ?? park.highlights
  );
  const [gallery, setGallery] = useState(
    existing.gallery ?? park.gallery
  );
  const [saving, setSaving] = useState(false);

  const updateHighlight = (index: number, value: string) => {
    setHighlights((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  };

  const addHighlight = () => {
    setHighlights((items) => [...items, '']);
  };

  const removeHighlight = (index: number) => {
    setHighlights((items) =>
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const addGalleryImage = (url: string) => {
    if (!url) return;

    setGallery((items) => [
      ...items,
      {
        url,
        caption: '',
      },
    ]);
  };

  const updateGalleryCaption = (index: number, caption: string) => {
    setGallery((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, caption } : item
      )
    );
  };

  const removeGalleryImage = (index: number) => {
    setGallery((items) =>
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const handleSave = async () => {
    const cleanHighlights = highlights
      .map((item) => item.trim())
      .filter(Boolean);

    if (!name.trim() || !tagline.trim() || !description.trim()) {
      alert('Park name, tagline and description are required.');
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...settings,
        parkOverrides: {
          ...settings.parkOverrides,
          [park.id]: {
            ...settings.parkOverrides[park.id],
            name: name.trim(),
            tagline: tagline.trim(),
            description,
            coverImage,
            highlights: cleanHighlights,
            gallery,
          },
        },
      });

      onClose();
    } catch (error) {
      console.error(error);
      alert('Failed to save park settings.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!gallery.length) {
      setGallery([]);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div>
            <h2 className="font-serif font-bold text-stone-900 text-lg">
              Edit National Park
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {country.name} · {park.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-200 text-stone-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-bold text-stone-600">
                Park Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
              />
            </label>

            <label className="block">
              <span className="text-xs font-bold text-stone-600">
                Tagline
              </span>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
              />
            </label>
          </div>

          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write the national park description..."
            minHeight="220px"
          />

          <MediaPicker
            value={coverImage}
            onChange={setCoverImage}
            folder="parks"
            label="Park Cover Image"
            aspectClassName="h-56"
          />

          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-800">
                  Highlights
                </h3>
                <p className="text-xs text-stone-400">
                  Add or remove park highlights.
                </p>
              </div>

              <button
                type="button"
                onClick={addHighlight}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-100 text-stone-700 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div key={`${index}-${highlight}`} className="flex gap-2">
                  <input
                    value={highlight}
                    onChange={(e) =>
                      updateHighlight(index, e.target.value)
                    }
                    placeholder={`Highlight ${index + 1}`}
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-brand-green"
                  />

                  <button
                    type="button"
                    onClick={() => removeHighlight(index)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600"
                    aria-label={`Remove highlight ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {!highlights.length && (
                <p className="text-xs text-stone-400 border border-dashed border-stone-200 rounded-lg p-4 text-center">
                  No highlights added yet.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="mb-3">
              <h3 className="text-sm font-bold text-stone-800">
                Park Photos
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Select photos directly from the device.
              </p>
            </div>

            <MediaPicker
              value=""
              onChange={addGalleryImage}
              folder="parks/gallery"
              label="Add Park Photo"
              aspectClassName="h-44"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {gallery.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="border border-stone-200 rounded-xl overflow-hidden bg-stone-50"
                >
                  <img
                    src={image.url}
                    alt={image.caption || `${park.name} photo ${index + 1}`}
                    className="w-full h-40 object-cover"
                  />

                  <div className="p-3 space-y-2">
                    <input
                      value={image.caption}
                      onChange={(e) =>
                        updateGalleryCaption(index, e.target.value)
                      }
                      placeholder="Photo caption"
                      className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-brand-green"
                    />

                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove photo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-4 border-t border-stone-200 bg-stone-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm font-bold text-stone-600"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-green text-white text-sm font-bold disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Park'}
          </button>
        </div>
      </div>
    </div>
  );
};
