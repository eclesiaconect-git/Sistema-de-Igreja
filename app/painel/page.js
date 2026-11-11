import { createClient } from '@/lib/supabaseServer';

export default async function PainelHome() {
  const supabase = createClient();

  const [
    { count: totalMembros },
    { count: pedidosPendentes },
    { data: dizimosMes },
    { data: membrosNascimento },
    { data: dizimosNascimento },
  ] = await Promise.all([
    supabase.from('membros').select('*', { count: 'exact', head: true }).eq('ativo', true),
    supabase
      .from('pedidos_oracao')
      .select('*', { count: 'exact', head: true })
      .eq('atendido', false),
    supabase
      .from('dizimos')
      .select('valor')
      .gte('data_recebimento', new Date(new Date().setDate(1)).toISOString().slice(0, 10)),
    supabase.from('membros').select('nome, data_nascimento').not('data_nascimento', 'is', null),
    supabase
      .from('dizimos')
      .select('nome_avulso, data_nascimento_avulso')
      .not('data_nascimento_avulso', 'is', null)
      .is('membro_id', null),
  ]);

  const totalMes = (dizimosMes || []).reduce((soma, d) => soma + Number(d.valor), 0);

  const mesAtual = new Date().getMonth() + 1;

  const aniversariantesMembros = (membrosNascimento || [])
    .filter((m) => Number(m.data_nascimento.slice(5, 7)) === mesAtual)
    .map((m) => ({
      nome: m.nome,
      dia: Number(m.data_nascimento.slice(8, 10)),
      tipo: 'Membro',
    }));

  const nomesJaContados = new Set();
  const aniversariantesDizimistas = (dizimosNascimento || [])
    .filter(
      (d) =>
        d.nome_avulso &&
        Number(d.data_nascimento_avulso.slice(5, 7)) === mesAtual &&
        !nomesJaContados.has(d.nome_avulso) &&
        nomesJaContados.add(d.nome_avulso)
    )
    .map((d) => ({
      nome: d.nome_avulso,
      dia: Number(d.data_nascimento_avulso.slice(8, 10)),
      tipo: 'Dizimista',
    }));

  const aniversariantes = [...aniversariantesMembros, ...aniversariantesDizimistas].sort(
    (a, b) => a.dia - b.dia
  );

  const cards = [
    { label: 'Membros ativos', valor: totalMembros ?? 0 },
    { label: 'Pedidos de oração pendentes', valor: pedidosPendentes ?? 0 },
    {
      label: 'Dízimos e ofertas no mês',
      valor: totalMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    },
  ];

  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl text-ink mb-6">Visão geral</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-ink/10 rounded-2xl p-5 bg-white/50">
            <p className="text-xs text-ink/50 uppercase tracking-wide mb-2">{c.label}</p>
            <p className="font-display text-2xl text-ink">{c.valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-ink/10 rounded-2xl p-5 bg-white/50 max-w-xl">
        <p className="text-xs text-ink/50 uppercase tracking-wide mb-3">
          🎂 Aniversariantes do mês
        </p>
        {aniversariantes.length === 0 ? (
          <p className="text-sm text-ink/50">Ninguém faz aniversário este mês.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {aniversariantes.map((a, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <span className="text-ink">{a.nome}</span>
                <span className="text-ink/50 text-xs">
                  dia {String(a.dia).padStart(2, '0')} · {a.tipo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
