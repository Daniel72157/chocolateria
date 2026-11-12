import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CheckCircle2 } from 'lucide-react';
import Seo from '../components/ui/Seo';
import Reveal from '../components/ui/Reveal';
import { Input, Textarea } from '../components/ui/Field';
import { api, ApiError } from '../lib/api';
import { PQR_LABEL, PQR_TYPES, pqrInput, type PqrInput } from '../../shared/schemas';

export default function Pqr() {
  const [done, setDone] = useState<string | null>(null);
  const [fail, setFail] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PqrInput>({
    resolver: zodResolver(pqrInput), defaultValues: { type: 'sugerencia', website: '' },
  });
  const onSubmit = handleSubmit(async (v) => {
    setFail(null);
    try {
      const r = await api<{ code: string }>('/pqr', { method: 'POST', body: JSON.stringify(v) });
      setDone(r.code); reset();
    } catch (e) { setFail(e instanceof ApiError ? e.message : 'No pudimos enviar tu mensaje. Intenta de nuevo.'); }
  });
  return (
    <>
      <Seo title="PQR" description="Peticiones, quejas, reclamos, sugerencias y felicitaciones." path="/pqr" />
      <Reveal as="section" className="wrap pb-8 pt-14 md:pt-20">
        <h1 className="t-display text-[clamp(2.6rem,6.5vw,6rem)]">PQR</h1>
        <p className="t-lead mt-5 max-w-[40ch]">Peticiones, quejas, reclamos, sugerencias y felicitaciones. Tu opinión nos ayuda a mejorar.</p>
      </Reveal>
      <section className="wrap pb-24">
        <div className="mx-auto max-w-[680px]">
          {done ? (
            <div role="status" className="paper p-8 text-center">
              <CheckCircle2 className="mx-auto text-bosque" size={44} aria-hidden />
              <h2 className="mt-4 font-display text-2xl">¡Gracias, recibimos tu mensaje!</h2>
              <p className="num mt-2">Tu radicado es <strong>{done}</strong>.</p>
              <button type="button" className="btn btn-soft mt-6" onClick={() => setDone(null)}>Enviar otro mensaje</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="on-dark grid gap-4 bg-bosque p-6 text-papel md:p-10 [&_.err]:text-oro [&_.field]:!border-tierra/30 [&_.field]:!bg-papel [&_.field]:!text-ink [&_.label]:text-papel [&_.t-small]:text-arena">
              <div>
                <label htmlFor="pqr-type" className="label">Tipo de mensaje</label>
                <select id="pqr-type" className="field" {...register('type')}>
                  {PQR_TYPES.map((t) => <option key={t} value={t}>{PQR_LABEL[t]}</option>)}
                </select>
              </div>
              <Input label="Tu nombre" autoComplete="name" error={errors.name?.message} {...register('name')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Celular (opcional)" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
                <Input label="Correo (opcional)" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
              </div>
              <Textarea label="Cuéntanos" rows={6} error={errors.body?.message} {...register('body')} />
              <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register('website')} />
              {fail && <p role="alert" className="err">{fail}</p>}
              <button type="submit" className="btn btn-gold min-h-[56px]" disabled={isSubmitting}>{isSubmitting ? 'Enviando…' : 'Enviar'}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
