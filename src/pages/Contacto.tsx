import { Clock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import { PLANT, SHOP } from '../data/content';

type Place = typeof PLANT;

function Card({ id, title, intro, p, tone, wa }: { id: string; title: string; intro: string; p: Place; tone: string; wa: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className={`${tone} p-8 md:p-12`}>
      <h2 id={`${id}-t`} className="t-h2 text-[clamp(1.8rem,3vw,2.75rem)]">{title}</h2>
      <p className="t-lead mt-4 max-w-[46ch]">{intro}</p>
      <ul className="mt-8 grid gap-4 text-lg">
        <li className="flex items-start gap-3"><Phone className="mt-1 shrink-0" aria-hidden /><a className="num underline" href={`tel:${p.tel}`}>{p.phone}</a></li>
        <li className="flex items-start gap-3"><MapPin className="mt-1 shrink-0" aria-hidden /><span>{p.address}</span></li>
        <li className="flex items-start gap-3"><Clock className="mt-1 shrink-0" aria-hidden /><span className="num">{p.hours.map((h) => <span key={h} className="block">{h}</span>)}</span></li>
      </ul>
      <a className="btn btn-wa mt-8" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${p.tel.slice(1)}?text=${encodeURIComponent(wa)}`}><MessageCircle size={20} aria-hidden /> Escribir por WhatsApp</a>
    </section>
  );
}

export default function Contacto() {
  return (
    <>
      <Seo title="Contacto" description="Contacto de la planta de producción y de la tienda de servicio de Chocolate Zurych." path="/contacto" />
      <Reveal as="section" className="wrap pb-10 pt-14 md:pt-20">
        <h1 className="t-display text-[clamp(2.6rem,6.5vw,6rem)]">Contacto</h1>
        <p className="t-lead mt-5 max-w-[40ch]">Elige el canal que necesitas: cada uno atiende cosas distintas.</p>
      </Reveal>
      <div className="wrap grid gap-6 pb-12 lg:grid-cols-2">
        <Reveal>
          <Card id="planta" tone="bg-bosque text-papel" title="Planta de producción" p={PLANT} wa="Hola, quiero información de la planta de producción."
            intro="Si lo que deseas es una asesoría especializada en cacao, comprar al por mayor, realizar un proceso de maquila o hablar con gerencia, contáctanos." />
        </Reveal>
        <Reveal delay={0.1}>
          <Card id="tienda" tone="bg-oro text-ink" title="Tienda de servicio" p={SHOP} wa="Hola, quiero información de la tienda."
            intro="Si lo que deseas es conocer un punto de servicio especializado en cacao, disfrutar de productos únicos o realizar compras al detal, contáctanos." />
        </Reveal>
      </div>
      <p className="wrap pb-24 text-lg">¿Tienes una queja, un reclamo o quieres felicitarnos? <Link to="/pqr" className="font-semibold underline">Escríbenos en PQR</Link>.</p>
    </>
  );
}
