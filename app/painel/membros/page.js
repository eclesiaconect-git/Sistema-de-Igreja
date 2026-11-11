'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Membros() {
  const supabase = createClient();
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    email: '',
    ministerio: '',
    data_nascimento: '',
  });

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from('membros')
      .select('*')
      .order('nome', { ascending: true });
    setMembros(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    await supabase.from('membros').insert({
      ...form,
      data_nascimento: form.data_nascimento || null,
    });
    setForm({ nome: '', telefone: '', email: '', ministerio: '', data_nascimento: '' });
    carregar();
  }

  async function alternarAtivo(membro) {
    await supabase.from('membros').update({ ativo: !membro.ativo }).eq('id', membro.id);
    carregar();
  }

  async function remover(id) {
    if (!confirm('Remover este membro?')) return;
    await supabase.from('membros').delete().eq('id', id);
    carregar();
  }

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-6">Membros</h1>

      <form
        onSubmit={adicionar}
        className="grid sm:grid-cols-2 gap-3 mb-8 border border-ink/10 rounded-2xl p-5 bg-white/50"
      >
        <input
          placeholder="Nome"
          required
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <input
          placeholder="Telefone"
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <input
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <input
          placeholder="Ministério / departamento"
          value={form.ministerio}
          onChange={(e) => setForm({ ...form, ministerio: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <label className="text-xs text-ink/50 -mb-2">Data de nascimento</label>
        <span className="hidden sm:block" />
        <input
          type="date"
          value={form.data_nascimento}
          onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <button className="sm:col-span-2 rounded-full bg-ink text-parchment font-medium py-2.5 hover:bg-wine transition-colors">
          Adicionar membro
        </button>
      </form>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : membros.length === 0 ? (
        <p className="text-ink/50 text-sm">Nenhum membro cadastrado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {membros.map((m) => (
            <li
              key={m.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-ink/10 rounded-2xl px-5 py-4 bg-white/50"
            >
              <div className="min-w-0">
                <p className={`font-medium ${m.ativo ? 'text-ink' : 'text-ink/40 line-through'}`}>
                  {m.nome}
                </p>
                <p className="text-xs text-ink/50 break-words">
                  {[
                    m.telefone,
                    m.email,
                    m.ministerio,
                    m.data_nascimento &&
                      `🎂 ${new Date(m.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => alternarAtivo(m)}
                  className="text-xs text-sage hover:underline"
                >
                  {m.ativo ? 'Marcar inativo' : 'Marcar ativo'}
                </button>
                <button
                  onClick={() => remover(m.id)}
                  className="text-xs text-wine hover:underline"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
