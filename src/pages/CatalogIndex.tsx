import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import Skeleton from '../components/ui/Skeleton';
import { useCatalogs } from '../hooks/useProducts';

const BAND: Record<string, { bg: string; fg: string; btn: string; h: string }> = {
  oro: { bg: 'bg-oro', fg: 'text-ink', btn: 'btn-primary', h: '' },
  bosque: { bg: 'bg-bosque on-dark', fg: 'text-papel', btn: 'btn-gold', h: 'text-papel' },
  ink: { bg: 'bg-ink on-dark', fg: 'text-papel', btn: 'btn-gold', h: 'text-papel' },
};

export default function CatalogIndex() {
  const { data } = useCatalogs();
  return (
    <>
      <Seo title="Tienda virtual" description="Canasta familiar, snacks e industrial: elige la categoría que necesitas." path="/tienda" />
      <header className="wrap grid items-center gap-8 pb-10 pt-14 md:grid-cols-[1.2fr_1fr] md:pt-20">
        <Reveal>
          <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Tienda virtual</h1>
          <p className="t-lead mt-5 max-w-[36ch]">Elige tu categoría y envía el pedido por WhatsApp. Los precios y presentaciones se coordinan por chat.</p>
          <a href="#categorias" className="btn btn-primary mt-8">Ver categorías</a>
        </Reveal>
        <Reveal delay={0.1}><img src="/photos/mujer-desayuno.webp" alt="Mujer desayunando en la cafetería" width={1066} height={1600} className="aspect-[4/3] w-full object-cover object-[50%_30%]" /></Reveal>
      </header>
      <div id="categorias" />
      {!data && <div className="wrap pb-20"><Skeleton className="h-80" /></div>}
      {data?.map((c, i) => {
        const b = BAND[c.accent] ?? BAND.oro;
        return (
          <section key={c.slug} aria-labelledby={`cat-${c.slug}`} className={`${b.bg} ${b.fg}`}>
            <div className="wrap grid items-center gap-8 py-14 md:grid-cols-2 md:gap-16 md:py-20">
              <Reveal className={i % 2 ? 'md:order-2' : ''}>
                <h2 id={`cat-${c.slug}`} className={`t-h2 text-[clamp(2.4rem,5.5vw,5rem)] ${b.h}`}>{c.name}</h2>
                <p className="t-lead mt-4 max-w-[28ch]">{c.tagline}</p>
                <p className="mt-4 max-w-[40ch]">{c.description}</p>
                <Link to={`/tienda/${c.slug}`} className={`btn mt-8 ${b.btn}`}>Entrar a {c.name}</Link>
              </Reveal>
              <Reveal delay={0.1}>
                <img src={c.cover_url ?? ''} alt={`Foto de la categoría ${c.name}`} width={1000} height={1000} loading="lazy" className="mx-auto aspect-square w-full max-w-[520px] object-cover" />
              </Reveal>
            </div>
          </section>
        );
      })}
    </>
  );
}
