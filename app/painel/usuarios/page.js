'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

const PAPEIS = {
  admin: { label: 'Administrador', cor: 'bg-wine text-parchment' },
  tesouraria: { label: 'Tesouraria', cor: 'bg-gold text-ink' },
  lider: { label: 'Líder', cor: 'bg-sage text-parchment' },
};

export default function Usuarios() {
  const supabase = createClient();
  const [lista, setLista] = useState([]);
  const [meuId, setMeuId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [criando, setCriando] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', papel: 'lider' });

  async function carregar() {
    setCarregando(true);
    const { data: sessao } = await supabase.auth.getUser();
    setMeuId(sessao?.user?.id || null);

    const { data } = await supabase
      .from('perfis')
      .select('*')
      .order('papel')
      .order('nome');
    setLista(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarUsuario(e) {
    e.preventDefault();
    setErro('');
    setCriando(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        papel: form.papel,
      }),
    });
    const resultado = await res.json();

    setCriando(false);

    if (!res.ok) {
      setErro(resultado.error || 'Não foi possível criar o usuário.');
      return;
    }

    setForm({ nome: '', email: '', senha: '', papel: 'lider' });
    carregar();
  }

  async function alterarPapel(id, papel) {
    const { error } = await supabase.from('perfis').update({ papel }).eq('id', id);
    if (error) {
      setErro('Não foi possível alterar o papel (verifique se você é administrador).');
      return;
    }
    carregar();
  }

  async function excluirUsuario(id, nome) {
    if (!confirm(`Remover o acesso de "${nome}"? Essa ação não pode ser desfeita.`)) return;

    setErro('');
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await fetch('/api/admin/delete-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ id }),
    });
    const resultado = await res.json();

    if (!res.ok) {
      setErro(resultado.error || 'Não foi possível excluir o usuário.');
      return;
    }
    carregar();
  }

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <h1 className="font-display text-2xl text-ink mb-2">Usuários e permissões</h1>
      <p className="text-sm text-ink/50 mb-6">
        Apenas administradores podem criar contas, alterar papéis e remover acessos.
      </p>

      <form
        onSubmit={criarUsuario}
        className="border border-ink/10 rounded-2xl p-5 bg-white/50 mb-8 space-y-3"
      >
        <p className="text-sm font-medium text-ink/70 mb-1">Adicionar novo usuário</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            placeholder="Nome"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
          <input
            type="email"
            placeholder="E-mail"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
          <input
            type="password"
            placeholder="Senha (mín. 6 caracteres)"
            required
            value={form.senha}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
          <select
            value={form.papel}
            onChange={(e) => setForm({ ...form, papel: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          >
            <option value="lider">Líder — acesso ao painel</option>
            <option value="tesouraria">Tesouraria — inclui dízimos</option>
            <option value="admin">Administrador — acesso total</option>
          </select>
        </div>
        {erro && <p className="text-sm text-wine">{erro}</p>}
        <button
          type="submit"
          disabled={criando}
          className="rounded-full bg-ink text-parchment font-medium px-6 py-2.5 hover:bg-wine transition-colors disabled:opacity-50"
        >
          {criando ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {lista.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 border border-ink/10 rounded-2xl px-4 py-3 bg-white/50"
            >
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">
                  {u.nome} {u.id === meuId && <span className="text-xs text-ink/40">(você)</span>}
                </p>
                <p className="text-xs text-ink/40 truncate">{u.email}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={u.papel}
                  onChange={(e) => alterarPapel(u.id, e.target.value)}
                  disabled={u.id === meuId}
                  className={`text-xs font-medium rounded-full px-3 py-1.5 border-none outline-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 ${PAPEIS[u.papel]?.cor || 'bg-ink/10'}`}
                >
                  <option value="lider">Líder</option>
                  <option value="tesouraria">Tesouraria</option>
                  <option value="admin">Administrador</option>
                </select>
                {u.id !== meuId && (
                  <button
                    onClick={() => excluirUsuario(u.id, u.nome)}
                    className="text-xs text-wine hover:underline"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
