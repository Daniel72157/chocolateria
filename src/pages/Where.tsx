import { Facebook, Instagram, MapPin, MessageCircle, Phone } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import { useSettings } from '../hooks/useProducts';
import { phonePretty, waUrl } from '../lib/format';

// Ficha de Google Maps: TIENDA ZURYCH (4.6541269, -74.086998)
const MAP_EMBED = 'https://www.google.com/maps?q=TIENDA+ZURYCH&ll=4.6541269,-74.086998&z=17&output=embed';
const MAP_LINK = 'https://maps.app.goo.gl/M36Cb76mi2qKN3Qo6';

export default function Where() {
  const { data: s } = useSettings();
  return (
    <>
      <Seo title="Dónde encontrarnos" description="Dirección, horarios y contacto de la tienda." path="/donde-encontrarnos" />
      <header className="wrap grid items-center gap-8 pb-10 pt-14 md:grid-cols-[1.1fr_1fr] md:pt-20">
        <Reveal>
          <h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Dónde encontrarnos</h1>
          <p className="t-lead mt-5 max-w-[34ch]">Tienda especializada en cacao y chocolate, en el barrio Quirinal de Bogotá, con servicio a la mesa.</p>
          {s && <a className="btn btn-primary mt-8" target="_blank" rel="noopener noreferrer" href={waUrl(s.whatsapp_number, 'Hola, quiero saber cómo llegar a la tienda.')}>Escríbenos por WhatsApp</a>}
        </Reveal>
        <Reveal delay={0.1}><img src="/photos/stand-cafe.webp" alt="Clientes en las mesas de la tienda" width={1600} height={1066} className="aspect-[3/2] w-full object-cover" /></Reveal>
      </header>

      {s && (
        <section aria-labelledby="visita" className="on-dark bg-ink py-14 text-crema md:py-24">
          <div className="wrap grid gap-10 md:grid-cols-2 md:gap-16">
            <Reveal>
              <h2 id="visita" className="t-h2 text-[clamp(2rem,4vw,3.5rem)] text-papel">Ven a vernos</h2>
              <p className="t-lead mt-4 flex items-start gap-3 text-papel"><MapPin className="mt-1 shrink-0 text-oro" aria-hidden /> {s.address}</p>
              <h3 className="mt-8 font-display text-xl text-arena">Horarios</h3>
              {s.opening_hours.length > 0 ? (
                <dl className="num mt-2 grid max-w-md gap-2">
                  {s.opening_hours.map((h) => <div key={h.day} className="flex justify-between gap-6"><dt>{h.day}</dt><dd className="font-display font-semibold text-arena">{h.hours}</dd></div>)}
                </dl>
              ) : <p className="mt-2 text-papel">Consulta los horarios por WhatsApp.</p>}
              {s.email && <p className="mt-6 text-papel">Correo: <a className="underline" href={`mailto:${s.email}`}>{s.email}</a></p>}
              <div className="mt-8 flex flex-wrap gap-3">
                <a className="btn btn-wa" target="_blank" rel="noopener noreferrer" href={waUrl(s.whatsapp_number, 'Hola, tengo una pregunta.')}><MessageCircle size={20} aria-hidden /> WhatsApp</a>
                <a className="btn btn-gold" href={`tel:+${s.whatsapp_number}`}><Phone size={20} aria-hidden /> {phonePretty(s.whatsapp_number)}</a>
                {s.instagram_url && <a className="btn btn-light" href={s.instagram_url} target="_blank" rel="noopener noreferrer"><Instagram size={20} aria-hidden /> Instagram</a>}
                {s.facebook_url && <a className="btn btn-light" href={s.facebook_url} target="_blank" rel="noopener noreferrer"><Facebook size={20} aria-hidden /> Facebook</a>}
              </div>
            </Reveal>
            <Reveal delay={0.1} className="min-h-[320px] bg-bosque">
              <iframe title="Mapa de la tienda" src={s.maps_embed_url || MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen className="h-full min-h-[360px] w-full border-0" />
              <a className="block bg-bosque px-4 py-3 text-papel underline" target="_blank" rel="noopener noreferrer" href={MAP_LINK}>Abrir en Google Maps</a>
            </Reveal>
          </div>
        </section>
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
