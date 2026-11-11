'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function PedidosOracao() {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('pendentes');

  async function carregar() {
    setCarregando(true);
    let query = supabase.from('pedidos_oracao').select('*').order('created_at', { ascending: false });
    if (filtro === 'pendentes') query = query.eq('atendido', false);
    const { data } = await query;
    setPedidos(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, [filtro]);

  async function marcarAtendido(id, atendido) {
    await supabase.from('pedidos_oracao').update({ atendido }).eq('id', id);
    carregar();
  }

  return (
    <div className="p-6 sm:p-10 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Pedidos de oração e Intenções</h1>
        <select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm bg-white/70"
        >
          <option value="pendentes">Pendentes</option>
          <option value="todos">Todos</option>
        </select>
      </div>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : pedidos.length === 0 ? (
        <p className="text-ink/50 text-sm">Nenhum pedido por aqui.</p>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <div key={p.id} className="border border-ink/10 rounded-2xl p-5 bg-white/50">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-ink">
                  {p.mostrar_nome && p.nome ? p.nome : 'Pedido anônimo'}
                </p>
                <span className="text-xs text-ink/40">
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-sm text-ink/70 mb-3">{p.pedido}</p>
              {p.contato && <p className="text-xs text-ink/40 mb-3">Contato: {p.contato}</p>}
              <button
                onClick={() => marcarAtendido(p.id, !p.atendido)}
                className="text-xs text-sage hover:underline"
              >
                {p.atendido ? 'Marcar como pendente' : 'Marcar como orado'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
