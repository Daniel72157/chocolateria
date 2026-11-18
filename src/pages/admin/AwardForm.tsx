import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FileText, FileUp, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json } from '../../hooks/useAdmin';
import { awardInput } from '../../../shared/schemas';
import { pdfFirstPage, uploadImage, uploadPdf } from '../../lib/upload';
import { toast } from '../../store/toast';
import type { Award } from '../../../shared/types';

const MAX_MB = 15;
type Files = { imageUrl: string; imagePath: string; width?: number; height?: number; fileUrl: string | null; filePath: string | null };

/** Crear o editar un reconocimiento: se sube el PDF (o una imagen) y la primera página se guarda como miniatura. */
export default function AwardForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const { data: ex } = useAdminGet<Award>(['award', id], `/admin/awards/${id}`, !!id);
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [year, setYear] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [files, setFiles] = useState<Files | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  useEffect(() => {
    if (!ex) return;
    setTitle(ex.title); setIssuer(ex.issuer ?? ''); setYear(ex.year ?? ''); setDescription(ex.description ?? ''); setPublished(ex.is_published !== false);
    setFiles({ imageUrl: ex.image_url, imagePath: ex.image_path ?? '', width: ex.width ?? undefined, height: ex.height ?? undefined, fileUrl: ex.file_url, filePath: ex.file_path ?? null });
  }, [ex]);

  const pick = async (f?: File) => {
    if (!f) return;
    const isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
    if (!isPdf && !f.type.startsWith('image/')) return toast.error('Sube un archivo PDF o una imagen');
    if (f.size > MAX_MB * 1024 * 1024) return toast.error(`El archivo pesa más de ${MAX_MB} MB`);
    const folder = id ?? 'tmp';
    try {
      if (isPdf) {
        setBusy('Convirtiendo la primera página del PDF…');
        const thumb = await pdfFirstPage(f);
        setBusy('Subiendo archivos…');
        const [img, pdf] = await Promise.all([uploadImage('awards', folder, thumb), uploadPdf('awards', folder, f)]);
        setFiles({ imageUrl: img.url, imagePath: img.path, width: img.width, height: img.height, fileUrl: pdf.url, filePath: pdf.path });
      } else {
        setBusy('Subiendo imagen…');
        const img = await uploadImage('awards', folder, f);
        setFiles({ imageUrl: img.url, imagePath: img.path, width: img.width, height: img.height, fileUrl: null, filePath: null });
      }
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '));
    } catch {
      toast.error('No se pudo procesar el archivo. Si es un PDF, revisa que no esté protegido con contraseña.');
    } finally { setBusy(null); }
  };

  const save = useAdminMutation((p: unknown) => (id ? api(`/admin/awards/${id}`, json('PUT', p)) : api('/admin/awards', json('POST', p))),
    { invalidate: [['admin', 'awards'], ['admin', 'award'], ['awards']], ok: 'Reconocimiento guardado', onDone: () => setTimeout(() => nav('/admin/reconocimientos'), 0) });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = awardInput.safeParse({ title, issuer, year, description, isPublished: published, imageUrl: files?.imageUrl ?? '', imagePath: files?.imagePath ?? '', width: files?.width, height: files?.height, fileUrl: files?.fileUrl, filePath: files?.filePath });
    if (!r.success) return toast.error(r.error.issues[0].message);
    save.mutate(r.data);
  };

  return (
    <form onSubmit={submit} className="grid max-w-5xl gap-6 lg:grid-cols-2">
      <div className="grid content-start gap-5">
        <h1 className="t-h2 text-4xl">{id ? 'Editar reconocimiento' : 'Nuevo reconocimiento'}</h1>
        <div>
          <p className="label">Documento</p>
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); void pick(e.dataTransfer.files[0]); }}
            className={`flex flex-col items-center gap-2 border-2 border-dashed p-6 text-center ${drag ? 'border-oro bg-arena/40' : 'border-tierra/30'}`}>
            {busy ? <Loader2 className="animate-spin" aria-hidden /> : <FileUp aria-hidden />}
            <p>{busy ?? (files ? 'Arrastra otro archivo para reemplazarlo' : 'Arrastra aquí el PDF o la imagen')}</p>
            <button type="button" className="btn btn-soft btn-sm" disabled={!!busy} onClick={() => input.current?.click()}>{files ? 'Cambiar archivo' : 'Elegir archivo'}</button>
            <input ref={input} type="file" accept="application/pdf,.pdf,image/*" hidden onChange={(e) => { void pick(e.target.files?.[0]); e.target.value = ''; }} aria-label="Seleccionar PDF o imagen" />
            <p className="t-small text-tierra">PDF, JPG, PNG o WebP · hasta {MAX_MB} MB. Del PDF se muestra la primera página.</p>
          </div>
        </div>
        <div><label htmlFor="at" className="label">Nombre del reconocimiento</label><input id="at" className="field !bg-crema" maxLength={160} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div><label htmlFor="ai" className="label">Entidad que lo otorga (opcional)</label><input id="ai" className="field !bg-crema" maxLength={160} value={issuer} onChange={(e) => setIssuer(e.target.value)} /></div>
          <div><label htmlFor="ay" className="label">Año (opcional)</label><input id="ay" className="field !bg-crema" maxLength={20} inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} /></div>
        </div>
        <div><label htmlFor="ad" className="label">Descripción (opcional)</label><textarea id="ad" className="field !min-h-[110px] !bg-crema" maxLength={1000} value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        <label className="flex items-center gap-3 bg-crema p-4"><input type="checkbox" className="h-6 w-6 accent-bosque" checked={published} onChange={(e) => setPublished(e.target.checked)} />Mostrar en la página</label>
        <div className="flex gap-3"><button type="submit" className="btn btn-primary" disabled={save.isPending || !!busy}>Guardar</button><Link to="/admin/reconocimientos" className="btn btn-light">Cancelar</Link></div>
      </div>
      <aside aria-label="Vista previa" className="lg:sticky lg:top-6 lg:self-start">
        <p className="label">Así se verá en Reconocimientos</p>
        <figure className="paper max-w-sm">
          <div className="bg-crema p-4">
            {files ? <img src={files.imageUrl} alt="" className="aspect-[4/3] w-full object-contain drop-shadow-md" />
              : <div className="flex aspect-[4/3] items-center justify-center text-tierra"><FileText size={40} aria-hidden /></div>}
          </div>
          <figcaption className="p-5">
            <p className="font-display text-xl font-semibold leading-tight">{title || 'Nombre del reconocimiento'}</p>
            {(issuer || year) && <p className="num mt-1 text-tierra">{[issuer, year].filter(Boolean).join(' · ')}</p>}
            {description && <p className="mt-3">{description}</p>}
            {files?.fileUrl && <a href={files.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-soft btn-sm mt-4"><FileText size={16} aria-hidden /> Ver documento</a>}
          </figcaption>
        </figure>
      </aside>
    </form>
  );
}
