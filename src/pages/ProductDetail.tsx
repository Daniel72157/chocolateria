import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import ProductCard from '../components/catalog/ProductCard';
import { useProduct, useSettings } from '../hooks/useProducts';
import { cop, TAG_LABEL, waUrl } from '../lib/format';
import { toCartItem } from '../lib/cart-helpers';
import { CATALOG_NAME, useCart } from '../store/cart';
import { toast } from '../store/toast';
import NotFound from './NotFound';

export default function ProductDetail() {
  const { slug } = useParams();
  const { data: p, isLoading, isError } = useProduct(slug);
  const { data: settings } = useSettings();
  const add = useCart((s) => s.add);
  const [img, setImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [variantId, setVariantId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => { if (p) { setVariantId(p.product_variants[0]?.id ?? null); setQty(p.min_qty); setImg(0); } }, [p?.id]); // eslint-disable-line

  if (isError) return <NotFound />;
  if (isLoading || !p) {
    return <div className="wrap grid gap-10 py-12 md:grid-cols-2"><Skeleton className="aspect-[4/5]" /><div className="grid content-start gap-4"><Skeleton className="h-14 w-3/4" /><Skeleton className="h-8 w-1/3" /><Skeleton className="h-40" /></div></div>;
  }

  const variant = p.product_variants.find((v) => v.id === variantId);
  const price = p.price_on_request ? null : (variant?.price_cop ?? p.price_cop);
  const images = p.product_images;
  const tags = p.tags.filter((t) => TAG_LABEL[t]);
  const onAdd = () => {
    add(toCartItem(p, variantId), qty);
    toast.ok(`${p.name} agregado`, { label: 'Ver carrito', to: '/carrito' });
  };
  const quote = settings && waUrl(settings.whatsapp_number, `Hola, quiero cotizar: ${p.name} (${qty} ${p.unit_label}).`);

  return (
    <>
      <Seo
        title={p.name} description={p.short_description ?? undefined} path={`/producto/${p.slug}`} image={images[0]?.url}
        jsonLd={{ '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.short_description, image: images.map((i) => i.url),
          ...(price !== null && { offers: { '@type': 'Offer', priceCurrency: 'COP', price, availability: p.is_available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } }) }}
      />
      <div className="wrap pt-8 text-base">
        <nav aria-label="Ruta"><Link to="/tienda" className="underline">Catálogos</Link> / <Link to={`/tienda/${p.catalog_slug}`} className="underline">{CATALOG_NAME[p.catalog_slug]}</Link></nav>
      </div>

      <div className="wrap grid gap-10 py-8 md:grid-cols-2 md:gap-14 md:py-12">
        <Reveal>
          <button type="button" onClick={() => setZoom(true)} aria-label="Ampliar imagen" className="hover-zoom block aspect-[4/3] w-full cursor-zoom-in md:aspect-[4/5] overflow-hidden bg-arena">
            {images[img] && <img src={images[img].url} alt={images[img].alt ?? p.name} width={1000} height={1250} className="h-full w-full object-cover" />}
          </button>
          {images.length > 1 && (
            <ul className="mt-3 flex gap-2">
              {images.map((im, i) => (
                <li key={im.url}><button type="button" onClick={() => setImg(i)} aria-label={`Ver imagen ${i + 1}`} aria-current={i === img} className={`h-20 w-16 overflow-hidden transition ${i === img ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}><img src={im.url} alt="" width={64} height={80} className="h-full w-full object-cover" /></button></li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mb-3 flex flex-wrap gap-2">
            {!p.is_available && <Badge tone="red">Agotado</Badge>}
            {p.min_qty > 1 && <Badge tone="dark">Mínimo {p.min_qty} unidades</Badge>}
            {tags.map((t) => <Badge key={t} tone={t === 'sin-azucar' || t === 'vegano' ? 'sage' : 'gold'}>{TAG_LABEL[t]}</Badge>)}
          </div>
          <h1 className="text-[clamp(2.2rem,4.6vw,4rem)]">{p.name}</h1>
          <p className="num mt-4 flex items-baseline gap-3 text-3xl font-bold text-bosque">
            {price === null ? 'Precio a convenir' : cop(price)}
            {p.compare_at_price_cop && price !== null && <s className="text-lg font-semibold text-tierra">{cop(p.compare_at_price_cop)}</s>}
            <span className="text-base font-semibold text-tierra">/ {variant?.name ?? p.unit_label}</span>
          </p>
          <p className="mt-5 max-w-[54ch]">{p.description ?? p.short_description}</p>

          {p.product_variants.length > 0 && (
            <fieldset className="mt-6">
              <legend className="label">Presentación</legend>
              <div className="flex flex-wrap gap-2">
                {p.product_variants.map((v) => (
                  <label key={v.id} className={`cursor-pointer rounded-full px-5 py-3 font-semibold transition has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-oro ${v.id === variantId ? 'bg-bosque text-papel' : 'bg-papel hover:bg-arena'}`}>
                    <input type="radio" name="variant" className="sr-only" checked={v.id === variantId} onChange={() => setVariantId(v.id)} />
                    {v.name} · <span className="num">{cop(v.price_cop)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 bg-papel p-1" role="group" aria-label="Cantidad">
              <button type="button" aria-label="Menos" disabled={qty <= p.min_qty} onClick={() => setQty(Math.max(p.min_qty, qty - 1))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-arena disabled:opacity-40"><Minus size={18} /></button>
              <span className="num w-14 text-center text-lg font-bold" aria-live="polite">{qty}</span>
              <button type="button" aria-label="Más" onClick={() => setQty(Math.min(5000, qty + 1))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-arena"><Plus size={18} /></button>
            </div>
            <button type="button" disabled={!p.is_available} onClick={onAdd} className="btn btn-primary min-h-[56px] flex-1 sm:flex-none sm:px-10">{p.is_available ? 'Agregar al pedido' : 'Agotado por ahora'}</button>
          </div>
          {p.min_qty > 1 && <p className="t-small mt-2">Este producto se vende desde {p.min_qty} unidades.</p>}
          {p.price_on_request && quote && <a href={quote} target="_blank" rel="noopener noreferrer" className="btn btn-soft mt-4">Solicitar cotización por WhatsApp</a>}
          {price !== null && <p className="num mt-4 text-base">Total de esta selección: <strong>{cop(price * qty)}</strong></p>}

          <div className="mt-8 grid gap-2">
            {p.ingredients && <details className="group bg-papel p-4"><summary className="cursor-pointer font-bold">Ingredientes</summary><p className="mt-2">{p.ingredients}</p></details>}
            {p.allergens && <details className="group bg-papel p-4"><summary className="cursor-pointer font-bold">Alérgenos</summary><p className="mt-2">{p.allergens}</p></details>}
          </div>
        </Reveal>
      </div>

      {p.related.length > 0 && (
        <Reveal as="section" className="wrap pb-20 pt-6">
          <h2 id="rel" className="t-h3 mb-6 font-display text-3xl">También te puede gustar</h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">{p.related.map((r) => <li key={r.id}><ProductCard p={r} /></li>)}</ul>
        </Reveal>
      )}

      <Modal open={zoom} onClose={() => setZoom(false)} label="Imagen ampliada" className="!max-w-3xl p-4">
        {images[img] && <img src={images[img].url} alt={images[img].alt ?? p.name} width={1000} height={1250} className="mx-auto max-h-[88vh] w-auto object-contain" />}
      </Modal>
    </>
  );
}
