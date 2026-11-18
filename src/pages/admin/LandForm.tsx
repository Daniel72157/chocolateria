import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ImagePlus, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json } from '../../hooks/useAdmin';
import { landInput } from '../../../shared/schemas';
import { uploadImage } from '../../lib/upload';
import { toast } from '../../store/toast';
import type { LandTile } from '../../../shared/types';

type Photo = { url: string; path: string; width?: number; height?: number };
const MAX = 3000;

/** Crear o editar una foto de «Nuestra tierra» con su historia. */
export default function LandForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const { data: ex } = useAdminGet<LandTile>(['land-tile', id], `/admin/land/${id}`, !!id);
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [published, setPublished] = useState(true);
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  useEffect(() => {
    if (!ex) return;
    setName(ex.name); setTag(ex.tag ?? ''); setTitle(ex.title ?? ''); setStory(ex.story ?? ''); setPublished(ex.is_published !== false);
    setPhoto({ url: ex.image_url, path: ex.image_path ?? '', width: ex.width ?? undefined, height: ex.height ?? undefined });
  }, [ex]);

  const pick = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return toast.error('Sube una imagen (JPG, PNG o WebP)');
    setBusy(true);
    try { setPhoto(await uploadImage('land', id ?? 'tmp', f)); }
    catch { toast.error('No se pudo subir la foto'); }
    finally { setBusy(false); }
  };

  const save = useAdminMutation((p: unknown) => (id ? api(`/admin/land/${id}`, json('PUT', p)) : api('/admin/land', json('POST', p))),
    { invalidate: [['admin', 'land'], ['admin', 'land-tile'], ['land']], ok: 'Foto guardada', onDone: () => setTimeout(() => nav('/admin/tierra'), 0) });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = landInput.safeParse({ name, tag, title, story, isPublished: published, imageUrl: photo?.url ?? '', imagePath: photo?.path ?? '', width: photo?.width, height: photo?.height });
    if (!r.success) return toast.error(r.error.issues[0].message);
    save.mutate(r.data);
  };

  return (
    <form onSubmit={submit} className="grid max-w-5xl gap-6 lg:grid-cols-2">
      <div className="grid content-start gap-5">
        <h1 className="t-h2 text-4xl">{id ? 'Editar foto' : 'Nueva foto'}</h1>
        <div>
          <p className="label">Foto</p>
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            className={`flex flex-col items-center gap-2 border-2 border-dashed p-6 text-center ${drag ? 'border-oro bg-arena/40' : 'border-tierra/30'}`}>
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : <ImagePlus aria-hidden />}
            <p>{busy ? 'Subiendo foto…' : photo ? 'Arrastra otra foto para reemplazarla' : 'Arrastra aquí la foto'}</p>
            <button type="button" className="btn btn-soft btn-sm" disabled={busy} onClick={() => input.current?.click()}>{photo ? 'Cambiar foto' : 'Elegir foto'}</button>
            <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} aria-label="Seleccionar foto" />
            <p className="t-small text-tierra">Se muestra en formato vertical (4:5); lo ideal es una foto vertical.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="ln" className="label">Nombre (sale en la foto)</label><input id="ln" className="field !bg-crema" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Tucán" /></div>
          <div><label htmlFor="lg" className="label">Etiqueta (opcional)</label><input id="lg" className="field !bg-crema" maxLength={40} value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Ej.: Aves" /></div>
        </div>
        <div><label htmlFor="lt" className="label">Título de la historia</label><input id="lt" className="field !bg-crema" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: El tucán, sembrador del bosque" /></div>
        <div><label htmlFor="ls" className="label">Historia</label>
          <textarea id="ls" className="field !min-h-[220px] !bg-crema" maxLength={MAX} value={story} onChange={(e) => setStory(e.target.value)} />
          <p className="t-small mt-1 flex justify-between text-tierra"><span>Cada salto de línea crea un párrafo nuevo.</span><span className="num">{story.length}/{MAX}</span></p></div>
        <label className="flex items-center gap-3 bg-crema p-4"><input type="checkbox" className="h-6 w-6 accent-bosque" checked={published} onChange={(e) => setPublished(e.target.checked)} />Mostrar en el inicio</label>
        <div className="flex gap-3"><button className="btn btn-primary" disabled={save.isPending || busy}>Guardar</button><Link to="/admin/tierra" className="btn btn-light">Cancelar</Link></div>
      </div>
      <aside aria-label="Vista previa" className="lg:sticky lg:top-6 lg:self-start">
        <p className="label">Así se verá la foto</p>
        <figure className="max-w-[260px]">
          <div className="aspect-[4/5] overflow-hidden bg-arena">{photo && <img src={photo.url} alt="" className="h-full w-full object-cover" />}</div>
          <figcaption className="flex items-center justify-between gap-2 bg-ink p-3 text-papel"><span className="font-display font-semibold">{name || 'Nombre'}</span>{tag && <span>{tag}</span>}</figcaption>
        </figure>
        <p className="label mt-6">Así se verá la historia</p>
        <div className="paper p-5">
          <p className="font-display text-xl font-semibold leading-tight">{title || name || 'Título'}</p>
          <div className="mt-3 grid gap-2 text-justify hyphens-auto">{(story || 'Escribe la historia…').split('\n').map((l, k) => <p key={k}>{l}</p>)}</div>
        </div>
      </aside>
    </form>
  );
}
