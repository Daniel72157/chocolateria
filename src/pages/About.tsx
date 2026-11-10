import { Facebook, Instagram, MessageCircle, Phone } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import { useAbout, useSettings } from '../hooks/useProducts';
import { phonePretty, waUrl } from '../lib/format';

export default function About() {
  const { data: blocks } = useAbout();
  const { data: s } = useSettings();
  return (
    <>
      <Seo title="Nosotros" description="Nuestra historia, el proceso artesanal, horarios y ubicación." path="/nosotros" />
      <header className="wrap grid items-center gap-8 pb-10 pt-14 md:grid-cols-[1.3fr_1fr] md:pt-20">
        <Reveal>
          <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Chocolate hecho a la vista</h1>
          <p className="t-lead mt-5 max-w-[36ch]">Un taller, una barra y mucha paciencia. Así hacemos {s ? `en ${s.store_name}` : 'cada lote'}.</p>
        </Reveal>
        <Reveal delay={0.1}><img src="/art/cacaopolvo.webp" alt="Ilustración de una lata de cacao en polvo" width={800} height={1000} className="aspect-square w-full max-w-[420px] object-cover md:justify-self-end" /></Reveal>
      </header>

      {blocks?.map((b, i) => (
        <section key={b.id} aria-labelledby={`b-${b.id}`} className={i % 2 === 0 ? 'bg-crema-100' : 'bg-caramelo-300'}>
          <div className="wrap grid items-center gap-8 py-12 md:grid-cols-2 md:gap-16 md:py-20">
            <Reveal className={i % 2 ? 'md:order-2' : ''}>
              <h2 id={`b-${b.id}`} className="t-h2 text-[clamp(1.9rem,3.6vw,3rem)]">{b.title}</h2>
              <div className="mt-5 grid max-w-[52ch] gap-4">{b.body.split('\n').map((l, k) => <p key={k}>{l}</p>)}</div>
            </Reveal>
            {b.image_url && <Reveal delay={0.1}><img src={b.image_url} alt={`Ilustración: ${b.title}`} width={1000} height={1250} loading="lazy" className="mx-auto aspect-[4/5] w-full max-w-[460px] object-cover" /></Reveal>}
          </div>
        </section>
      ))}

      {s && (
        <section aria-labelledby="visita" className="on-dark bg-cacao-950 py-14 text-crema-100 md:py-24">
          <div className="wrap grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 id="visita" className="t-h2 text-[clamp(2rem,4vw,3.5rem)] text-crema-50">Ven a vernos</h2>
              <p className="t-lead mt-4">{s.address}</p>
              <dl className="num mt-6 grid max-w-sm gap-2">
                {s.opening_hours.map((h) => <div key={h.day} className="flex justify-between gap-6"><dt>{h.day}</dt><dd className="font-bold text-caramelo-300">{h.hours}</dd></div>)}
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waUrl(s.whatsapp_number, 'Hola, tengo una pregunta.')}><MessageCircle size={20} aria-hidden /> WhatsApp</a>
                <a className="btn btn-gold" href={`tel:+${s.whatsapp_number}`}><Phone size={20} aria-hidden /> {phonePretty(s.whatsapp_number)}</a>
                {s.instagram_url && <a className="btn btn-light" href={s.instagram_url} target="_blank" rel="noopener noreferrer"><Instagram size={20} aria-hidden /> Instagram</a>}
                {s.facebook_url && <a className="btn btn-light" href={s.facebook_url} target="_blank" rel="noopener noreferrer"><Facebook size={20} aria-hidden /> Facebook</a>}
              </div>
            </div>
            <div className="min-h-[300px] bg-cacao-800">
              {s.maps_embed_url ? <iframe title="Mapa de la tienda" src={s.maps_embed_url} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-full min-h-[320px] w-full" />
                : <p className="flex h-full min-h-[300px] items-center p-8 t-lead">{s.address}</p>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
