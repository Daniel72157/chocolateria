import Badge from '../../components/ui/Badge';
import type { OrderStatus } from '../../../shared/types';

export const STATUS_LABEL: Record<OrderStatus, string> = { nuevo: 'Nuevo', confirmado: 'Confirmado', en_preparacion: 'En preparación', entregado: 'Entregado', cancelado: 'Cancelado' };
const TONE = { nuevo: 'gold', confirmado: 'dark', en_preparacion: 'sage', entregado: 'light', cancelado: 'red' } as const;
export default function StatusBadge({ status }: { status: OrderStatus }) { return <Badge tone={TONE[status]}>{STATUS_LABEL[status]}</Badge>; }
