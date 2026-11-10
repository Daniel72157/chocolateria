import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, X } from 'lucide-react';
import { uploadImage, type Bucket } from '../../lib/upload';
import { toast } from '../../store/toast';

export type Img = { url: string; path: string; alt?: string; width?: number; height?: number };

export default function ImageList({ value, onChange, bucket, folder, max, withAlt, altHint }: {
  value: Img[]; onChange: (v: Img[]) => void; bucket: Bucket; folder: string; max: number; withAlt?: boolean; altHint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null);
  const [drag, setDrag] = useState(false);

  const add = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith('image/')).slice(0, max - value.length);
    if (!list.length) return;
    setBusy({ done: 0, total: list.length });
    const out: Img[] = [];
    for (const f of list) {
      try { out.push({ ...(await uploadImage(bucket, folder, f)), alt: altHint }); }
      catch { toast.error(`No se pudo subir ${f.name}`); }
      setBusy((b) => b && { ...b, done: b.done + 1 });
    }
    setBusy(null);
    onChange([...value, ...out]);
  };
  const move = (i: number, d: number) => { const n = [...value]; [n[i], n[i + d]] = [n[i + d], n[i]]; onChange(n); };

  return (
    <div>
      <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={`flex flex-col items-center gap-2 border-2 border-dashed p-6 text-center ${drag ? 'border-oro bg-arena/40' : 'border-tierra/30'}`}>
        <ImagePlus aria-hidden />
        <p>Arrastra las fotos aquí ({value.length}/{max})</p>
        <button type="button" className="btn btn-soft btn-sm" disabled={value.length >= max || !!busy} onClick={() => input.current?.click()}>Elegir fotos</button>
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files) add(e.target.files); e.target.value = ''; }} aria-label="Seleccionar imágenes" />
        {busy && <div role="progressbar" aria-valuemin={0} aria-valuemax={busy.total} aria-valuenow={busy.done} className="h-2 w-full max-w-xs bg-crema"><div className="h-full bg-oro transition-all" style={{ width: `${(busy.done / busy.total) * 100}%` }} /></div>}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {value.map((im, i) => (
          <li key={im.path} className="bg-crema p-2">
            <div className="relative aspect-[4/5] overflow-hidden bg-arena">
              <img src={im.url} alt={im.alt ?? ''} className="h-full w-full object-cover" />
              {i === 0 && <span className="absolute left-1 top-1 rounded-full bg-bosque px-2 py-0.5 text-sm font-bold text-papel">Portada</span>}
              <button type="button" aria-label="Quitar imagen" onClick={() => onChange(value.filter((_, k) => k !== i))} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-rojo text-papel"><X size={16} /></button>
            </div>
            {withAlt && <input aria-label={`Texto alternativo de la imagen ${i + 1}`} placeholder="Texto alternativo" value={im.alt ?? ''} onChange={(e) => onChange(value.map((v, k) => (k === i ? { ...v, alt: e.target.value } : v)))} className="field mt-2 !min-h-[40px] !bg-papel !px-2 text-base" />}
            <div className="mt-2 flex justify-between">
              <button type="button" disabled={i === 0} aria-label="Mover antes" onClick={() => move(i, -1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel disabled:opacity-30"><ArrowLeft size={16} /></button>
              <button type="button" disabled={i === value.length - 1} aria-label="Mover después" onClick={() => move(i, 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-papel disabled:opacity-30"><ArrowRight size={16} /></button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
