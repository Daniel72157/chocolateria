import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Seo from '../components/ui/Seo';
import { Input, Textarea } from '../components/ui/Field';
import { api, ApiError } from '../lib/api';
import { cop } from '../lib/format';
import { phoneCO } from '../../shared/schemas';
import { cartSubtotal, groupByCatalog, hasOnRequest, useCart } from '../store/cart';
import { useSettings } from '../hooks/useProducts';
import { toast } from '../store/toast';

const buildSchema = (institutional: boolean) =>
  z.object({
    name: z.string().trim().min(3, 'Escribe tu nombre completo').max(80),
    phone: phoneCO,
    email: z.string().email('Correo inválido').optional().or(z.literal('')),
    document: z.string().trim().max(20).optional(),
    companyName: z.string().trim().max(120).optional(),
    method: z.enum(['domicilio', 'recoger_en_tienda']),
    address: z.string().trim().max(160).optional(),
    neighborhood: z.string().trim().max(80).optional(),
    city: z.string().trim().max(60).optional(),
    preferredDate: z.string().optional(),
    paymentMethod: z.enum(['efectivo', 'transferencia', 'otro']),
    notes: z.string().trim().max(500, 'Máximo 500 caracteres').optional(),
    accept: z.boolean().refine((v) => v, 'Debes aceptar el tratamiento de datos para continuar'),
    website: z.string().max(0).optional(),
  }).superRefine((v, ctx) => {
    if (v.method === 'domicilio') {
      if ((v.address ?? '').length < 5) ctx.addIssue({ code: 'custom', path: ['address'], message: 'Escribe la dirección' });
      if ((v.neighborhood ?? '').length < 2) ctx.addIssue({ code: 'custom', path: ['neighborhood'], message: 'Escribe el barrio' });
      if ((v.city ?? '').length < 2) ctx.addIssue({ code: 'custom', path: ['city'], message: 'Escribe la ciudad' });
    }
    if (institutional && !v.document) ctx.addIssue({ code: 'custom', path: ['document'], message: 'La cédula o NIT es obligatoria en pedidos industriales' });
    if (institutional && !v.companyName) ctx.addIssue({ code: 'custom', path: ['companyName'], message: 'Escribe el nombre de la empresa' });
  });
type Form = z.infer<ReturnType<typeof buildSchema>>;

export default function Checkout() {
  const { items, clear } = useCart();
  const { data: s } = useSettings();
  const navigate = useNavigate();
  const institutional = items.some((i) => i.catalogSlug === 'industrial');
  const schema = useMemo(() => buildSchema(institutional), [institutional]);
  const today = new Date().toLocaleDateString('en-CA');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { method: 'domicilio', paymentMethod: 'transferencia', accept: false, website: '' },
  });
  const method = watch('method');

  const subtotal = cartSubtotal(items);
  const fee = method === 'domicilio' && s ? (s.free_delivery_from != null && subtotal >= s.free_delivery_from ? 0 : s.delivery_fee) : 0;

  const onSubmit = async (f: Form) => {
    try {
      const res = await api<{ code: string; whatsappUrl: string }>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer: { name: f.name, phone: f.phone, email: f.email || '', document: f.document || undefined, companyName: f.companyName || undefined },
          delivery: f.method === 'domicilio' ? { method: 'domicilio', address: f.address, neighborhood: f.neighborhood, city: f.city } : { method: 'recoger_en_tienda' },
          preferredDate: f.preferredDate || undefined, paymentMethod: f.paymentMethod, notes: f.notes || undefined, website: f.website ?? '',
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? null, quantity: i.quantity })),
        }),
      });
      sessionStorage.setItem(`wa:${res.code}`, res.whatsappUrl); // para el botón «Abrir WhatsApp de nuevo»
      clear();
      navigate(`/pedido/confirmado/${res.code}`);
      window.location.href = res.whatsappUrl; // no usar window.open tras un await: el navegador lo bloquea
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : 'No pudimos enviar tu pedido. Intenta de nuevo.');
    }
  };

  if (items.length === 0) {
    return (
      <section className="wrap py-24">
        <Seo title="Tu pedido" noindex />
        <h1 className="t-h2">Tu pedido está vacío</h1>
        <p className="mt-3">Elige algo de los catálogos para continuar.</p>
        <Link to="/tienda" className="btn btn-primary mt-6">Ver catálogos</Link>
      </section>
    );
  }

  return (
    <>
      <Seo title="Enviar pedido" noindex />
      <header className="wrap pb-6 pt-14 md:pt-20"><h1 className="t-display text-[clamp(2.4rem,6vw,5.5rem)]">Envía tu pedido</h1><p className="t-lead mt-4 max-w-[40ch]">Llena tus datos y abrimos WhatsApp con el mensaje listo. Allí confirmamos disponibilidad y pago.</p></header>
      <div className="wrap grid items-start gap-10 pb-24 lg:grid-cols-[1fr_400px]">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="paper grid gap-5 p-6 sm:p-9" aria-label="Datos del pedido">
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 font-display text-2xl">Tus datos</legend>
            <Input label="Nombre completo" autoComplete="name" error={errors.name?.message} {...register('name')} className="sm:col-span-2" />
            <Input label="Celular" type="tel" inputMode="tel" autoComplete="tel" placeholder="300 123 4567" error={errors.phone?.message} {...register('phone')} />
            <Input label="Correo (opcional)" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            {institutional && <>
              <Input label="Cédula o NIT" error={errors.document?.message} hint="Necesaria para pedidos industriales y para facturar." {...register('document')} />
              <Input label="Empresa" error={errors.companyName?.message} {...register('companyName')} />
            </>}
          </fieldset>

          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="mb-4 font-display text-2xl">Entrega</legend>
            <div className="flex flex-wrap gap-2 sm:col-span-2" role="radiogroup" aria-label="Método de entrega">
              {([['domicilio', 'Domicilio'], ['recoger_en_tienda', 'Recoger en tienda']] as const).map(([v, l]) => (
                <label key={v} className={`cursor-pointer rounded-full px-5 py-3 font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-oro ${method === v ? 'bg-bosque text-papel' : 'bg-crema hover:bg-arena'}`}>
                  <input type="radio" value={v} className="sr-only" {...register('method')} />{l}
                </label>
              ))}
            </div>
            {method === 'domicilio' && <>
              <Input label="Dirección" autoComplete="street-address" error={errors.address?.message} {...register('address')} className="sm:col-span-2" />
              <Input label="Barrio" error={errors.neighborhood?.message} {...register('neighborhood')} />
              <Input label="Ciudad" autoComplete="address-level2" error={errors.city?.message} {...register('city')} />
            </>}
            <Input label="Fecha deseada (opcional)" type="date" min={today} error={errors.preferredDate?.message} {...register('preferredDate')} />
          </fieldset>

          <fieldset>
            <legend className="mb-4 font-display text-2xl">Pago</legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Método de pago preferido">
              {([['efectivo', 'Efectivo'], ['transferencia', 'Transferencia'], ['otro', 'Otro']] as const).map(([v, l]) => (
                <label key={v} className="cursor-pointer rounded-full bg-crema px-5 py-3 font-semibold hover:bg-arena has-[:checked]:bg-bosque has-[:checked]:text-papel has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-oro">
                  <input type="radio" value={v} className="sr-only" {...register('paymentMethod')} />{l}
                </label>
              ))}
            </div>
            <p className="t-small mt-2">No cobramos en línea: el pago se acuerda por WhatsApp.</p>
          </fieldset>

          <Textarea label="Notas (opcional)" placeholder="Dedicatoria, empaque de regalo, alergias…" maxLength={500} error={errors.notes?.message} {...register('notes')} />
          <div className="sr-only-field" aria-hidden><label>No llenar<input tabIndex={-1} autoComplete="off" {...register('website')} /></label></div>

          <div>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-6 w-6 shrink-0 accent-bosque" aria-invalid={!!errors.accept} {...register('accept')} />
              <span>Acepto el tratamiento de mis datos personales según la <Link to="/privacidad" target="_blank" className="font-bold underline">política de privacidad</Link> (Ley 1581 de 2012).</span>
            </label>
            {errors.accept && <p role="alert" className="err">{errors.accept.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-wa min-h-[60px] text-lg">{isSubmitting ? 'Enviando…' : 'Enviar pedido por WhatsApp'}</button>
        </form>

        <aside className="paper-100 zig-b p-7 lg:sticky lg:top-28" aria-label="Resumen del pedido">
          <h2 className="font-display text-2xl">Tu pedido</h2>
          {groupByCatalog(items).map((g) => (
            <div key={g.slug} className="mt-4">
              <p className="font-bold italic">{g.name}</p>
              <ul>{g.items.map((i) => (
                <li key={i.key} className="mt-2 flex items-end gap-2"><span className="max-w-[65%]">{i.quantity} × {i.name}{i.variantName ? ` (${i.variantName})` : ''}</span><span className="leader" aria-hidden /><span className="num font-bold">{i.unitPrice === null ? 'A convenir' : cop(i.unitPrice * i.quantity)}</span></li>
              ))}</ul>
            </div>
          ))}
          <dl className="mt-6 grid gap-1">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="num">{cop(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>Domicilio</dt><dd className="num">{method === 'domicilio' ? (fee ? cop(fee) : s && s.delivery_fee === 0 ? 'Se acuerda por WhatsApp' : 'Sin costo') : 'Recoges tú'}</dd></div>
          </dl>
          <p className="mt-3 flex justify-between bg-ink px-4 py-3 font-display text-xl text-papel"><span>Total</span><span className="num">{cop(subtotal + fee)}</span></p>
          {hasOnRequest(items) && <p className="t-small mt-2">+ productos con precio a convenir.</p>}
          <p className="t-small mt-3 text-tierra">El total final lo confirma la tienda con los precios vigentes.</p>
        </aside>
      </div>
    </>
  );
}
