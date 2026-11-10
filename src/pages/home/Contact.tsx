import { useState } from 'react';
import { useSettings } from '../../hooks/useProducts';
import { waUrl } from '../../lib/format';
import Reveal from '../../components/ui/Reveal';

/** Cupón para recortar: el formulario abre WhatsApp con el mensaje ya escrito (no hay servidor de por medio). */
export default function Contact() {
  const { data: s } = useSettings();
  const [name, setName] = useState('');
  const [when, setWhen] = useState('');
  const [what, setWhat] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!s) return;
    const text = [`Hola, soy ${name || 'un cliente'}.`, what && `Me gustaría: ${what}`, when && `Lo necesito para: ${when}`].filter(Boolean).join('\n');
    window.open(waUrl(s.whatsapp_number, text), '_blank', 'noopener');
  };
  return (
    <section aria-labelledby="contacto-title" className="bg-crema pb-[clamp(72px,12vw,160px)]">
      <div className="wrap">
        <Reveal className="relative mx-auto max-w-[1100px] bg-bosque text-papel">
          <span aria-hidden className="absolute -top-3.5 left-0 hidden h-7 w-7 -translate-x-1/2 rounded-full bg-crema lg:left-[46%] lg:block" />
          <span aria-hidden className="absolute -bottom-3.5 left-0 hidden h-7 w-7 -translate-x-1/2 rounded-full bg-crema lg:left-[46%] lg:block" />
          <div className="grid lg:grid-cols-[46fr_54fr]">
            <div className="flex flex-col justify-between gap-10 p-8 lg:p-12">
              <h2 id="contacto-title" className="text-[clamp(1.9rem,3vw,2.75rem)] leading-[1.02] text-papel">Escríbenos por WhatsApp</h2>
              <div>
                <p>Cuéntanos qué necesitas y te respondemos por WhatsApp. También atendemos pedidos de empresas.</p>
                {s && (
                  <p className="num mt-6 text-base text-arena">
                    {s.opening_hours.map((h) => <span key={h.day} className="block">{h.day}: {h.hours}</span>)}
                    <span className="block">{s.address}</span>
                    {s.email && <span className="block">{s.email}</span>}
                  </p>
                )}
              </div>
            </div>
            <form onSubmit={submit} className="grid gap-2.5 border-t-[5px] border-dotted border-crema p-8 lg:border-l-[5px] lg:border-t-0 lg:p-12">
              <label className="sr-only" htmlFor="c-name">Tu nombre</label>
              <input id="c-name" className="field !bg-tierra !text-papel placeholder:!text-crema" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
              <label className="sr-only" htmlFor="c-when">¿Para cuándo lo necesitas?</label>
              <input id="c-when" className="field !bg-tierra !text-papel placeholder:!text-crema" placeholder="¿Para cuándo lo necesitas?" value={when} onChange={(e) => setWhen(e.target.value)} />
              <label className="sr-only" htmlFor="c-what">¿Qué se te antoja?</label>
              <textarea id="c-what" className="field !min-h-[120px] !bg-tierra !text-papel placeholder:!text-crema" placeholder="¿Qué se te antoja?" value={what} onChange={(e) => setWhat(e.target.value)} />
              <button type="submit" className="btn min-h-[56px] bg-ink text-papel hover:bg-oro hover:text-ink">Abrir WhatsApp con mi mensaje</button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
