/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import {
  ImagePlus,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import {
  deleteSiteImage,
  uploadSiteImage
} from '../supabase-media';

interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  disabled?: boolean;
  aspectClassName?: string;
}

export default function MediaPicker({
  value,
  onChange,
  folder = 'content',
  label = 'Photo',
  disabled = false,
  aspectClassName = 'h-48'
}: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const chooseFile = () => {
    if (!disabled && !busy) {
      inputRef.current?.click();
    }
  };

  const handleSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');
    setBusy(true);

    const previousUrl = value;

    try {
      const newUrl = await uploadSiteImage(file, folder);

      /*
       * Upload the new image first.
       * Only after successful upload do we replace the current URL.
       */
      onChange(newUrl);

      /*
       * Clean up the previous Supabase image.
       * Cleanup failure must not invalidate the new image.
       */
      if (previousUrl && previousUrl !== newUrl) {
        try {
          await deleteSiteImage(previousUrl);
        } catch (cleanupError) {
          console.warn(
            'Previous media cleanup failed:',
            cleanupError
          );
        }
      }
    } catch (err) {
      console.error('Media upload failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Could not upload the selected image.'
      );
    } finally {
      setBusy(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value || disabled || busy) return;

    setError('');
    setBusy(true);

    try {
      await deleteSiteImage(value);
      onChange('');
    } catch (err) {
      console.error('Media removal failed:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Could not remove the selected image.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">

      <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-700">
        {label}
      </label>

      <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">

        {value ? (
          <div className="relative">

            <img
              src={value}
              alt={`${label} preview`}
              className={`w-full ${aspectClassName} object-cover`}
            />

            <div className="absolute inset-x-2 top-2 flex justify-end gap-2">

              <button
                type="button"
                onClick={chooseFile}
                disabled={disabled || busy}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white/95 px-3 py-2 text-xs font-bold text-stone-700 shadow-sm hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}

                Replace
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || busy}
                aria-label={`Remove ${label}`}
                className="rounded-lg border border-stone-200 bg-white/95 p-2 text-red-600 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>

            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={chooseFile}
            disabled={disabled || busy}
            className="flex h-40 w-full flex-col items-center justify-center gap-2 text-stone-500 transition-colors hover:bg-emerald-50/40 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <Loader2 className="h-7 w-7 animate-spin" />

                <span className="text-xs font-semibold">
                  Uploading image…
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="h-7 w-7" />

                <span className="text-xs font-semibold">
                  Add Photo
                </span>

                <span className="text-[10px] text-stone-400">
                  JPEG, PNG, WebP or GIF • Max 10 MB
                </span>
              </>
            )}
          </button>
        )}

      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleSelect}
        disabled={disabled || busy}
        className="hidden"
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-[10px] font-semibold text-red-700">
          {error}
        </p>
      )}

    </div>
  );
}
