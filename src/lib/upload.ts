import imageCompression from 'browser-image-compression';
import { api } from './api';
import { supabase } from './supabase';

export type Bucket = 'products' | 'posts' | 'catalogs' | 'awards' | 'land';
type Uploaded = { url: string; path: string; width?: number; height?: number };

/** Pide URL firmada al backend y sube el archivo directo a Storage. */
async function uploadBlob(bucket: Bucket, folder: string, blob: Blob, contentType: 'image/webp' | 'application/pdf') {
  const sig = await api<{ path: string; token: string; publicUrl: string }>('/admin/uploads/sign', {
    method: 'POST', body: JSON.stringify({ bucket, folder, contentType }),
  });
  const { error } = await supabase.storage.from(bucket).uploadToSignedUrl(sig.path, sig.token, blob, { contentType });
  if (error) throw error;
  return { url: sig.publicUrl, path: sig.path };
}

/** Comprime a WebP (máx. 1600 px) y la sube. */
export async function uploadImage(bucket: Bucket, folder: string, file: File | Blob): Promise<Uploaded> {
  const blob = await imageCompression(file as File, { maxWidthOrHeight: 1600, fileType: 'image/webp', initialQuality: 0.85, useWebWorker: true });
  const up = await uploadBlob(bucket, folder, blob, 'image/webp');
  const bmp = await createImageBitmap(blob).catch(() => null);
  return { ...up, width: bmp?.width, height: bmp?.height };
}

/** Sube un PDF tal cual (sin comprimir). */
export const uploadPdf = (bucket: Bucket, folder: string, file: File) => uploadBlob(bucket, folder, file, 'application/pdf');

/** Dibuja la primera página de un PDF y la devuelve como imagen WebP (lado mayor ≈ 1600 px). */
export async function pdfFirstPage(file: File): Promise<Blob> {
  const [pdfjs, worker] = await Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  try {
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 1600 / Math.max(base.width, base.height) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff'; // los PDF sin fondo se verían transparentes
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;
    return await new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error('No se pudo convertir el PDF'))), 'image/webp', 0.88));
  } finally {
    void doc.destroy();
  }
}
