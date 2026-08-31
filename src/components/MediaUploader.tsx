import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { uploadSiteImage } from '../supabase-media';

interface MediaUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  disabled?: boolean;
}

export default function MediaUploader({
  value,
  onChange,
  folder = 'content',
  label = 'Image',
  disabled = false
}: MediaUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');
    setUploading(true);

    try {
      const url = await uploadSiteImage(file, folder);
      onChange(url);
    } catch (err) {
      console.error('Media upload failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to upload image.'
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setError('');
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
        {label}
      </label>

      <div className="rounded-xl border border-stone-200 bg-stone-50 overflow-hidden">
        {value ? (
          <div className="relative">
            <img
              src={value}
              alt={label}
              className="w-full h-48 object-cover"
            />

            <div className="absolute top-2 right-2 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/95 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 shadow-sm hover:bg-white disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                Replace
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || uploading}
                className="p-2 bg-white/95 border border-stone-200 rounded-lg text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full h-40 flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50/40 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span className="text-xs font-semibold">
                  Uploading image...
                </span>
              </>
            ) : (
              <>
                <ImagePlus className="w-7 h-7" />
                <span className="text-xs font-semibold">
                  Upload image
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
        disabled={disabled || uploading}
        className="hidden"
      />

      {value && (
        <p className="text-[10px] text-stone-400 break-all">
          {value}
        </p>
      )}

      {error && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[10px]">
          <span className="font-semibold">{error}</span>
        </div>
      )}
    </div>
  );
}
