import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Modal from '../ui/Modal';
import type { PostMedia } from '../../../shared/types';

/** Mosaico según el número de imágenes (1, 2, 3, 4+) y visor a pantalla completa. */
export default function ImageGallery({ media, alt = 'Imagen de la publicación' }: { media: PostMedia[]; alt?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const n = media.length;
  if (!n) return null;
  const shown = media.slice(0, 4);
  const extra = n - 4;
  const cell = (m: PostMedia, i: number, cls: string) => (
    <button key={m.url} type="button" onClick={() => setOpen(i)} aria-label={`Ver imagen ${i + 1} de ${n} en pantalla completa`} className={`hover-zoom relative block overflow-hidden bg-arena ${cls}`}>
      <img src={m.url} alt={`${alt} ${i + 1}`} width={m.width ?? 800} height={m.height ?? 1000} loading="lazy" className="h-full w-full object-cover" />
      {i === 3 && extra > 0 && <span className="absolute inset-0 flex items-center justify-center bg-ink/70 font-display text-5xl text-papel">+{extra}</span>}
    </button>
  );
  return (
    <>
      {n === 1 && <div className="grid">{cell(shown[0], 0, 'aspect-[4/3]')}</div>}
      {n === 2 && <div className="grid grid-cols-2 gap-1">{shown.map((m, i) => cell(m, i, 'aspect-[4/5]'))}</div>}
      {n === 3 && (
        <div className="grid grid-cols-2 grid-rows-2 gap-1">
          <div className="row-span-2 [&>button]:h-full [&>button]:min-h-[260px]">{cell(shown[0], 0, 'w-full')}</div>
          {cell(shown[1], 1, 'aspect-square')}{cell(shown[2], 2, 'aspect-square')}
        </div>
      )}
      {n >= 4 && <div className="grid grid-cols-2 gap-1">{shown.map((m, i) => cell(m, i, 'aspect-square'))}</div>}
      <Viewer media={media} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
    </>
  );
}

function Viewer({ media, index, onClose, onIndex }: { media: PostMedia[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const n = media.length;
  const i = index ?? 0;
  const go = (d: number) => onIndex((i + d + n) % n);
  useEffect(() => {
    if (index === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k);
  });
  const [x0, setX0] = useState<number | null>(null);
  return (
    <Modal open={index !== null} onClose={onClose} label="Visor de imágenes" side="full" className="!bg-ink">
      <div className="flex h-full flex-col" onTouchStart={(e) => setX0(e.touches[0].clientX)} onTouchEnd={(e) => { if (x0 !== null) { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 50) go(d < 0 ? 1 : -1); } setX0(null); }}>
        <div className="flex items-center justify-between p-4 text-crema">
          <span className="num font-semibold">{i + 1} / {n}</span>
          <button type="button" onClick={onClose} aria-label="Cerrar visor" className="btn-round !bg-bosque"><X size={22} /></button>
        </div>
        <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
          <img src={media[i]?.url} alt={`Imagen ${i + 1} de ${n}`} className="max-h-full max-w-full object-contain" />
          {n > 1 && <>
            <button type="button" onClick={() => go(-1)} aria-label="Imagen anterior" className="btn-round absolute left-3 top-1/2 -translate-y-1/2 !bg-oro !text-ink"><ChevronLeft /></button>
            <button type="button" onClick={() => go(1)} aria-label="Imagen siguiente" className="btn-round absolute right-3 top-1/2 -translate-y-1/2 !bg-oro !text-ink"><ChevronRight /></button>
          </>}
        </div>
      </div>
    </Modal>
  );
}
