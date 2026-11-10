import { cop } from './money.js';

const CATALOG_NAMES: Record<string, string> = {
  'canasta-familiar': 'Canasta familiar',
  snacks: 'Snacks',
  industrial: 'Industrial',
};

export type PricedLine = {
  catalogSlug: string;
  name: string;
  variantName?: string | null;
  unitPrice: number | null;
  quantity: number;
  lineTotal: number | null;
};

export function buildOrderMessage(o: {
  code: string;
  createdAt: Date;
  customer: { name: string; phone: string; email?: string; document?: string; companyName?: string };
  deliveryText: string;
  preferredDate?: string;
  lines: PricedLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  hasPriceOnRequest: boolean;
  paymentMethod: string;
  notes?: string;
  footer?: string | null;
}) {
  const L: string[] = [];
  L.push(`*NUEVO PEDIDO - ${o.code}*`);
  L.push(`Fecha: ${o.createdAt.toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`, '');
  L.push('*Cliente*', `Nombre: ${o.customer.name}`, `Celular: ${o.customer.phone}`);
  if (o.customer.email) L.push(`Correo: ${o.customer.email}`);
  if (o.customer.companyName) L.push(`Empresa: ${o.customer.companyName}`);
  if (o.customer.document) L.push(`Cédula/NIT: ${o.customer.document}`);
  L.push('', '*Entrega*', o.deliveryText);
  if (o.preferredDate) L.push(`Fecha deseada: ${o.preferredDate.split('-').reverse().join('/')}`);
  L.push('', '*Productos*');

  for (const slug of Object.keys(CATALOG_NAMES)) {
    const group = o.lines.filter((l) => l.catalogSlug === slug);
    if (!group.length) continue;
    L.push(`_${CATALOG_NAMES[slug]}_`);
    for (const l of group) {
      const name = l.variantName ? `${l.name} (${l.variantName})` : l.name;
      L.push(`• ${l.quantity} x ${name} - ${l.lineTotal === null ? 'A convenir' : cop(l.lineTotal)}`);
    }
  }

  L.push('', `Subtotal: ${cop(o.subtotal)}`, `Domicilio: ${o.deliveryFee ? cop(o.deliveryFee) : 'Se acuerda por WhatsApp'}`);
  L.push(`*TOTAL: ${cop(o.total)}*`);
  if (o.hasPriceOnRequest) L.push('(+ productos con precio a convenir)');
  L.push('', `Pago preferido: ${o.paymentMethod}`);
  if (o.notes) L.push(`Notas: ${o.notes}`);
  if (o.footer) L.push('', o.footer);
  return L.join('\n');
}

export const waLink = (phone: string, text: string) =>
  `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
