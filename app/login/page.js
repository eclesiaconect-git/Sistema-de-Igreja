'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    setCarregando(false);

    if (error) {
      setErro('E-mail ou senha incorretos.');
      return;
    }

    router.push('/painel');
    router.refresh();
  }

  return (
    <section className="max-w-sm mx-auto px-6 py-24">
      <Link href="/" className="text-sm text-ink/50 hover:text-ink">
        ← Voltar ao site
      </Link>
      <h1 className="font-display text-3xl text-ink mt-6 mb-8">Entrar</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">Senha</label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
          />
        </div>

        {erro && <p className="text-sm text-wine">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-full bg-ink text-parchment font-medium py-3 hover:bg-wine transition-colors disabled:opacity-50"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-xs text-ink/40 mt-6">
        Contas são criadas pelo administrador diretamente no painel do Supabase
        (Authentication → Users).
      </p>
    </section>
  );
}
