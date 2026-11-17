import { Facebook, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import { useSettings } from '../hooks/useProducts';
import { mapEmbedUrl, mapLinkUrl, phonePretty, waUrl } from '../lib/format';
import type { OpeningHour, StoreSettings } from '../../shared/types';

type PlaceData = { id: string; title: string; intro?: string; phone: string | null; email: string | null; address: string | null; hours: OpeningHour[]; waText: string; tone: string };

/** Tarjeta de un lugar (punto físico o planta): datos a la izquierda, mapa ubicado por la dirección a la derecha. */
function Place({ p, s }: { p: PlaceData; s: StoreSettings }) {
  return (
    <section id={p.id} aria-labelledby={`${p.id}-t`} className={`on-dark scroll-mt-20 py-14 text-crema md:py-24 ${p.tone}`}>
      <div className="wrap grid gap-10 md:grid-cols-2 md:gap-16">
        <Reveal>
          <h2 id={`${p.id}-t`} className="t-h2 text-[clamp(2rem,4vw,3.5rem)] text-papel">{p.title}</h2>
          {p.intro && <p className="t-lead mt-4 max-w-[46ch] text-papel">{p.intro}</p>}
          {p.address && <p className="t-lead mt-6 flex items-start gap-3 text-papel"><MapPin className="mt-1 shrink-0 text-oro" aria-hidden /> {p.address}</p>}
          <h3 className="mt-8 font-display text-xl text-arena">Horarios</h3>
          {p.hours.length > 0 ? (
            <dl className="num mt-2 grid max-w-md gap-2">
              {p.hours.map((h) => <div key={h.day} className="flex justify-between gap-6"><dt>{h.day}</dt><dd className="font-display font-semibold text-arena">{h.hours}</dd></div>)}
            </dl>
          ) : <p className="mt-2 text-papel">Consulta los horarios por WhatsApp.</p>}
          {p.email && <p className="mt-6 text-papel">Correo: <a className="underline" href={`mailto:${p.email}`}>{p.email}</a></p>}
          <div className="mt-8 flex flex-wrap gap-3">
            {p.phone && <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waUrl(p.phone, p.waText)}><MessageCircle size={20} aria-hidden /> WhatsApp</a>}
            {p.phone && <a className="btn btn-gold" href={`tel:+${p.phone}`}><Phone size={20} aria-hidden /> {phonePretty(p.phone)}</a>}
            {s.instagram_url && <a className="btn btn-light" href={s.instagram_url} target="_blank" rel="noopener noreferrer"><Instagram size={20} aria-hidden /> Instagram</a>}
            {s.facebook_url && <a className="btn btn-light" href={s.facebook_url} target="_blank" rel="noopener noreferrer"><Facebook size={20} aria-hidden /> Facebook</a>}
          </div>
        </Reveal>
        {p.address && (
          <Reveal delay={0.1} className="flex min-h-[320px] flex-col bg-ink/40">
            <iframe title={`Mapa: ${p.title}`} src={mapEmbedUrl(p.address)} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="min-h-[360px] w-full flex-1 border-0" />
            <a className="block bg-ink px-4 py-3 text-papel underline" target="_blank" rel="noopener noreferrer" href={mapLinkUrl(p.address)}>Abrir en Google Maps</a>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default function Where() {
  const { data: s } = useSettings();
  return (
    <>
      <Seo title="Dónde encontrarnos" description="Dirección, horarios y contacto del punto físico y de la planta de producción." path="/donde-encontrarnos" />
      <header className="wrap grid items-center gap-8 pb-10 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <Reveal>
          <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Dónde encontrarnos</h1>
          <p className="t-lead mt-5 max-w-[34ch]">Tienda especializada en cacao y chocolate, en el barrio Quirinal de Bogotá, con servicio a la mesa.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a className="btn btn-primary" href="#punto-fisico">Punto físico</a>
            <a className="btn btn-soft" href="#planta">Planta de producción</a>
          </div>
        </Reveal>
        <Reveal delay={0.1}><img src="/photos/stand-cafe.webp" alt="Clientes en las mesas de la tienda" width={1600} height={1066} className="aspect-[3/2] w-full object-cover" /></Reveal>
      </header>

      {s && (
        <>
          <Place s={s} p={{
            id: 'punto-fisico', title: 'Punto físico', tone: 'bg-ink',
            intro: 'Si lo que deseas es conocer un punto de servicio especializado en cacao, disfrutar de productos únicos o realizar compras al detal, contáctanos.',
            phone: s.whatsapp_number, email: s.email, address: s.address, hours: s.opening_hours, waText: 'Hola, tengo una pregunta sobre la tienda.',
          }} />
          <Place s={s} p={{
            id: 'planta', title: 'Planta de producción', tone: 'bg-bosque',
            intro: 'Si lo que deseas es una asesoría especializada en cacao, comprar al por mayor, realizar un proceso de maquila o hablar con gerencia, contáctanos.',
            phone: s.plant_whatsapp_number, email: s.plant_email, address: s.plant_address, hours: s.plant_opening_hours ?? [], waText: 'Hola, quiero una asesoría con la planta de producción.',
          }} />
        </>
      )}

      <section aria-labelledby="zona" className="wrap py-14 md:py-24">
        <Reveal><h2 id="zona" className="t-h2 text-[clamp(1.9rem,3.4vw,3rem)]">Una historia que comienza en la tierra</h2></Reveal>
        <ul className="mt-8 grid gap-3 md:grid-cols-3">
          {[['casa-montana', 'La casa', 1156, 671], ['iglesia', 'La iglesia', 1600, 1056], ['montana', 'La montaña', 1600, 844]].map(([img, name, w, h], i) => (
            <Reveal as="li" key={img as string} delay={i * 0.08}><figure><img src={`/photos/${img}.webp`} alt={name as string} width={w as number} height={h as number} loading="lazy" className="aspect-[4/3] w-full object-cover" /><figcaption className="bg-bosque p-3 text-papel">{name}</figcaption></figure></Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
