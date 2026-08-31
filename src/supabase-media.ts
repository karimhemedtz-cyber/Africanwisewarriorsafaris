/**
 * Supabase Storage helpers for administrator-managed site media.
 * All write authorization is enforced by Supabase RLS/storage policies.
 */

import { supabase } from './supabase';

const BUCKET = 'site-media';
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]);

const sanitizeSegment = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'content';

const getExtension = (file: File) => {
  const fromName = file.name.split('.').pop()?.toLowerCase();

  if (fromName && /^[a-z0-9]+$/.test(fromName)) {
    return fromName;
  }

  switch (file.type) {
    case 'image/jpeg': return 'jpg';
    case 'image/png': return 'png';
    case 'image/webp': return 'webp';
    case 'image/gif': return 'gif';
    default: return 'bin';
  }
};

export async function uploadSiteImage(
  file: File,
  folder = 'content'
): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(
      'Unsupported image format. Use JPEG, PNG, WebP or GIF.'
    );
  }

  if (file.size <= 0) {
    throw new Error('The selected image is empty.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image is too large. Maximum size is 10 MB.');
  }

  const safeFolder = sanitizeSegment(folder);
  const extension = getExtension(file);
  const objectPath =
    `${safeFolder}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false
    });

  if (uploadError) {
    throw new Error(
      uploadError.message || 'Could not upload image.'
    );
  }

  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(objectPath);

  if (!data?.publicUrl) {
    throw new Error(
      'Image uploaded but a public URL could not be generated.'
    );
  }

  return data.publicUrl;
}

export async function deleteSiteImage(
  publicUrl: string
): Promise<void> {
  if (!supabase || !publicUrl) return;

  const marker =
    `/storage/v1/object/public/${BUCKET}/`;

  const index = publicUrl.indexOf(marker);

  if (index === -1) return;

  const objectPath = decodeURIComponent(
    publicUrl.slice(index + marker.length)
  );

  if (!objectPath || objectPath.includes('..')) return;

  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([objectPath]);

  if (error) {
    throw new Error(
      error.message || 'Could not delete image.'
    );
  }
}
