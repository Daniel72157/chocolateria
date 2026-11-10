import { createClient } from '@supabase/supabase-js';

/** Sin SUPABASE_URL la API arranca en modo demo (datos de ejemplo en memoria). */
export const isDemo = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(
  process.env.SUPABASE_URL ?? 'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'demo-key',
  { auth: { persistSession: false, autoRefreshToken: false } },
);
