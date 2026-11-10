import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCatalogs, useSettings } from '../../hooks/useProducts';
import { waUrl } from '../../lib/format';
import Skeleton from '../../components/ui/Skeleton';

/** Los tres catálogos como una placa cuadrada y tres pestañas; cada pestaña cambia la placa. */
export default function Showcase() {
  const { data: catalogs } = useCatalogs();
  const { data: s } = useSettings();
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const c = catalogs?.[active];
  return (
    <section id="tienda" aria-labelledby="catalogos-title" className="bg-arena">
      <div className="grid min-h-[88svh] md:grid-cols-2">
        <div className="p-5 md:p-10">
          <div className="relative mx-auto aspect-square w-full max-w-[720px] overflow-hidden bg-arena">
            {c ? (
              <AnimatePresence mode="wait">
                <motion.img key={c.slug} src={c.cover_url ?? ''} alt={`Foto de la categoría ${c.name}`} width={1000} height={1000}
                  initial={reduce ? false : { opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0 }} transition={{ duration: 0.35 }}
                  className="absolute inset-0 h-full w-full object-cover object-[50%_20%]" />
              </AnimatePresence>
            ) : <Skeleton className="h-full w-full" />}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-12 px-6 pb-10 pt-4 md:px-12 md:py-14">
          <div role="tablist" aria-label="Categorías de la tienda virtual" className="flex flex-wrap gap-x-8 gap-y-2 text-lg">
            {catalogs?.map((k, i) => (
              <button key={k.slug} role="tab" type="button" aria-selected={i === active} onClick={() => setActive(i)}
                className={`rounded-full py-2 font-semibold transition ${i === active ? 'text-ink underline decoration-oro decoration-[3px] underline-offset-[10px]' : 'text-tierra hover:text-ink'}`}>
                {k.name}
              </button>
            ))}
          </div>

          <div role="tabpanel" aria-live="polite">
            <h2 id="catalogos-title" className="t-h2">{c?.name ?? 'Tienda virtual'}</h2>
            <p className="t-lead mt-3 text-bosque">{c?.tagline}</p>
            <p className="mt-6 max-w-[34ch]">{c?.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link to={c ? `/tienda/${c.slug}` : '/tienda'} className="btn btn-primary min-h-[64px]">Entrar a {c?.name ?? 'la tienda'}</Link>
            {s && <a href={waUrl(s.whatsapp_number, `Hola, me interesa la categoría ${c?.name ?? ''}.`)} target="_blank" rel="noopener noreferrer" className="btn btn-paper min-h-[64px]">Preguntar por WhatsApp</a>}
          </div>
        </div>
      </div>
    </section>
  );
}
