import { create } from 'zustand';
export const useUi = create<{ drawer: boolean; setDrawer: (v: boolean) => void }>((set) => ({ drawer: false, setDrawer: (drawer) => set({ drawer }) }));
