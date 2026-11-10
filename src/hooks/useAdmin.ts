import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../lib/api';
import { toast } from '../store/toast';

export const useAdminGet = <T,>(key: unknown[], path: string, enabled = true) =>
  useQuery({ queryKey: ['admin', ...key], queryFn: () => api<T>(path), enabled, staleTime: 10_000 });

export function useAdminMutation<V = void>(fn: (v: V) => Promise<unknown>, opts: { invalidate?: unknown[][]; ok?: string; onDone?: () => void } = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      opts.invalidate?.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      if (opts.ok) toast.ok(opts.ok);
      opts.onDone?.();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'No se pudo guardar'),
  });
}
export const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });
export const confirmDelete = (what: string) => window.confirm(`¿Eliminar ${what}? Esta acción no se puede deshacer.`);
