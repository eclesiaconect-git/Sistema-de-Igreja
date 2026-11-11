'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function Escalas() {
  const supabase = createClient();
  const [escalas, setEscalas] = useState([]);
  const [membros, setMembros] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState({ evento: '', data_evento: '', hora: '' });
  const [designacao, setDesignacao] = useState({}); // { escalaId: { membro_id, funcao } }

  async function carregar() {
    setCarregando(true);
    const [{ data: e }, { data: m }] = await Promise.all([
      supabase
        .from('escalas')
        .select('*, escala_membros(id, funcao, membros(nome))')
        .order('data_evento', { ascending: true }),
      supabase.from('membros').select('id, nome').eq('ativo', true).order('nome'),
    ]);
    setEscalas(e || []);
    setMembros(m || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarEscala(e) {
    e.preventDefault();
    if (!form.evento || !form.data_evento) return;
    await supabase.from('escalas').insert(form);
    setForm({ evento: '', data_evento: '', hora: '' });
    carregar();
  }

  async function designar(escalaId) {
    const dados = designacao[escalaId];
    if (!dados?.membro_id) return;
    await supabase.from('escala_membros').insert({
      escala_id: escalaId,
      membro_id: dados.membro_id,
      funcao: dados.funcao || null,
    });
    setDesignacao({ ...designacao, [escalaId]: { membro_id: '', funcao: '' } });
    carregar();
  }

  async function removerDesignacao(id) {
    await supabase.from('escala_membros').delete().eq('id', id);
    carregar();
  }

  async function removerEscala(id) {
    if (!confirm('Remover esta escala e suas designações?')) return;
    await supabase.from('escalas').delete().eq('id', id);
    carregar();
  }

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-6">Escalas</h1>

      <form
        onSubmit={criarEscala}
        className="grid sm:grid-cols-3 gap-3 mb-8 border border-ink/10 rounded-2xl p-5 bg-white/50"
      >
        <input
          placeholder="Evento (ex: Missa de domingo)"
          required
          value={form.evento}
          onChange={(e) => setForm({ ...form, evento: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none sm:col-span-2"
        />
        <input
          type="date"
          required
          value={form.data_evento}
          onChange={(e) => setForm({ ...form, data_evento: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <input
          placeholder="Hora (ex: 19h)"
          value={form.hora}
          onChange={(e) => setForm({ ...form, hora: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none sm:col-span-3"
        />
        <button className="sm:col-span-3 rounded-full bg-ink text-parchment font-medium py-2.5 hover:bg-wine transition-colors">
          Criar escala
        </button>
      </form>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : escalas.length === 0 ? (
        <p className="text-ink/50 text-sm">Nenhuma escala criada ainda.</p>
      ) : (
        <div className="space-y-4">
          {escalas.map((esc) => (
            <div key={esc.id} className="border border-ink/10 rounded-2xl p-5 bg-white/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-display text-lg text-ink">{esc.evento}</p>
                  <p className="text-xs text-ink/50">
                    {new Date(esc.data_evento + 'T00:00:00').toLocaleDateString('pt-BR')}
                    {esc.hora ? ` · ${esc.hora}` : ''}
                  </p>
                </div>
                <button
                  onClick={() => removerEscala(esc.id)}
                  className="text-xs text-wine hover:underline"
                >
                  Remover escala
                </button>
              </div>

              <ul className="divide-y divide-ink/10 mb-3">
                {esc.escala_membros?.map((em) => (
                  <li key={em.id} className="flex items-center justify-between py-2 text-sm">
                    <span>
                      {em.membros?.nome} {em.funcao && <span className="text-ink/40">· {em.funcao}</span>}
                    </span>
                    <button
                      onClick={() => removerDesignacao(em.id)}
                      className="text-xs text-wine hover:underline"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-2">
                <select
                  value={designacao[esc.id]?.membro_id || ''}
                  onChange={(e) =>
                    setDesignacao({
                      ...designacao,
                      [esc.id]: { ...designacao[esc.id], membro_id: e.target.value },
                    })
                  }
                  className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm bg-white/70"
                >
                  <option value="">Selecionar membro...</option>
                  {membros.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Função (ex: leitor, Ministério de Música)"
                  value={designacao[esc.id]?.funcao || ''}
                  onChange={(e) =>
                    setDesignacao({
                      ...designacao,
                      [esc.id]: { ...designacao[esc.id], funcao: e.target.value },
                    })
                  }
                  className="rounded-lg border border-ink/15 px-2 py-1.5 text-sm bg-white/70 flex-1"
                />
                <button
                  onClick={() => designar(esc.id)}
                  className="rounded-lg bg-sage text-parchment px-3 py-1.5 text-sm hover:opacity-90"
                >
                  Adicionar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
