'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Dizimos() {
  const supabase = createClient();
  const [lancamentos, setLancamentos] = useState([]);
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({
    membro_id: '',
    nome_avulso: '',
    data_nascimento_avulso: '',
    valor: '',
    tipo: 'dizimo',
    data_recebimento: new Date().toISOString().slice(0, 10),
  });

  async function carregar() {
    setCarregando(true);
    const [{ data: d }, { data: m }] = await Promise.all([
      supabase
        .from('dizimos')
        .select('*, membros(nome)')
        .order('data_recebimento', { ascending: false })
        .limit(100),
      supabase.from('membros').select('id, nome').eq('ativo', true).order('nome'),
    ]);
    setLancamentos(d || []);
    setMembros(m || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.valor) return;

    await supabase.from('dizimos').insert({
      membro_id: form.membro_id || null,
      nome_avulso: form.membro_id ? null : form.nome_avulso || null,
      data_nascimento_avulso: form.membro_id ? null : form.data_nascimento_avulso || null,
      valor: Number(form.valor.replace(',', '.')),
      tipo: form.tipo,
      data_recebimento: form.data_recebimento,
    });

    setForm({ ...form, membro_id: '', nome_avulso: '', data_nascimento_avulso: '', valor: '' });
    carregar();
  }

  async function remover(id) {
    if (!confirm('Remover este lançamento?')) return;
    await supabase.from('dizimos').delete().eq('id', id);
    carregar();
  }

  const totalListado = lancamentos.reduce((s, d) => s + Number(d.valor), 0);

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-6">Dízimos e ofertas</h1>

      <form
        onSubmit={adicionar}
        className="grid sm:grid-cols-2 gap-3 mb-8 border border-ink/10 rounded-2xl p-5 bg-white/50"
      >
        <select
          value={form.membro_id}
          onChange={(e) => setForm({ ...form, membro_id: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        >
          <option value="">Contribuinte avulso (digitar nome)</option>
          {membros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>

        {!form.membro_id && (
          <input
            placeholder="Nome do contribuinte (opcional)"
            value={form.nome_avulso}
            onChange={(e) => setForm({ ...form, nome_avulso: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        )}

        {!form.membro_id && form.nome_avulso && (
          <>
            <label className="text-xs text-ink/50 -mb-2">
              Data de nascimento de {form.nome_avulso} (opcional)
            </label>
            <span className="hidden sm:block" />
            <input
              type="date"
              value={form.data_nascimento_avulso}
              onChange={(e) => setForm({ ...form, data_nascimento_avulso: e.target.value })}
              className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
            />
          </>
        )}

        <input
          placeholder="Valor (ex: 100,00)"
          required
          inputMode="decimal"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />

        <select
          value={form.tipo}
          onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        >
          <option value="dizimo">Dízimo</option>
          <option value="oferta">Oferta</option>
          <option value="outro">Outro</option>
        </select>

        <input
          type="date"
          value={form.data_recebimento}
          onChange={(e) => setForm({ ...form, data_recebimento: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />

        <button className="sm:col-span-2 rounded-full bg-ink text-parchment font-medium py-2.5 hover:bg-wine transition-colors">
          Lançar
        </button>
      </form>

      <p className="text-sm text-ink/60 mb-3">
        Total exibido:{' '}
        <span className="font-medium text-ink">
          {totalListado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </p>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10 rounded-2xl overflow-hidden bg-white/50">
          {lancamentos.map((d) => (
            <li key={d.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-ink">
                  {d.membros?.nome || d.nome_avulso || 'Contribuinte não identificado'}
                </p>
                <p className="text-xs text-ink/50">
                  {new Date(d.data_recebimento + 'T00:00:00').toLocaleDateString('pt-BR')} ·{' '}
                  {d.tipo}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-medium text-sage">
                  {Number(d.valor).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
                <button onClick={() => remover(d.id)} className="text-xs text-wine hover:underline">
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
