import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json } from '../../hooks/useAdmin';
import { useCatalogs } from '../../hooks/useProducts';
import { slugify } from '../../lib/format';
import { CATALOG_NAME } from '../../store/cart';
import { productInput, type ProductInput } from '../../../shared/schemas';
import ImageList, { type Img } from '../../components/ui/ImageList';
import { toast } from '../../store/toast';
import type { Product } from '../../../shared/types';

const empty = (): ProductInput => ({ catalogSlug: 'snacks', categoryId: null, name: '', slug: '', shortDescription: '', description: '', ingredients: '', allergens: '', unitLabel: 'unidad', priceCop: 0, compareAtPriceCop: null, priceOnRequest: false, minQty: 1, isActive: true, isAvailable: true, isFeatured: false, tags: [], variants: [], images: [] });
const toForm = (p: Product): ProductInput => ({
  catalogSlug: p.catalog_slug, categoryId: p.category_id, name: p.name, slug: p.slug, shortDescription: p.short_description ?? '', description: p.description ?? '', ingredients: p.ingredients ?? '', allergens: p.allergens ?? '',
  unitLabel: p.unit_label, priceCop: p.price_cop, compareAtPriceCop: p.compare_at_price_cop, priceOnRequest: p.price_on_request, minQty: p.min_qty, isActive: p.is_active, isAvailable: p.is_available, isFeatured: p.is_featured, tags: p.tags,
  variants: p.product_variants.map((v) => ({ id: v.id, name: v.name, priceCop: v.price_cop })), images: p.product_images.map((i) => ({ url: i.url, path: i.path, alt: i.alt ?? '' })),
});
const num = (v: string) => (v === '' ? null : Number(v));

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: catalogs } = useCatalogs();
  const { data: existing } = useAdminGet<Product>(['product', id], `/admin/products/${id}`, !!id);
  const [f, setF] = useState<ProductInput>(empty());
  const [slugTouched, setSlugTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [again, setAgain] = useState(false);

  useEffect(() => { if (existing) { setF(toForm(existing)); setSlugTouched(true); setDirty(false); } }, [existing]);
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener('beforeunload', h); return () => window.removeEventListener('beforeunload', h); }, [dirty]);

  const up = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => { setF((s) => ({ ...s, [k]: v })); setDirty(true); };
  const cats = catalogs?.find((c) => c.slug === f.catalogSlug)?.categories ?? [];

  const save = useAdminMutation((payload: ProductInput) => (id ? api(`/admin/products/${id}`, json('PUT', payload)) : api(`/admin/products/`, json('POST', payload))),
    { invalidate: [['admin', 'products'], ['featured'], ['catalog-products']], ok: 'Producto guardado', onDone: () => { setDirty(false); setTimeout(() => (again ? (setF(empty()), setSlugTouched(false), nav('/admin/productos/nuevo')) : nav('/admin/productos')), 0); } });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = productInput.safeParse({ ...f, priceCop: f.priceOnRequest ? null : f.priceCop });
    if (!r.success) {
      const m: Record<string, string> = {}; r.error.issues.forEach((i) => (m[String(i.path[0])] ??= i.message)); setErrors(m);
      toast.error('Revisa los campos marcados'); return;
    }
    setErrors({}); save.mutate(r.data);
  };
  const E = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="err">{errors[k]}</p> : null);
  const sec = 'grid gap-4 bg-crema p-5 md:p-6';

  return (
    <form onSubmit={submit} noValidate className="grid max-w-4xl gap-6">
      <h1 className="t-h2 text-4xl">{id ? 'Editar producto' : 'Nuevo producto'}</h1>

      <fieldset className={sec}><legend className="mb-2 font-display text-2xl">Ubicación</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="pc">Catálogo</label><select id="pc" className="field !bg-papel" value={f.catalogSlug} onChange={(e) => { up('catalogSlug', e.target.value as ProductInput['catalogSlug']); up('categoryId', null); }}>{Object.entries(CATALOG_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
          <div><label className="label" htmlFor="pk">Categoría</label><select id="pk" className="field !bg-papel" value={f.categoryId ?? ''} onChange={(e) => up('categoryId', e.target.value || null)}><option value="">Sin categoría</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        </div>
      </fieldset>

      <fieldset className={sec}><legend className="mb-2 font-display text-2xl">Información</legend>
        <div><label className="label" htmlFor="pn">Nombre</label><input id="pn" className="field !bg-papel" value={f.name} onChange={(e) => { up('name', e.target.value); if (!slugTouched) setF((s) => ({ ...s, name: e.target.value, slug: slugify(e.target.value) })); }} aria-invalid={!!errors.name} /><E k="name" /></div>
        <div><label className="label" htmlFor="ps">Enlace (slug)</label><input id="ps" className="field !bg-papel" value={f.slug} onChange={(e) => { setSlugTouched(true); up('slug', e.target.value); }} aria-invalid={!!errors.slug} /><E k="slug" /></div>
        <div><label className="label" htmlFor="psd">Descripción corta ({(f.shortDescription ?? '').length}/160)</label><input id="psd" maxLength={160} className="field !bg-papel" value={f.shortDescription} onChange={(e) => up('shortDescription', e.target.value)} /></div>
        <div><label className="label" htmlFor="pd">Descripción larga</label><textarea id="pd" className="field !bg-papel" value={f.description} onChange={(e) => up('description', e.target.value)} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="pi">Ingredientes</label><textarea id="pi" className="field !bg-papel" value={f.ingredients} onChange={(e) => up('ingredients', e.target.value)} /></div>
          <div><label className="label" htmlFor="pa">Alérgenos</label><textarea id="pa" className="field !bg-papel" value={f.allergens} onChange={(e) => up('allergens', e.target.value)} /></div>
        </div>
        <div><label className="label" htmlFor="pt">Etiquetas (separadas por coma)</label><input id="pt" className="field !bg-papel" placeholder="nuevo, mas-vendido, sin-azucar, vegano" value={f.tags.join(', ')} onChange={(e) => up('tags', e.target.value.split(',').map((t) => slugify(t)).filter(Boolean))} /></div>
      </fieldset>

      <fieldset className={sec}><legend className="mb-2 font-display text-2xl">Precio</legend>
        <label className="flex items-center gap-3"><input type="checkbox" className="h-6 w-6 accent-bosque" checked={f.priceOnRequest} onChange={(e) => up('priceOnRequest', e.target.checked)} /> Precio a convenir</label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div><label className="label" htmlFor="pp">Precio (COP)</label><input id="pp" type="number" min={0} disabled={f.priceOnRequest} className="field !bg-papel" value={f.priceCop ?? ''} onChange={(e) => up('priceCop', num(e.target.value))} aria-invalid={!!errors.priceCop} /><E k="priceCop" /></div>
          <div><label className="label" htmlFor="pca">Precio anterior (tachado)</label><input id="pca" type="number" min={0} className="field !bg-papel" value={f.compareAtPriceCop ?? ''} onChange={(e) => up('compareAtPriceCop', num(e.target.value))} /></div>
          <div><label className="label" htmlFor="pu">Unidad de venta</label><input id="pu" className="field !bg-papel" value={f.unitLabel} onChange={(e) => up('unitLabel', e.target.value)} /></div>
          <div><label className="label" htmlFor="pm">Cantidad mínima</label><input id="pm" type="number" min={1} className="field !bg-papel" value={f.minQty} onChange={(e) => up('minQty', Math.max(1, Number(e.target.value) || 1))} /></div>
        </div>
      </fieldset>

      <fieldset className={sec}><legend className="mb-2 font-display text-2xl">Presentaciones</legend>
        {f.variants.map((v, i) => (
          <div key={i} className="grid grid-cols-[1fr_140px_auto] items-end gap-2">
            <div><label className="label" htmlFor={`vn${i}`}>Nombre</label><input id={`vn${i}`} className="field !bg-papel" value={v.name} onChange={(e) => up('variants', f.variants.map((x, k) => (k === i ? { ...x, name: e.target.value } : x)))} /></div>
            <div><label className="label" htmlFor={`vp${i}`}>Precio</label><input id={`vp${i}`} type="number" min={0} className="field !bg-papel" value={v.priceCop} onChange={(e) => up('variants', f.variants.map((x, k) => (k === i ? { ...x, priceCop: Number(e.target.value) } : x)))} /></div>
            <button type="button" aria-label="Quitar presentación" onClick={() => up('variants', f.variants.filter((_, k) => k !== i))} className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-papel text-rojo"><Trash2 size={18} /></button>
          </div>
        ))}
        <button type="button" className="btn btn-soft btn-sm justify-self-start" onClick={() => up('variants', [...f.variants, { name: '', priceCop: f.priceCop ?? 0 }])}><Plus size={16} aria-hidden /> Agregar presentación</button>
        <E k="variants" />
      </fieldset>

      <fieldset className={sec}><legend className="mb-2 font-display text-2xl">Imágenes</legend>
        <ImageList bucket="products" folder={id ?? 'tmp'} max={8} withAlt altHint={f.name} value={f.images as Img[]} onChange={(v) => up('images', v as ProductInput['images'])} />
        <p className="t-small">La primera es la portada. Se comprimen a WebP automáticamente.</p>
      </fieldset>

      <fieldset className={sec}><legend className="mb-2 font-display text-2xl">Visibilidad</legend>
        {([['isActive', 'Activo (visible en la tienda)'], ['isAvailable', 'Disponible (desmarca si está agotado)'], ['isFeatured', 'Destacado en el inicio']] as const).map(([k, l]) => (
          <label key={k} className="flex items-center gap-3"><input type="checkbox" className="h-6 w-6 accent-bosque" checked={f[k]} onChange={(e) => up(k, e.target.checked)} /> {l}</label>
        ))}
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary" disabled={save.isPending} onClick={() => setAgain(false)}>Guardar</button>
        <button className="btn btn-soft" disabled={save.isPending} onClick={() => setAgain(true)}>Guardar y crear otro</button>
        {existing && <Link to={`/producto/${f.slug}`} target="_blank" className="btn btn-light">Ver en la tienda</Link>}
        <Link to="/admin/productos" onClick={(e) => { if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) e.preventDefault(); }} className="btn btn-light">Cancelar</Link>
      </div>
    </form>
  );
}
