import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, hasSupabase } from '../../lib/supabase';
import { Input } from '../../components/ui/Field';
import Seo from '../../components/ui/Seo';

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError('Correo o contraseña incorrectos'); else nav('/admin');
  };
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-ink p-4">
      <Seo title="Ingreso · Administración" noindex />
      <form onSubmit={submit} className="paper grid w-full max-w-md gap-5 p-8">
        <h1 className="t-h2 text-4xl">Administración</h1>
        {!hasSupabase && <p role="note" className="bg-arena p-3 text-base">Modo demo: configura <strong>VITE_SUPABASE_URL</strong> y <strong>VITE_SUPABASE_ANON_KEY</strong> para iniciar sesión.</p>}
        <Input label="Correo" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <p role="alert" className="err">{error}</p>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Entrando…' : 'Entrar'}</button>
      </form>
    </div>
  );
}
