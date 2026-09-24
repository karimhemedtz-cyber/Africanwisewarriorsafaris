import React, { useState } from 'react';
import {
  Pencil,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

import { CountryEditor, ParkEditor } from './CountryParkEditor';
import MediaPicker from './MediaPicker';
import RichTextEditor from './RichTextEditor';

import type { SiteSettings } from '../types';
import type { Country, Park } from '../eastAfricaData';

interface CountryParkManagerProps {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => Promise<void>;
}

const emptyPark = (countryId: string): Park => ({
  id: `custom-park-${Date.now()}`,
  name: 'New National Park',
  country: countryId,
  tagline: '',
  description: '',
  highlights: [],
  bestTime: '',
  coverImage: '',
  gallery: [],
});

const emptyCountry = (): Country => ({
  id: `custom-country-${Date.now()}`,
  name: 'New Country',
  flag: '🌍',
  capital: '',
  tagline: '',
  description: '',
  heroImage: '',
  parks: [],
});

export default function CountryParkManager({
  settings,
  onSave,
}: CountryParkManagerProps) {
  const customCountries = settings.customCountries ?? [];

  const [expandedCountry, setExpandedCountry] = useState<string | null>(
    null
  );

  const [editingCountry, setEditingCountry] = useState<Country | null>(
    null
  );

  const [editingPark, setEditingPark] = useState<{
    park: Park;
    country: Country;
  } | null>(null);

  const saveCountries = async (countries: Country[]) => {
    await onSave({
      ...settings,
      customCountries: countries,
    });
  };

  const addCountry = async () => {
    const country = emptyCountry();

    await saveCountries([
      ...customCountries,
      country,
    ]);

    setExpandedCountry(country.id);
    setEditingCountry(country);
  };

  const deleteCountry = async (countryId: string) => {
    if (
      !window.confirm(
        'Delete this country and all of its parks?'
      )
    ) {
      return;
    }

    await saveCountries(
      customCountries.filter(
        (country) => country.id !== countryId
      )
    );

    if (expandedCountry === countryId) {
      setExpandedCountry(null);
    }
  };

  const addPark = async (country: Country) => {
    const park = emptyPark(country.id);

    const updatedCountries = customCountries.map(
      (item) =>
        item.id === country.id
          ? {
              ...item,
              parks: [
                ...item.parks,
                park,
              ],
            }
          : item
    );

    await saveCountries(updatedCountries);

    setExpandedCountry(country.id);

    setEditingPark({
      park,
      country: {
        ...country,
        parks: [
          ...country.parks,
          park,
        ],
      },
    });
  };

  const deletePark = async (
    countryId: string,
    parkId: string
  ) => {
    if (
      !window.confirm(
        'Delete this national park?'
      )
    ) {
      return;
    }

    const updatedCountries = customCountries.map(
      (country) =>
        country.id === countryId
          ? {
              ...country,
              parks: country.parks.filter(
                (park) => park.id !== parkId
              ),
            }
          : country
    );

    await saveCountries(updatedCountries);
  };

  const handleCountrySave = async (
    updated: Country
  ) => {
    const updatedCountries = customCountries.map(
      (country) =>
        country.id === updated.id
          ? updated
          : country
    );

    await saveCountries(updatedCountries);
    setEditingCountry(null);
  };

  const handleParkSave = async (
    updatedPark: Park
  ) => {
    const updatedCountries = customCountries.map(
      (country) =>
        country.id === updatedPark.country
          ? {
              ...country,
              parks: country.parks.map(
                (park) =>
                  park.id === updatedPark.id
                    ? updatedPark
                    : park
              ),
            }
          : country
    );

    await saveCountries(updatedCountries);
    setEditingPark(null);
  };

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-serif font-bold text-stone-800 text-sm">
              Custom Countries & National Parks
            </h3>

            <p className="text-xs text-stone-400 mt-0.5">
              Add countries and manage their national parks.
            </p>
          </div>

          <button
            type="button"
            onClick={addCountry}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-green text-white text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            Add Country
          </button>
        </div>

        {customCountries.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-stone-500">
              No custom countries added yet.
            </p>

            <p className="text-xs text-stone-400 mt-1">
              Use “Add Country” to create a new destination.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {customCountries.map((country) => {
              const expanded =
                expandedCountry === country.id;

              return (
                <div key={country.id}>
                  <div className="p-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedCountry(
                          expanded
                            ? null
                            : country.id
                        )
                      }
                      className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 shrink-0"
                      aria-label={
                        expanded
                          ? 'Collapse country'
                          : 'Expand country'
                      }
                    >
                      {expanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">
                          {country.flag}
                        </span>

                        <p className="font-bold text-stone-800 text-sm truncate">
                          {country.name}
                        </p>
                      </div>

                      <p className="text-xs text-stone-400 mt-0.5">
                        {country.capital ||
                          'Capital not set'}{' '}
                        · {country.parks.length}{' '}
                        national park
                        {country.parks.length === 1
                          ? ''
                          : 's'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingCountry(country)
                      }
                      className="p-2 rounded-lg bg-stone-100 hover:bg-brand-green hover:text-white text-stone-600 shrink-0"
                      aria-label={`Edit ${country.name}`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCountry(country.id)
                      }
                      className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0"
                      aria-label={`Delete ${country.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {expanded && (
                    <div className="bg-stone-50/70 border-t border-stone-100">
                      <div className="p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-stone-700">
                            National Parks
                          </p>

                          <p className="text-[10px] text-stone-400">
                            Add parks under {country.name}.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addPark(country)
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-stone-200 text-stone-700 text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Park
                        </button>
                      </div>

                      {country.parks.length === 0 ? (
                        <div className="px-4 pb-4 text-xs text-stone-400">
                          No national parks added yet.
                        </div>
                      ) : (
                        <div className="space-y-2 px-3 pb-3">
                          {country.parks.map((park) => (
                            <div
                              key={park.id}
                              className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3"
                            >
                              <img
                                src={
                                  park.coverImage ||
                                  '/images/package_serengeti_1779964123153.png'
                                }
                                alt={park.name}
                                className="w-14 h-11 object-cover rounded-lg border border-stone-200 shrink-0"
                              />

                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-stone-700 truncate">
                                  {park.name}
                                </p>

                                <p className="text-[10px] text-stone-400 line-clamp-1">
                                  {park.tagline ||
                                    'No tagline'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setEditingPark({
                                    park,
                                    country,
                                  })
                                }
                                className="p-2 rounded-lg bg-stone-100 hover:bg-brand-green hover:text-white text-stone-600 shrink-0"
                                aria-label={`Edit ${park.name}`}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deletePark(
                                    country.id,
                                    park.id
                                  )
                                }
                                className="p-2 rounded-lg bg-red-50 text-red-600 shrink-0"
                                aria-label={`Delete ${park.name}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingCountry && (
        <CustomCountryEditor
          country={editingCountry}
          onSave={handleCountrySave}
          onClose={() => setEditingCountry(null)}
        />
      )}

      {editingPark && (
        <CustomParkEditor
          park={editingPark.park}
          country={editingPark.country}
          onSave={handleParkSave}
          onClose={() => setEditingPark(null)}
        />
      )}
    </>
  );
}

interface CustomCountryEditorProps {
  country: Country;
  onSave: (country: Country) => Promise<void>;
  onClose: () => void;
}

function CustomCountryEditor({
  country,
  onSave,
  onClose,
}: CustomCountryEditorProps) {
  const [name, setName] = useState(country.name);
  const [flag, setFlag] = useState(country.flag || '🌍');
  const [capital, setCapital] = useState(country.capital);
  const [tagline, setTagline] = useState(country.tagline);
  const [description, setDescription] = useState(country.description);
  const [heroImage, setHeroImage] = useState(country.heroImage);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (
      !name.trim() ||
      !capital.trim() ||
      !tagline.trim() ||
      !description.trim()
    ) {
      alert(
        'Country name, capital, tagline and description are required.'
      );
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...country,
        name: name.trim(),
        flag: flag.trim() || '🌍',
        capital: capital.trim(),
        tagline: tagline.trim(),
        description,
        heroImage,
      });
    } catch (error) {
      console.error(error);
      alert('Failed to save country.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-3xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="font-serif font-bold text-stone-900">
              Add / Edit Country
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Destination information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-200"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className="text-xs font-bold text-stone-600">
                Country Name
              </span>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
              />
            </label>

            <label>
              <span className="text-xs font-bold text-stone-600">
                Flag Emoji
              </span>

              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="🇹🇿"
                maxLength={8}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-2xl"
              />

              <span className="block text-[10px] text-stone-400 mt-1">
                Emoji only, e.g. 🇹🇿 🇰🇪 🇺🇬
              </span>
            </label>

            <label>
              <span className="text-xs font-bold text-stone-600">
                Capital
              </span>

              <input
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <label>
            <span className="text-xs font-bold text-stone-600">
              Tagline
            </span>

            <input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
            />
          </label>

          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write country information..."
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

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-4 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-brand-green text-white text-sm font-bold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Country'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CustomParkEditorProps {
  park: Park;
  country: Country;
  onSave: (park: Park) => Promise<void>;
  onClose: () => void;
}

function CustomParkEditor({
  park,
  country,
  onSave,
  onClose,
}: CustomParkEditorProps) {
  const [name, setName] = useState(park.name);
  const [tagline, setTagline] = useState(park.tagline);
  const [description, setDescription] = useState(park.description);
  const [bestTime, setBestTime] = useState(park.bestTime);
  const [coverImage, setCoverImage] = useState(park.coverImage);
  const [highlights, setHighlights] = useState(park.highlights);
  const [gallery, setGallery] = useState(park.gallery);
  const [saving, setSaving] = useState(false);

  const addHighlight = () => {
    setHighlights((items) => [...items, '']);
  };

  const removeHighlight = (index: number) => {
    setHighlights((items) =>
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const addPhoto = (url: string) => {
    if (!url) return;

    setGallery((items) => [
      ...items,
      {
        url,
        caption: '',
      },
    ]);
  };

  const removePhoto = (index: number) => {
    setGallery((items) =>
      items.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const submit = async () => {
    if (
      !name.trim() ||
      !tagline.trim() ||
      !description.trim()
    ) {
      alert(
        'Park name, tagline and description are required.'
      );
      return;
    }

    setSaving(true);

    try {
      await onSave({
        ...park,
        name: name.trim(),
        tagline: tagline.trim(),
        description,
        bestTime: bestTime.trim(),
        coverImage,
        highlights: highlights
          .map((item) => item.trim())
          .filter(Boolean),
        gallery,
      });
    } catch (error) {
      console.error(error);
      alert('Failed to save park.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div>
            <h3 className="font-serif font-bold text-stone-900">
              Add / Edit National Park
            </h3>

            <p className="text-xs text-stone-400 mt-0.5">
              {country.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stone-200"
          >
            <span className="sr-only">Close</span>
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>
              <span className="text-xs font-bold text-stone-600">
                Park Name
              </span>

              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
              />
            </label>

            <label>
              <span className="text-xs font-bold text-stone-600">
                Tagline
              </span>

              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
              />
            </label>
          </div>

          <label>
            <span className="text-xs font-bold text-stone-600">
              Best Time
            </span>

            <input
              value={bestTime}
              onChange={(e) => setBestTime(e.target.value)}
              placeholder="e.g. June to October"
              className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
            />
          </label>

          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Write national park information..."
            minHeight="220px"
          />

          <MediaPicker
            value={coverImage}
            onChange={setCoverImage}
            folder="parks"
            label="Park Cover Image"
            aspectClassName="h-56"
          />

          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h4 className="text-sm font-bold text-stone-800">
                  Highlights
                </h4>

                <p className="text-xs text-stone-400">
                  Add important attractions and experiences.
                </p>
              </div>

              <button
                type="button"
                onClick={addHighlight}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-stone-100 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-2">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={highlight}
                    onChange={(e) =>
                      setHighlights((items) =>
                        items.map((item, itemIndex) =>
                          itemIndex === index
                            ? e.target.value
                            : item
                        )
                      )
                    }
                    placeholder={`Highlight ${index + 1}`}
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-2.5 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      removeHighlight(index)
                    }
                    className="p-2.5 rounded-lg bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3">
              <h4 className="text-sm font-bold text-stone-800">
                Park Photos
              </h4>

              <p className="text-xs text-stone-400">
                Import photos directly from the device.
              </p>
            </div>

            <MediaPicker
              value=""
              onChange={addPhoto}
              folder="parks/gallery"
              label="Add Park Photo"
              aspectClassName="h-44"
            />

            {gallery.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                {gallery.map((photo, index) => (
                  <div
                    key={`${photo.url}-${index}`}
                    className="border border-stone-200 rounded-xl overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={
                        photo.caption ||
                        `${park.name} photo ${index + 1}`
                      }
                      className="w-full h-40 object-cover"
                    />

                    <div className="p-3">
                      <input
                        value={photo.caption}
                        onChange={(e) =>
                          setGallery((items) =>
                            items.map(
                              (item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      caption:
                                        e.target.value,
                                    }
                                  : item
                            )
                          )
                        }
                        placeholder="Photo caption"
                        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removePhoto(index)
                        }
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-4 sm:px-6 py-4 border-t border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-stone-200 bg-white text-sm font-bold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-brand-green text-white text-sm font-bold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Park'}
          </button>
        </div>
      </div>
    </div>
  );
}
