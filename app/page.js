import NavPublica from '@/components/NavPublica';
import BannerCarrossel from '@/components/BannerCarrossel';
import RedesSociais from '@/components/RedesSociais';
import { createClient } from '@/lib/supabaseServer';
import { getConfig } from '@/lib/config';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

async function getAtividades() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('atividades')
    .select('*')
    .order('recorrente', { ascending: false })
    .order('data_evento', { ascending: true });
  if (error) return [];
  return data;
}

async function getBanners() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .eq('ativo', true)
    .order('ordem', { ascending: true });
  if (error) return [];
  return data;
}

async function getGaleria() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('galeria')
    .select('*')
    .order('data_evento', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(9);
  if (error) return [];
  return data;
}

async function getPublicacoes() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('publicacoes')
    .select('*')
    .order('fixado', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(12);
  if (error) return [];
  return data;
}

export default async function Home() {
  const [config, atividades, banners, galeria, publicacoes] = await Promise.all([
    getConfig(),
    getAtividades(),
    getBanners(),
    getGaleria(),
    getPublicacoes(),
  ]);
  const nome = config.nome_igreja;
  const fixos = atividades.filter((a) => a.recorrente);
  const eventos = atividades.filter((a) => !a.recorrente);
  const temCapa = Boolean(config.capa_url);

  return (
    <>
      <NavPublica nome={nome} logoUrl={config.logo_url} />

      <BannerCarrossel banners={banners} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {temCapa && (
          <>
            <img
              src={config.capa_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-md opacity-60"
            />
            <div className="absolute inset-0 bg-parchment/60" />
          </>
        )}
        <div className="relative max-w-4xl mx-auto px-6 py-16 sm:py-20 text-center">
          <p className="font-medium tracking-widest text-xs uppercase mb-4 text-gold">
            Bem-vindo(a)
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-5 text-ink">
            {nome}
          </h1>
          <p className="max-w-xl mx-auto text-black/60">
            Confira nossos horários, envie um pedido de oração ou contribua com
            seu dízimo — tudo em um só lugar.
          </p>
        </div>
      </section>

      {/* Mural de avisos - 2 colunas */}
      {publicacoes.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <h2 className="font-display text-2xl text-ink mb-6">Avisos</h2>
          <div className="columns-2 gap-3 sm:gap-4">
            {publicacoes.map((p) => (
              <div
                key={p.id}
                className="break-inside-avoid mb-3 sm:mb-4 border border-ink/10 rounded-2xl p-4 sm:p-5 bg-white/40"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-display text-sm sm:text-base text-ink leading-snug">
                    {p.fixado && <span className="text-gold">📌 </span>}
                    {p.titulo}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-black/60 whitespace-pre-line leading-relaxed">
                  {p.texto}
                </p>
                <p className="text-[10px] sm:text-xs text-black/30 mt-2">
                  {new Date(p.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sobre */}
      {config.sobre_texto && (
        <section className="max-w-4xl mx-auto px-6 py-10">
          <div className="border border-ink/10 rounded-2xl p-6 sm:p-8 bg-white/40">
            <h2 className="font-display text-2xl text-ink mb-4">Sobre nós</h2>
            <p className="text-sm sm:text-base text-black/70 leading-relaxed whitespace-pre-line">
              {config.sobre_texto}
            </p>
            {config.nome_paroco && (
              <p className="text-sm text-gold font-medium mt-4">— {config.nome_paroco}</p>
            )}
          </div>
        </section>
      )}

      {/* Horários fixos */}
      <section id="atividades" className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="font-display text-2xl text-ink mb-6">Horários</h2>
        {fixos.length === 0 ? (
          <p className="text-black/50 text-sm">
            Os horários fixos ainda não foram cadastrados.
          </p>
        ) : (
          <ul className="divide-y divide-ink/10 border border-ink/10 rounded-2xl overflow-hidden bg-white/40">
            {fixos.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-ink">{a.titulo}</p>
                  {a.descricao && (
                    <p className="text-sm text-black/50">{a.descricao}</p>
                  )}
                </div>
                <div className="text-right shrink-0 pl-4">
                  <p className="text-sm font-medium text-wine">
                    {DIAS[a.dia_semana] ?? ''}
                  </p>
                  <p className="text-sm text-black/60">{a.hora}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Próximas atividades */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="font-display text-2xl text-ink mb-6">Próximas atividades</h2>
        {eventos.length === 0 ? (
          <p className="text-black/50 text-sm">
            Nenhuma atividade especial cadastrada no momento.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {eventos.map((a) => (
              <div key={a.id} className="border border-ink/10 rounded-2xl p-5 bg-white/40">
                <p className="text-xs text-gold font-medium uppercase tracking-wide mb-1">
                  {a.data_evento &&
                    new Date(a.data_evento + 'T00:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                    })}
                  {a.hora ? ` · ${a.hora}` : ''}
                </p>
                <p className="font-display text-lg text-ink">{a.titulo}</p>
                {a.descricao && <p className="text-sm text-black/60 mt-1">{a.descricao}</p>}
                {a.local && <p className="text-sm text-black/40 mt-1">{a.local}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTAs */}
      <section className="max-w-4xl mx-auto px-6 pb-20 grid sm:grid-cols-2 gap-4">
        <a
          href="/oracao"
          className="rounded-2xl border border-ink/10 p-6 hover:border-wine transition-colors bg-white/40"
        >
          <p className="font-display text-xl text-wine mb-1">Pedido de oração</p>
          <p className="text-sm text-black/60">
            Compartilhe sua intenção — nossa equipe vai orar por você.
          </p>
        </a>
        <a
          href="/doacao"
          className="rounded-2xl border border-ink/10 p-6 hover:border-gold transition-colors bg-white/40"
        >
          <p className="font-display text-xl text-gold mb-1">Dízimo e ofertas</p>
          <p className="text-sm text-black/60">
            Contribua de forma rápida e segura via PIX.
          </p>
        </a>
      </section>

      {/* Galeria */}
      {galeria.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-20">
          <h2 className="font-display text-2xl text-ink mb-6">Galeria</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galeria.map((foto) => (
              <div
                key={foto.id}
                className="aspect-square rounded-xl overflow-hidden border border-ink/10 bg-ink/5 relative group"
              >
                <img
                  src={foto.imagem_url}
                  alt={foto.legenda || ''}
                  className="w-full h-full object-cover"
                />
                {foto.legenda && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-parchment text-xs">{foto.legenda}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="text-center pb-10">
        <RedesSociais
          instagram={config.instagram}
          facebook={config.facebook}
          whatsapp={config.whatsapp}
          className="justify-center mb-4"
        />
        <p className="text-xs text-black/40">{nome} · feito com carinho para a comunidade</p>
      </footer>
    </>
  );
}
