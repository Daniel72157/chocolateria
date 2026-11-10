import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import CategoryTabs from '../components/catalog/CategoryTabs';
import ProductGrid from '../components/catalog/ProductGrid';
import { useCatalogProducts, useCatalogs, useSettings } from '../hooks/useProducts';
import { waUrl } from '../lib/format';
import NotFound from './NotFound';

const THEME: Record<string, { bg: string; fg: string }> = {
  oro: { bg: 'bg-oro', fg: 'text-ink' },
  bosque: { bg: 'bg-bosque on-dark', fg: 'text-papel' },
  ink: { bg: 'bg-ink on-dark', fg: 'text-papel' },
};

export default function Catalog() {
  const { catalogSlug = '' } = useParams();
  const { data: catalogs, isLoading: loadingCat } = useCatalogs();
  const { data: settings } = useSettings();
  const [sp, setSp] = useSearchParams();
  const category = sp.get('categoria') ?? '';
  const sort = sp.get('orden') ?? 'destacados';
  const q = sp.get('q') ?? '';
  const [text, setText] = useState(q);
  useEffect(() => { const t = setTimeout(() => { if (text !== q) setParam('q', text); }, 350); return () => clearTimeout(t); }, [text]); // eslint-disable-line
  useEffect(() => setText(q), [catalogSlug]); // eslint-disable-line

  const catalog = catalogs?.find((c) => c.slug === catalogSlug);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCatalogProducts(catalogSlug, { category, q, sort });
  const items = data?.pages.flatMap((p) => p.items) ?? [];

  const setParam = (k: string, v: string) => {
    const n = new URLSearchParams(sp);
    if (v && !(k === 'orden' && v === 'destacados')) n.set(k, v); else n.delete(k);
    setSp(n, { replace: true });
  };

  if (!loadingCat && !catalog) return <NotFound />;
  const th = THEME[catalog?.accent ?? 'oro'];
  const isInst = catalog?.slug === 'industrial';
  const minAll = items.length ? Math.min(...items.filter((p) => p.min_qty > 1).map((p) => p.min_qty)) : 0;

  return (
    <>
      <Seo title={catalog ? `${catalog.name} · Catálogo` : 'Catálogo'} description={catalog?.tagline ?? undefined} path={`/tienda/${catalogSlug}`} image={catalog?.cover_url ?? undefined} />
      <header className={`${th.bg} ${th.fg}`}>
        <div className="wrap grid items-center gap-8 py-12 md:grid-cols-[1.2fr_1fr] md:py-16">
          <Reveal>
            <h1 className={`t-display text-[clamp(2.6rem,6.5vw,6rem)] ${th.fg === 'text-papel' ? 'text-papel' : ''}`}>{catalog?.name ?? ' '}</h1>
            <p className="t-lead mt-4 max-w-[30ch]">{catalog?.tagline}</p>
            <p className="mt-4 max-w-[46ch]">{catalog?.description}</p>
            {isInst && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {Number.isFinite(minAll) && minAll > 0 && <p className="bg-oro px-4 py-2 font-bold text-ink">Pedidos desde {minAll} unidades</p>}
                {settings && <a className="btn btn-gold" target="_blank" rel="noopener noreferrer" href={waUrl(settings.whatsapp_number, 'Hola, quiero solicitar una cotización industrial.')}>Solicitar cotización</a>}
              </div>
            )}
          </Reveal>
          {catalog?.cover_url && <img src={catalog.cover_url} alt="" width={1000} height={1000} className="hidden aspect-square w-full max-w-[420px] justify-self-end object-cover md:block" />}
        </div>
      </header>

      <section aria-label="Productos" className="wrap py-10 md:py-14">
        {catalog && <CategoryTabs categories={catalog.categories} value={category} onChange={(v) => setParam('categoria', v)} />}
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tierra" aria-hidden />
            <label htmlFor="buscar" className="sr-only">Buscar en {catalog?.name}</label>
            <input id="buscar" type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder="Buscar un producto" className="field !bg-papel !pl-12" />
          </div>
          <div>
            <label htmlFor="orden" className="sr-only">Ordenar por</label>
            <select id="orden" value={sort} onChange={(e) => setParam('orden', e.target.value)} className="field !bg-papel">
              <option value="destacados">Destacados</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="nombre">Nombre</option>
            </select>
          </div>
        </div>

        <div className="mt-8" aria-live="polite">
          {!isLoading && items.length === 0 ? (
            <div className="bg-papel p-10 text-center">
              <p className="t-h3 font-display">No encontramos nada con eso.</p>
              <p className="mt-2">Prueba con otra palabra o mira todo el catálogo.</p>
              <button type="button" className="btn btn-primary mt-5" onClick={() => { setText(''); setSp({}, { replace: true }); }}>Ver todo</button>
            </div>
          ) : <ProductGrid items={items} loading={isLoading} />}
        </div>
        {hasNextPage && <div className="mt-10 text-center"><button type="button" disabled={isFetchingNextPage} onClick={() => fetchNextPage()} className="btn btn-soft">{isFetchingNextPage ? 'Cargando…' : 'Ver más productos'}</button></div>}
      </section>
    </>
  );
}
