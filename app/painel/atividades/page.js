'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const vazio = {
  titulo: '',
  descricao: '',
  hora: '',
  local: '',
  recorrente: false,
  dia_semana: '0',
  data_evento: '',
};

export default function Atividades() {
  const supabase = createClient();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(vazio);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from('atividades')
      .select('*')
      .order('recorrente', { ascending: false })
      .order('data_evento', { ascending: true });
    setLista(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.titulo.trim()) return;

    await supabase.from('atividades').insert({
      titulo: form.titulo,
      descricao: form.descricao || null,
      hora: form.hora || null,
      local: form.local || null,
      recorrente: form.recorrente,
      dia_semana: form.recorrente ? Number(form.dia_semana) : null,
      data_evento: form.recorrente ? null : form.data_evento || null,
    });

    setForm(vazio);
    carregar();
  }

  async function remover(id) {
    if (!confirm('Remover este item?')) return;
    await supabase.from('atividades').delete().eq('id', id);
    carregar();
  }

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <h1 className="font-display text-2xl text-ink mb-2">Atividades e horários</h1>
      <p className="text-sm text-ink/50 mb-6">
        Tudo que você cadastrar aqui aparece automaticamente no site público.
      </p>

      <form
        onSubmit={adicionar}
        className="grid sm:grid-cols-2 gap-3 mb-8 border border-ink/10 rounded-2xl p-5 bg-white/50"
      >
        <input
          placeholder="Título (ex: Missa dominical)"
          required
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none sm:col-span-2"
        />
        <input
          placeholder="Descrição (opcional)"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none sm:col-span-2"
        />

        <label className="flex items-center gap-2 text-sm text-ink/70 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.recorrente}
            onChange={(e) => setForm({ ...form, recorrente: e.target.checked })}
            className="rounded border-ink/30"
          />
          É um horário fixo semanal (ex: missa de todo domingo)
        </label>

        {form.recorrente ? (
          <select
            value={form.dia_semana}
            onChange={(e) => setForm({ ...form, dia_semana: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          >
            {DIAS.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="date"
            value={form.data_evento}
            onChange={(e) => setForm({ ...form, data_evento: e.target.value })}
            className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        )}

        <input
          placeholder="Hora (ex: 19h)"
          value={form.hora}
          onChange={(e) => setForm({ ...form, hora: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />

        <input
          placeholder="Local (opcional)"
          value={form.local}
          onChange={(e) => setForm({ ...form, local: e.target.value })}
          className="rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none sm:col-span-2"
        />

        <button className="sm:col-span-2 rounded-full bg-ink text-parchment font-medium py-2.5 hover:bg-wine transition-colors">
          Adicionar
        </button>
      </form>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : (
        <ul className="divide-y divide-ink/10 border border-ink/10 rounded-2xl overflow-hidden bg-white/50">
          {lista.map((a) => (
            <li key={a.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-ink">{a.titulo}</p>
                <p className="text-xs text-ink/50">
                  {a.recorrente
                    ? `Toda ${DIAS[a.dia_semana]}`
                    : a.data_evento &&
                      new Date(a.data_evento + 'T00:00:00').toLocaleDateString('pt-BR')}
                  {a.hora ? ` · ${a.hora}` : ''}
                </p>
              </div>
              <button onClick={() => remover(a.id)} className="text-xs text-wine hover:underline">
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
