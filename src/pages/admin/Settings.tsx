import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminMutation, json } from '../../hooks/useAdmin';
import { useAbout, useSettings } from '../../hooks/useProducts';
import { settingsInput } from '../../../shared/schemas';
import ImageList from '../../components/ui/ImageList';
import { toast } from '../../store/toast';
import type { OpeningHour } from '../../../shared/types';

type AboutRow = { id?: string; title: string; body: string; imageUrl: string };

export default function Settings() {
  const { data: s } = useSettings();
  const { data: about } = useAbout();
  const [f, setF] = useState({ storeName: '', whatsappNumber: '', email: '', deliveryFee: 0, freeDeliveryFrom: '' as string | number, address: '', instagramUrl: '', facebookUrl: '', mapsEmbedUrl: '', orderMessageFooter: '' });
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [blocks, setBlocks] = useState<AboutRow[]>([]);
  useEffect(() => { if (s) { setF({ storeName: s.store_name, whatsappNumber: s.whatsapp_number, email: s.email ?? '', deliveryFee: s.delivery_fee, freeDeliveryFrom: s.free_delivery_from ?? '', address: s.address ?? '', instagramUrl: s.instagram_url ?? '', facebookUrl: s.facebook_url ?? '', mapsEmbedUrl: s.maps_embed_url ?? '', orderMessageFooter: s.order_message_footer ?? '' }); setHours(s.opening_hours); } }, [s]);
  useEffect(() => { if (about) setBlocks(about.map((b) => ({ id: b.id, title: b.title, body: b.body, imageUrl: b.image_url ?? '' }))); }, [about]);

  const saveS = useAdminMutation((p: unknown) => api('/admin/settings', json('PUT', p)), { invalidate: [['settings']], ok: 'Ajustes guardados' });
  const saveA = useAdminMutation((p: unknown) => api('/admin/about', json('PUT', p)), { invalidate: [['about']], ok: 'Quiénes somos (Inicio) guardada' });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = settingsInput.safeParse({ ...f, freeDeliveryFrom: f.freeDeliveryFrom === '' ? null : Number(f.freeDeliveryFrom), deliveryFee: Number(f.deliveryFee), openingHours: hours });
    if (!r.success) return toast.error(r.error.issues[0].message);
    saveS.mutate(r.data);
  };
  const T = (k: keyof typeof f, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label className="label" htmlFor={`s-${k}`}>{label}</label><input id={`s-${k}`} className="field !bg-papel" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...extra} /></div>
  );
  return (
    <div className="grid max-w-4xl gap-10">
      <form onSubmit={submit} className="grid gap-5">
        <h1 className="t-h2 text-4xl">Ajustes de la tienda</h1>
        <div className="grid gap-4 bg-crema p-5 sm:grid-cols-2">
          {T('storeName', 'Nombre de la tienda')}
          {T('whatsappNumber', 'WhatsApp (con indicativo, solo dígitos)', { inputMode: 'numeric', placeholder: '573001234567' })}
          {T('email', 'Correo de contacto', { type: 'email' })}
          {T('deliveryFee', 'Costo de domicilio (COP)', { type: 'number', min: 0 })}
          {T('freeDeliveryFrom', 'Domicilio gratis desde (COP, vacío = nunca)', { type: 'number', min: 0 })}
          <div className="sm:col-span-2">{T('address', 'Dirección')}</div>
          {T('instagramUrl', 'Instagram (URL)', { type: 'url' })}{T('facebookUrl', 'Facebook (URL)', { type: 'url' })}
          <div className="sm:col-span-2">{T('mapsEmbedUrl', 'Mapa (URL de inserción de Google Maps)', { type: 'url' })}</div>
          <div className="sm:col-span-2">{T('orderMessageFooter', 'Pie del mensaje de WhatsApp')}</div>
        </div>
        <fieldset className="grid gap-3 bg-crema p-5"><legend className="mb-2 font-display text-2xl">Horarios</legend>
          {hours.map((h, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <input aria-label={`Días ${i + 1}`} className="field !bg-papel" placeholder="Lunes a viernes" value={h.day} onChange={(e) => setHours(hours.map((x, k) => (k === i ? { ...x, day: e.target.value } : x)))} />
              <input aria-label={`Horas ${i + 1}`} className="field !bg-papel" placeholder="8:00 a. m. – 7:00 p. m." value={h.hours} onChange={(e) => setHours(hours.map((x, k) => (k === i ? { ...x, hours: e.target.value } : x)))} />
              <button type="button" aria-label="Quitar horario" onClick={() => setHours(hours.filter((_, k) => k !== i))} className="flex h-11 w-11 items-center justify-center rounded-full bg-papel text-rojo"><Trash2 size={18} /></button>
            </div>
          ))}
          <button type="button" className="btn btn-soft btn-sm justify-self-start" onClick={() => setHours([...hours, { day: '', hours: '' }])}><Plus size={16} aria-hidden /> Agregar horario</button>
        </fieldset>
        <button className="btn btn-primary justify-self-start" disabled={saveS.isPending}>Guardar ajustes</button>
      </form>

      <section aria-labelledby="ab" className="grid gap-4">
        <h2 id="ab" className="t-h2 text-3xl">Quiénes somos (Inicio)</h2>
        {blocks.map((b, i) => (
          <div key={b.id ?? i} className="grid gap-3 bg-crema p-5">
            <input aria-label={`Título del bloque ${i + 1}`} className="field !bg-papel" placeholder="Título" value={b.title} onChange={(e) => setBlocks(blocks.map((x, k) => (k === i ? { ...x, title: e.target.value } : x)))} />
            <textarea aria-label={`Texto del bloque ${i + 1}`} className="field !bg-papel" placeholder="Texto (un salto de línea separa párrafos)" value={b.body} onChange={(e) => setBlocks(blocks.map((x, k) => (k === i ? { ...x, body: e.target.value } : x)))} />
            <ImageList bucket="posts" folder="nosotros" max={1} value={b.imageUrl ? [{ url: b.imageUrl, path: b.imageUrl }] : []} onChange={(v) => setBlocks(blocks.map((x, k) => (k === i ? { ...x, imageUrl: v[0]?.url ?? '' } : x)))} />
            <button type="button" className="btn btn-danger btn-sm justify-self-start" onClick={() => setBlocks(blocks.filter((_, k) => k !== i))}>Quitar bloque</button>
          </div>
        ))}
        <div className="flex gap-3">
          <button type="button" className="btn btn-soft" onClick={() => setBlocks([...blocks, { title: '', body: '', imageUrl: '' }])}><Plus size={16} aria-hidden /> Agregar bloque</button>
          <button type="button" className="btn btn-primary" disabled={saveA.isPending} onClick={() => saveA.mutate({ sections: blocks.map((b) => ({ id: b.id, title: b.title, body: b.body, imageUrl: b.imageUrl || null })) })}>Guardar Quiénes somos</button>
        </div>
      </section>
    </div>
  );
}
