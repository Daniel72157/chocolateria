import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { api, ApiError } from '../../lib/api';

type State = { status: 'loading' } | { status: 'out' } | { status: 'ok' } | { status: 'denied'; message: string };

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const check = async (session: Session | null) => {
      if (!session) return setState({ status: 'out' });
      try {
        await api('/admin/me');
        setState({ status: 'ok' });
      } catch (e) {
        if (e instanceof ApiError && e.status === 403) { await supabase.auth.signOut(); setState({ status: 'denied', message: 'No tienes permisos' }); }
        else if (e instanceof ApiError && e.code === 'demo_mode') setState({ status: 'denied', message: e.message });
        else setState({ status: 'out' });
      }
    };
    supabase.auth.getSession().then(({ data }) => check(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { check(s); });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (state.status === 'loading') return <p className="p-10">Cargando…</p>;
  if (state.status === 'out') return <Navigate to="/admin/login" replace />;
  if (state.status === 'denied') return <div className="p-10"><h1 className="t-h2">{state.message}</h1><a href="/admin/login" className="btn btn-primary mt-6">Volver al inicio de sesión</a></div>;
  return <>{children}</>;
}
