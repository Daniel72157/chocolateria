import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const hasSupabase = Boolean(url && key);

// Solo se usa para (1) iniciar sesión del admin y (2) subir imágenes con URL firmada.
export const supabase = createClient(url ?? 'http://localhost:54321', key ?? 'anon-demo-key', {
  auth: { persistSession: hasSupabase, autoRefreshToken: hasSupabase },
});
