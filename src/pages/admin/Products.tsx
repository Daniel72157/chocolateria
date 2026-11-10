import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { useAdminGet, useAdminMutation, json, confirmDelete } from '../../hooks/useAdmin';
import { useCatalogs } from '../../hooks/useProducts';
import { cop } from '../../lib/format';
import { CATALOG_NAME } from '../../store/cart';
import Pager from '../../components/ui/Pager';
import type { Product } from '../../../shared/types';

function Toggle({ on, label, onChange }: { on: boolean; label: string; onChange: (v: boolean) => void }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-bosque' : 'bg-tierra/40'}`}><span className={`absolute top-0.5 h-6 w-6 rounded-full bg-papel transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></button>;
}

export default function Products() {
  const nav = useNavigate();
  const [f, setF] = useState({ catalog: '', category: '', status: '', q: '', page: 1 });
  const { data: catalogs } = useCatalogs();
  const p = new URLSearchParams({ page: String(f.page) });
  (['catalog', 'category', 'status', 'q'] as const).forEach((k) => f[k] && p.set(k, f[k]));
  const { data } = useAdminGet<{ items: Product[]; total: number; pageSize: number }>(['products', p.toString()], `/admin/products?${p}`);
  const inv = [['admin', 'products'], ['featured']];
  const patch = useAdminMutation(({ id, ...b }: { id: string; isActive?: boolean; isAvailable?: boolean; isFeatured?: boolean }) => api(`/admin/products/${id}`, json('PATCH', b)), { invalidate: inv });
  const del = useAdminMutation((id: string) => api(`/admin/products/${id}`, json('DELETE')), { invalidate: inv, ok: 'Producto eliminado' });
  const dup = useAdminMutation((id: string) => api<{ id: string }>(`/admin/products/${id}/duplicate`, json('POST')), { invalidate: inv, ok: 'Producto duplicado (queda inactivo)' });
  const cats = catalogs?.find((c) => c.slug === f.catalog)?.categories ?? [];
  const set = (k: string, v: string) => setF({ ...f, [k]: v, page: 1, ...(k === 'catalog' ? { category: '' } : {}) });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="t-h2 text-4xl">Productos</h1><Link to="/admin/productos/nuevo" className="btn btn-primary"><Plus size={18} aria-hidden /> Nuevo producto</Link></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div><label className="label" htmlFor="fq">Buscar</label><input id="fq" className="field !bg-crema" value={f.q} onChange={(e) => set('q', e.target.value)} /></div>
        <div><label className="label" htmlFor="fc">Catálogo</label><select id="fc" className="field !bg-crema" value={f.catalog} onChange={(e) => set('catalog', e.target.value)}><option value="">Todos</option>{Object.entries(CATALOG_NAME).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label className="label" htmlFor="fk">Categoría</label><select id="fk" className="field !bg-crema" value={f.category} disabled={!f.catalog} onChange={(e) => set('category', e.target.value)}><option value="">Todas</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label className="label" htmlFor="fs">Estado</label><select id="fs" className="field !bg-crema" value={f.status} onChange={(e) => set('status', e.target.value)}><option value="">Todos</option><option value="activo">Activos</option><option value="inactivo">Inactivos</option><option value="agotado">Agotados</option></select></div>
      </div>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[860px] text-left">
          <thead><tr className="bg-crema">{['', 'Producto', 'Catálogo', 'Precio', 'Activo', 'Agotado', 'Destacado', ''].map((h, i) => <th key={i} scope="col" className="px-3 py-3">{h}</th>)}</tr></thead>
          <tbody>
            {data?.items.map((r) => (
              <tr key={r.id} className="odd:bg-crema/60">
                <td className="px-3 py-2"><img src={r.product_images[0]?.url} alt="" width={48} height={60} className="h-[60px] w-12 bg-arena object-cover" /></td>
                <td className="px-3 py-2"><Link to={`/admin/productos/${r.id}`} className="font-bold underline">{r.name}</Link><br /><span className="t-small text-tierra">{catalogs?.flatMap((c) => c.categories).find((c) => c.id === r.category_id)?.name ?? 'Sin categoría'}</span></td>
                <td className="px-3 py-2">{CATALOG_NAME[r.catalog_slug]}</td>
                <td className="num px-3 py-2">{r.price_on_request ? 'A convenir' : cop(r.price_cop ?? 0)}</td>
                <td className="px-3 py-2"><Toggle on={r.is_active} label={`Activo: ${r.name}`} onChange={(v) => patch.mutate({ id: r.id, isActive: v })} /></td>
                <td className="px-3 py-2"><Toggle on={!r.is_available} label={`Agotado: ${r.name}`} onChange={(v) => patch.mutate({ id: r.id, isAvailable: !v })} /></td>
                <td className="px-3 py-2"><Toggle on={r.is_featured} label={`Destacado: ${r.name}`} onChange={(v) => patch.mutate({ id: r.id, isFeatured: v })} /></td>
                <td className="px-3 py-2"><span className="flex gap-1">
                  <button aria-label={`Editar ${r.name}`} onClick={() => nav(`/admin/productos/${r.id}`)} className="flex h-10 w-10 items-center justify-center rounded-full bg-crema hover:bg-arena"><Pencil size={16} /></button>
                  <button aria-label={`Duplicar ${r.name}`} onClick={() => dup.mutate(r.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-crema hover:bg-arena"><Copy size={16} /></button>
                  <button aria-label={`Eliminar ${r.name}`} onClick={() => confirmDelete(`«${r.name}»`) && del.mutate(r.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-crema text-rojo hover:bg-arena"><Trash2 size={16} /></button>
                </span></td>
              </tr>
            ))}
            {data?.items.length === 0 && <tr><td colSpan={8} className="px-3 py-8">No hay productos con esos filtros.</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pager page={f.page} total={data.total} size={data.pageSize} onPage={(page) => setF({ ...f, page })} />}
    </>
  );
}
