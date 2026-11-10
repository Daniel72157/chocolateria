import { create } from 'zustand';

export type ToastItem = { id: number; kind: 'ok' | 'error'; text: string; action?: { label: string; to: string } };
type S = { toasts: ToastItem[]; push: (t: Omit<ToastItem, 'id'>) => void; dismiss: (id: number) => void };
let n = 0;
export const useToasts = create<S>((set) => ({
  toasts: [],
  push: (t) => {
    const id = ++n;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 5000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));
export const toast = {
  ok: (text: string, action?: ToastItem['action']) => useToasts.getState().push({ kind: 'ok', text, action }),
  error: (text: string) => useToasts.getState().push({ kind: 'error', text }),
};
