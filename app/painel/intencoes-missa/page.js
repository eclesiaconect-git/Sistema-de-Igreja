'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { formatarData } from '@/lib/proximasMissas';

export default function IntencoesMissa() {
  const supabase = createClient();
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const { data } = await supabase
      .from('intencoes_missa')
      .select('*')
      .order('data_missa', { ascending: true })
      .order('hora_missa', { ascending: true });
    setLista(data || []);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function alternarAtendida(item) {
    await supabase.from('intencoes_missa').update({ atendida: !item.atendida }).eq('id', item.id);
    carregar();
  }

  async function remover(id) {
    if (!confirm('Remover esta intenção?')) return;
    await supabase.from('intencoes_missa').delete().eq('id', id);
    carregar();
  }

  // Agrupa por data + hora + título da missa
  const grupos = {};
  for (const item of lista) {
    const chave = `${item.data_missa}|${item.hora_missa}|${item.titulo_missa}`;
    if (!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(item);
  }

  return (
    <div className="p-6 sm:p-10 max-w-2xl">
      <h1 className="font-display text-2xl text-ink mb-2">Intenções de missa</h1>
      <p className="text-sm text-ink/50 mb-6">
        Organizadas por horário de missa, na ordem em que foram cadastradas.
      </p>

      {carregando ? (
        <p className="text-ink/50 text-sm">Carregando...</p>
      ) : Object.keys(grupos).length === 0 ? (
        <p className="text-ink/50 text-sm">Nenhuma intenção recebida ainda.</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grupos).map(([chave, itens]) => {
            const [data, hora, titulo] = chave.split('|');
            return (
              <div key={chave}>
                <p className="text-sm font-medium text-wine mb-2">
                  {formatarData(data)} {hora ? `· ${hora}` : ''} — {titulo}{' '}
                  <span className="text-ink/40 font-normal">({itens.length})</span>
                </p>
                <div className="space-y-2">
                  {itens.map((item) => (
                    <div
                      key={item.id}
                      className="border border-ink/10 rounded-xl p-4 bg-white/50 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className={`text-sm ${item.atendida ? 'text-ink/40 line-through' : 'text-ink'}`}>
                          {item.intencao}
                        </p>
                        {item.nome && <p className="text-xs text-ink/40 mt-1">— {item.nome}</p>}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          onClick={() => alternarAtendida(item)}
                          className="text-xs text-sage hover:underline"
                        >
                          {item.atendida ? 'Reabrir' : 'Concluir'}
                        </button>
                        <button
                          onClick={() => remover(item.id)}
                          className="text-xs text-wine hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
