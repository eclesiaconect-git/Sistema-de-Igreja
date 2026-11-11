'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function OracoesCatalogo() {
  const supabase = createClient();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ categoria: '', titulo: '', texto: '', ordem: '0' });

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from('oracoes_catalogo')
      .select('*')
      .order('categoria')
      .order('ordem');
    setLista(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar(e) {
    e.preventDefault();
    if (!form.categoria.trim() || !form.titulo.trim() || !form.texto.trim()) return;

    setEnviando(true);
    await supabase.from('oracoes_catalogo').insert({
      categoria: form.categoria.trim(),
      titulo: form.titulo.trim(),
      texto: form.texto.trim(),
      ordem: Number(form.ordem) || 0,
    });
    setForm({ ...form, titulo: '', texto: '', ordem: '0' });
    setEnviando(false);
    carregar();
  }

  async function remover(id) {
    if (!confirm('Remover esta oração?')) return;
    await supabase.from('oracoes_catalogo').delete().eq('id', id);
    carregar();
  }

  const categoriasExistentes = [...new Set(lista.map((l) => l.categoria))];

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <h1 className="font-display text-2xl text-ink mb-2">Biblioteca de orações</h1>
      <p className="text-sm text-ink/50 mb-6">
        Aparece na página pública "Oração → Biblioteca de orações", organizada por categoria.
      </p>

      <form
        onSubmit={adicionar}
        className="border border-ink/10 rounded-2xl p-5 bg-white/50 mb-8 space-y-3"
      >
        <input
          list="categorias-existentes"
          placeholder="Categoria (ex: Comuns, Novenas, Jaculatórias...)"
          required
          value={form.categoria}
          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <datalist id="categorias-existentes">
          {categoriasExistentes.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        <input
          placeholder="Título da oração"
          required
          value={form.titulo}
          onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <textarea
          placeholder="Texto completo da oração"
          required
          rows={5}
          value={form.texto}
          onChange={(e) => setForm({ ...form, texto: e.target.value })}
          className="w-full rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
        />
        <div>
          <label className="block text-sm font-medium text-ink/70 mb-1">
            Ordem dentro da categoria (menor aparece primeiro)
          </label>
          <input
            type="number"
            value={form.ordem}
            onChange={(e) => setForm({ ...form, ordem: e.target.value })}
            className="w-24 rounded-xl border border-ink/15 px-3 py-2 bg-white/70 focus:border-gold outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-ink text-parchment font-medium px-6 py-2.5 hover:bg-wine transition-colors disabled:opacity-50"
        >
          {enviando ? 'Salvando...' : 'Adicionar oração'}
        </button>
      </form>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : (
        <div className="space-y-6">
          {categoriasExistentes.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-medium uppercase tracking-wide text-gold mb-2">{cat}</p>
              <div className="space-y-2">
                {lista
                  .filter((o) => o.categoria === cat)
                  .map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-3 border border-ink/10 rounded-xl px-4 py-2.5 bg-white/50"
                    >
                      <p className="text-sm text-ink truncate">{o.titulo}</p>
                      <button
                        onClick={() => remover(o.id)}
                        className="text-xs text-wine hover:underline shrink-0"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
