'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavPublica from '@/components/NavPublica';
import { createClient } from '@/lib/supabaseClient';
import { gerarProximasMissas, formatarData } from '@/lib/proximasMissas';

export default function PedidoOracao() {
  const [aba, setAba] = useState('pedido'); // pedido | biblioteca | missa

  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [pedido, setPedido] = useState('');
  const [mostrarNome, setMostrarNome] = useState(true);
  const [estado, setEstado] = useState('formulario');
  const [nomeIgreja, setNomeIgreja] = useState('Nossa Igreja');
  const [logoUrl, setLogoUrl] = useState('');

  const [categorias, setCategorias] = useState([]);
  const [carregandoCategorias, setCarregandoCategorias] = useState(true);

  // --- Intenções de missa ---
  const [missas, setMissas] = useState([]);
  const [carregandoMissas, setCarregandoMissas] = useState(true);
  const [limiteIntencoes, setLimiteIntencoes] = useState(10);
  const [missaEscolhida, setMissaEscolhida] = useState('');
  const [nomeIntencao, setNomeIntencao] = useState('');
  const [textoIntencao, setTextoIntencao] = useState('');
  const [estadoIntencao, setEstadoIntencao] = useState('formulario'); // formulario | verificando | enviando | enviado | lotado | erro
  const [sugestao, setSugestao] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('configuracoes')
      .select('nome_igreja, logo_url, limite_intencoes_missa')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          data.nome_igreja && setNomeIgreja(data.nome_igreja);
          setLogoUrl(data.logo_url || '');
          setLimiteIntencoes(data.limite_intencoes_missa ?? 10);
        }
      });

    supabase
      .from('oracoes_catalogo')
      .select('categoria')
      .then(({ data }) => {
        const unicas = [...new Set((data || []).map((d) => d.categoria))];
        setCategorias(unicas);
        setCarregandoCategorias(false);
      });

    supabase
      .from('atividades')
      .select('*')
      .then(({ data }) => {
        setMissas(gerarProximasMissas(data || []).slice(0, 30));
        setCarregandoMissas(false);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pedido.trim()) return;

    setEstado('enviando');
    const supabase = createClient();
    const { error } = await supabase.from('pedidos_oracao').insert({
      nome: nome.trim() || null,
      contato: contato.trim() || null,
      pedido: pedido.trim(),
      mostrar_nome: mostrarNome,
    });

    setEstado(error ? 'erro' : 'enviado');
  }

  async function enviarIntencao(e) {
    e.preventDefault();
    if (!missaEscolhida || !textoIntencao.trim()) return;

    const supabase = createClient();
    const missa = missas.find((m) => `${m.data}|${m.hora}|${m.titulo}` === missaEscolhida);
    if (!missa) return;

    setEstadoIntencao('verificando');
    setSugestao(null);

    const limiteAtivo = limiteIntencoes && limiteIntencoes > 0;

    if (limiteAtivo) {
      const { data: contagem } = await supabase.rpc('contar_intencoes_missa', {
        p_data: missa.data,
        p_hora: missa.hora,
      });

      if ((contagem ?? 0) >= limiteIntencoes) {
        // Procura a próxima missa (na ordem) que ainda tenha vaga
        const indiceAtual = missas.findIndex(
          (m) => `${m.data}|${m.hora}|${m.titulo}` === missaEscolhida
        );

        for (let i = indiceAtual + 1; i < missas.length; i++) {
          const candidata = missas[i];
          const { data: contagemCandidata } = await supabase.rpc('contar_intencoes_missa', {
            p_data: candidata.data,
            p_hora: candidata.hora,
          });
          if ((contagemCandidata ?? 0) < limiteIntencoes) {
            setSugestao(candidata);
            break;
          }
        }

        setEstadoIntencao('lotado');
        return;
      }
    }

    setEstadoIntencao('enviando');
    const { error } = await supabase.from('intencoes_missa').insert({
      nome: nomeIntencao.trim() || null,
      intencao: textoIntencao.trim(),
      titulo_missa: missa.titulo,
      data_missa: missa.data,
      hora_missa: missa.hora,
    });

    setEstadoIntencao(error ? 'erro' : 'enviado');
  }

  function aceitarSugestao() {
    if (!sugestao) return;
    setMissaEscolhida(`${sugestao.data}|${sugestao.hora}|${sugestao.titulo}`);
    setEstadoIntencao('formulario');
    setSugestao(null);
  }

  return (
    <>
      <NavPublica nome={nomeIgreja} logoUrl={logoUrl} />

      <section className="max-w-lg mx-auto px-6 pt-10">
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setAba('pedido')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              aba === 'pedido'
                ? 'bg-wine text-white'
                : 'border-2 border-wine/40 text-wine hover:bg-wine/10'
            }`}
          >
            Pedido de oração
          </button>
          <button
            onClick={() => setAba('missa')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              aba === 'missa'
                ? 'bg-wine text-white'
                : 'border-2 border-wine/40 text-wine hover:bg-wine/10'
            }`}
          >
            Intenção para missa
          </button>
          <button
            onClick={() => setAba('biblioteca')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              aba === 'biblioteca'
                ? 'bg-wine text-white'
                : 'border-2 border-wine/40 text-wine hover:bg-wine/10'
            }`}
          >
            Orações
          </button>
        </div>
      </section>

      {aba === 'pedido' && (
        <section className="max-w-lg mx-auto px-6 pb-16">
          <p className="text-gold font-medium tracking-widest text-xs uppercase mb-3">
            Intenção de oração
          </p>
          <h1 className="font-display text-3xl text-ink mb-3">Como podemos orar por você?</h1>
          <p className="text-black/60 text-sm mb-8">
            Seu pedido será recebido com carinho e cuidado pela nossa equipe de intercessão.
          </p>

          {estado === 'enviado' ? (
            <div className="border border-sage/30 bg-sage/10 rounded-2xl p-6">
              <p className="font-display text-lg text-sage mb-1">Pedido recebido</p>
              <p className="text-sm text-black/60">
                Obrigado por compartilhar. Vamos orar por essa intenção.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">
                  Seu nome (opcional)
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
                  placeholder="Pode deixar em branco se preferir"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">
                  Telefone ou e-mail (opcional)
                </label>
                <input
                  type="text"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
                  placeholder="Caso queira retorno"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">
                  Seu pedido de oração
                </label>
                <textarea
                  required
                  rows={5}
                  value={pedido}
                  onChange={(e) => setPedido(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
                  placeholder="Escreva aqui sua intenção..."
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-black/60">
                <input
                  type="checkbox"
                  checked={mostrarNome}
                  onChange={(e) => setMostrarNome(e.target.checked)}
                  className="rounded border-ink/30"
                />
                A equipe pode ver meu nome junto do pedido
              </label>

              {estado === 'erro' && (
                <p className="text-sm text-wine">
                  Não conseguimos enviar seu pedido agora. Tente novamente em instantes.
                </p>
              )}

              <button
                type="submit"
                disabled={estado === 'enviando'}
                className="w-full rounded-full bg-wine text-parchment font-medium py-3 hover:bg-ink transition-colors disabled:opacity-50"
              >
                {estado === 'enviando' ? 'Enviando...' : 'Enviar pedido'}
              </button>
            </form>
          )}
        </section>
      )}

      {aba === 'missa' && (
        <section className="max-w-lg mx-auto px-6 pb-16">
          <p className="text-gold font-medium tracking-widest text-xs uppercase mb-3">
            Intenção para missa
          </p>
          <h1 className="font-display text-3xl text-ink mb-3">Ofereça esta missa por...</h1>
          <p className="text-black/60 text-sm mb-8">
            Escolha o dia da missa e escreva sua intenção. Cada horário tem um número
            limitado de intenções.
          </p>

          {estadoIntencao === 'enviado' ? (
            <div className="border border-sage/30 bg-sage/10 rounded-2xl p-6">
              <p className="font-display text-lg text-sage mb-1">Intenção recebida</p>
              <p className="text-sm text-black/60">
                Sua intenção foi registrada para a missa escolhida. Obrigado!
              </p>
            </div>
          ) : carregandoMissas ? (
            <p className="text-black/50 text-sm">Carregando horários...</p>
          ) : missas.length === 0 ? (
            <p className="text-black/50 text-sm">
              Nenhum horário de missa cadastrado ainda. Volte mais tarde.
            </p>
          ) : (
            <form onSubmit={enviarIntencao} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">
                  Escolha a missa
                </label>
                <select
                  required
                  value={missaEscolhida}
                  onChange={(e) => {
                    setMissaEscolhida(e.target.value);
                    setEstadoIntencao('formulario');
                    setSugestao(null);
                  }}
                  className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
                >
                  <option value="">Selecione um horário...</option>
                  {missas.map((m) => (
                    <option key={`${m.data}|${m.hora}|${m.titulo}`} value={`${m.data}|${m.hora}|${m.titulo}`}>
                      {formatarData(m.data)} {m.hora ? `· ${m.hora}` : ''} — {m.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">
                  Seu nome (opcional)
                </label>
                <input
                  type="text"
                  value={nomeIntencao}
                  onChange={(e) => setNomeIntencao(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black/70 mb-1">
                  Intenção (ex: "Pela saúde de..." ou "Em ação de graças por...")
                </label>
                <textarea
                  required
                  rows={4}
                  value={textoIntencao}
                  onChange={(e) => setTextoIntencao(e.target.value)}
                  className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none"
                />
              </div>

              {estadoIntencao === 'lotado' && (
                <div className="border border-gold/40 bg-gold/10 rounded-2xl p-4">
                  <p className="text-sm text-black/80 mb-2">
                    Esse horário já atingiu o número máximo de intenções.
                  </p>
                  {sugestao ? (
                    <>
                      <p className="text-sm text-black/60 mb-3">
                        Próximo horário com vaga: <strong>{formatarData(sugestao.data)}
                        {sugestao.hora ? ` · ${sugestao.hora}` : ''} — {sugestao.titulo}</strong>
                      </p>
                      <button
                        type="button"
                        onClick={aceitarSugestao}
                        className="text-sm text-wine font-medium hover:underline"
                      >
                        Usar este horário →
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-black/60">
                      Não encontramos outro horário com vaga nos próximos dias. Tente novamente
                      mais tarde.
                    </p>
                  )}
                </div>
              )}

              {estadoIntencao === 'erro' && (
                <p className="text-sm text-wine">
                  Não conseguimos enviar sua intenção agora. Tente novamente em instantes.
                </p>
              )}

              <button
                type="submit"
                disabled={estadoIntencao === 'verificando' || estadoIntencao === 'enviando'}
                className="w-full rounded-full bg-wine text-parchment font-medium py-3 hover:bg-ink transition-colors disabled:opacity-50"
              >
                {estadoIntencao === 'verificando'
                  ? 'Verificando vagas...'
                  : estadoIntencao === 'enviando'
                  ? 'Enviando...'
                  : 'Enviar intenção'}
              </button>
            </form>
          )}
        </section>
      )}

      {aba === 'biblioteca' && (
        <section className="max-w-lg mx-auto px-6 pb-16">
          <p className="text-gold font-medium tracking-widest text-xs uppercase mb-3">
            Biblioteca
          </p>
          <h1 className="font-display text-3xl text-ink mb-3">Orações</h1>
          <p className="text-black/60 text-sm mb-8">
            Escolha uma categoria para ler as orações.
          </p>

          {carregandoCategorias ? (
            <p className="text-black/50 text-sm">Carregando...</p>
          ) : categorias.length === 0 ? (
            <p className="text-black/50 text-sm">Nenhuma categoria cadastrada ainda.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {categorias.map((cat) => (
                <Link
                  key={cat}
                  href={`/oracao/biblioteca/${encodeURIComponent(cat)}`}
                  className="border border-ink/10 rounded-2xl p-5 bg-white/40 hover:border-wine transition-colors text-center"
                >
                  <p className="text-2xl mb-2">🙏</p>
                  <p className="font-display text-sm text-ink">{cat}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
