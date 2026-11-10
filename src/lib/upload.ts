import imageCompression from 'browser-image-compression';
import { api } from './api';
import { supabase } from './supabase';

export type Bucket = 'products' | 'posts' | 'catalogs';

/** Comprime a WebP (máx. 1600 px), pide URL firmada al backend y sube directo a Storage. */
export async function uploadImage(bucket: Bucket, folder: string, file: File) {
  const blob = await imageCompression(file, { maxWidthOrHeight: 1600, fileType: 'image/webp', initialQuality: 0.85, useWebWorker: true });
  const sig = await api<{ path: string; token: string; publicUrl: string }>('/admin/uploads/sign', {
    method: 'POST', body: JSON.stringify({ bucket, folder, contentType: 'image/webp' }),
  });
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(sig.path, sig.token, blob, { contentType: 'image/webp' });
  if (error) throw error;
  const bmp = await createImageBitmap(blob).catch(() => null);
  return { url: sig.publicUrl, path: sig.path, width: bmp?.width, height: bmp?.height };
}
