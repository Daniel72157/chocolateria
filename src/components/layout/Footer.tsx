import { Link } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { useSettings } from '../../hooks/useProducts';
import { phonePretty } from '../../lib/format';
import SocialLinks, { type Socials } from '../ui/SocialLinks';
import type { OpeningHour } from '../../../shared/types';

function PlaceInfo({ title, address, hours, phone, email, socials }: { title: string; address: string | null; hours: OpeningHour[]; phone: string | null; email: string | null; socials: Socials }) {
  return (
    <div>
      <p className="font-bold">{title}</p>
      {address && <p>{address}</p>}
      {hours.map((h) => <p key={h.day} className="num">{h.day}: {h.hours}</p>)}
      {phone && <p><a className="num underline" href={`tel:+${phone}`}>{phonePretty(phone)}</a></p>}
      {email && <p><a className="underline" href={`mailto:${email}`}>{email}</a></p>}
      <div className="mt-2"><SocialLinks {...socials} label={title} /></div>
    </div>
  );
}

export default function Footer() {
  const { data: s } = useSettings();
  const year = new Date().getFullYear();
  const numbers = s ? ([['Tienda física', s.whatsapp_number], ['Asesoría en la planta', s.plant_whatsapp_number]] as [string, string | null][]).filter(([, n]) => n) as [string, string][] : [];
  return (
    <footer className="bg-oro text-ink">
      <div className="wrap flex min-h-[min(88svh,780px)] flex-col pb-24 pt-10 md:pb-8">
        <div className="grid gap-8 text-base sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:gap-10">
          <div>
            <img src="/brand/logo-sm.webp" alt={s?.store_name ?? 'Chocolate Zurych'} width={420} height={260} className="h-[72px] w-auto" />
            <p className="mt-1 max-w-[30ch]">Chocolate artesanal colombiano. Redescubre el chocolate.</p>
          </div>
          {s && <PlaceInfo title="Punto físico" address={s.address} hours={s.opening_hours} phone={s.whatsapp_number} email={s.email} socials={{ instagram: s.instagram_url, facebook: s.facebook_url, tiktok: s.tiktok_url }} />}
          {s && <PlaceInfo title="Planta de producción" address={s.plant_address} hours={s.plant_opening_hours ?? []} phone={s.plant_whatsapp_number} email={s.plant_email} socials={{ instagram: s.plant_instagram_url, facebook: s.plant_facebook_url, tiktok: s.plant_tiktok_url }} />}
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-start gap-2 font-semibold underline lg:justify-self-end">
            Volver arriba <ArrowUp size={18} aria-hidden />
          </a>
        </div>

        <div className="mt-auto pt-20">
          <p className="mb-4 text-base font-semibold">Escríbenos por WhatsApp o llámanos</p>
          <div className="grid gap-6 md:grid-cols-2 md:gap-12">
            {numbers.map(([label, n]) => (
              <div key={label} className="min-w-0">
                <p className="text-base font-semibold uppercase tracking-wide">{label}</p>
                <a href={`tel:+${n}`} className="num block whitespace-nowrap font-rust font-normal leading-[0.95] tracking-normal hover:underline" style={{ fontSize: 'clamp(1.4rem, 3.2vw, 3.25rem)' }}>
                  {phonePretty(n)}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-3 border-t-2 border-ink/20 pt-6 text-base md:grid-cols-[2fr_1fr]">
          <p className="flex flex-wrap gap-x-5 gap-y-1 font-semibold">
            <Link to="/tienda" className="hover:underline">Tienda virtual</Link>
            <Link to="/donde-encontrarnos" className="hover:underline">Dónde encontrarnos</Link>
            <Link to="/blog" className="hover:underline">Blog</Link>
            <Link to="/reconocimientos" className="hover:underline">Reconocimientos</Link>
            <Link to="/pqr" className="hover:underline">PQR</Link>
            <Link to="/privacidad" className="hover:underline">Privacidad</Link>
          </p>
          <p className="md:text-right">© {year} {s?.store_name}</p>
        </div>
      </div>
    </footer>
  );
}
