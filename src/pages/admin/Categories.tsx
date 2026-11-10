import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { useCatalogs } from '../../hooks/useProducts';
import { slugify } from '../../lib/format';
import ImageList from '../../components/ui/ImageList';
import type { Catalog, Category } from '../../../shared/types';

function CatalogColumn({ c }: { c: Catalog }) {
  const inv = [['catalogs'], ['admin', 'products']];
  const [name, setName] = useState('');
  const [edit, setEdit] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [meta, setMeta] = useState({ name: c.name, tagline: c.tagline ?? '', description: c.description ?? '', coverUrl: c.cover_url ?? '' });
  const body = (k: Category, over: Partial<{ name: string; slug: string; sortOrder: number }> = {}) => ({ catalogSlug: c.slug, name: over.name ?? k.name, slug: over.slug ?? k.slug, sortOrder: over.sortOrder ?? k.sort_order });
  const create = useAdminMutation(() => api('/admin/categories', json('POST', { catalogSlug: c.slug, name, slug: slugify(name), sortOrder: c.categories.length })), { invalidate: inv, ok: 'Categoría creada', onDone: () => setName('') });
  const rename = useAdminMutation((k: Category) => api(`/admin/categories/${k.id}`, json('PUT', body(k, { name: editName, slug: slugify(editName) }))), { invalidate: inv, ok: 'Renombrada', onDone: () => setEdit(null) });
  const swap = useAdminMutation(async ([a, b]: [Category, Category]) => { await api(`/admin/categories/${a.id}`, json('PUT', body(a, { sortOrder: b.sort_order }))); await api(`/admin/categories/${b.id}`, json('PUT', body(b, { sortOrder: a.sort_order }))); }, { invalidate: inv });
  const del = useAdminMutation((id: string) => api(`/admin/categories/${id}`, json('DELETE')), { invalidate: inv, ok: 'Categoría eliminada' });
  const saveMeta = useAdminMutation(() => api(`/admin/catalogs/${c.slug}`, json('PUT', { name: meta.name, tagline: meta.tagline, description: meta.description, coverUrl: meta.coverUrl || null })), { invalidate: inv, ok: 'Catálogo guardado' });

  return (
    <section aria-labelledby={`k-${c.slug}`} className="grid content-start gap-5 bg-crema p-5">
      <h2 id={`k-${c.slug}`} className="font-display text-2xl">{c.name}</h2>
      <ul className="grid gap-2">
        {c.categories.map((k, i) => (
          <li key={k.id} className="flex items-center gap-2 bg-papel p-2">
            {edit === k.id ? (
              <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); rename.mutate(k); }}><input aria-label="Nuevo nombre" autoFocus className="field !min-h-[40px]" value={editName} onChange={(e) => setEditName(e.target.value)} /><button className="btn btn-primary btn-sm">Guardar</button></form>
            ) : <span className="flex-1 pl-2 font-semibold">{k.name}</span>}
            <button type="button" aria-label={`Subir ${k.name}`} disabled={i === 0} onClick={() => swap.mutate([k, c.categories[i - 1]])} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-arena disabled:opacity-30"><ArrowUp size={16} /></button>
            <button type="button" aria-label={`Bajar ${k.name}`} disabled={i === c.categories.length - 1} onClick={() => swap.mutate([k, c.categories[i + 1]])} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-arena disabled:opacity-30"><ArrowDown size={16} /></button>
            <button type="button" aria-label={`Renombrar ${k.name}`} onClick={() => { setEdit(k.id); setEditName(k.name); }} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-arena"><Pencil size={16} /></button>
            <button type="button" aria-label={`Eliminar ${k.name}`} onClick={() => confirmDelete(`la categoría «${k.name}» (sus productos quedarán sin categoría)`) && del.mutate(k.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-rojo hover:bg-arena"><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim().length >= 2) create.mutate(); }}>
        <label className="sr-only" htmlFor={`n-${c.slug}`}>Nueva categoría en {c.name}</label>
        <input id={`n-${c.slug}`} className="field !bg-papel" placeholder="Nueva categoría" value={name} onChange={(e) => setName(e.target.value)} /><button className="btn btn-primary">Crear</button>
      </form>

      <details className="bg-papel p-4"><summary className="cursor-pointer font-bold">Portada y textos del catálogo</summary>
        <div className="mt-4 grid gap-3">
          <div><label className="label" htmlFor={`cn-${c.slug}`}>Nombre</label><input id={`cn-${c.slug}`} className="field" value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} /></div>
          <div><label className="label" htmlFor={`ct-${c.slug}`}>Frase</label><input id={`ct-${c.slug}`} className="field" value={meta.tagline} onChange={(e) => setMeta({ ...meta, tagline: e.target.value })} /></div>
          <div><label className="label" htmlFor={`cd-${c.slug}`}>Descripción</label><textarea id={`cd-${c.slug}`} className="field" value={meta.description} onChange={(e) => setMeta({ ...meta, description: e.target.value })} /></div>
          <ImageList bucket="catalogs" folder={c.slug} max={1} value={meta.coverUrl ? [{ url: meta.coverUrl, path: meta.coverUrl }] : []} onChange={(v) => setMeta({ ...meta, coverUrl: v[0]?.url ?? '' })} />
          <button type="button" className="btn btn-primary" onClick={() => saveMeta.mutate()}>Guardar catálogo</button>
        </div>
      </details>
    </section>
  );
}

export default function Categories() {
  const { data } = useCatalogs();
  return (
    <>
      <h1 className="t-h2 text-4xl">Categorías</h1>
      <p className="mt-2">Una columna por catálogo. Usa las flechas para ordenar.</p>
      <div className="mt-6 grid gap-5 xl:grid-cols-3">{data?.map((c) => <CatalogColumn key={`${c.slug}-${c.categories.length}`} c={c} />)}</div>
    </>
  );
}
