import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';

export const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
export const ago = (iso: string) => formatDistanceToNow(new Date(iso), { addSuffix: true, locale: es });
export const dateShort = (iso: string) => format(new Date(iso), 'd MMM yyyy', { locale: es });
export const dateTime = (iso: string) => format(new Date(iso), 'd MMM yyyy, h:mm a', { locale: es });
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const phonePretty = (digits: string) => {
  const d = digits.replace(/\D/g, '');
  return d.length === 12 && d.startsWith('57') ? `+57 ${d.slice(2, 5)} ${d.slice(5, 8)} ${d.slice(8)}` : `+${d}`;
};
export const waUrl = (phone: string, text: string) => `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
export const TAG_LABEL: Record<string, string> = {
  nuevo: 'Nuevo', 'mas-vendido': 'Más vendido', 'sin-azucar': 'Sin azúcar', vegano: 'Vegano',
};
