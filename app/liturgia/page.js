import Link from 'next/link';
import NavPublica from '@/components/NavPublica';
import { getConfig } from '@/lib/config';

const CORES = {
  Verde: '#4A7A5C',
  Vermelho: '#8C2A2A',
  Roxo: '#5B4B8A',
  Rosa: '#C97B9B',
  Branco: '#B8862E',
};

function hexParaRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function getLiturgia() {
  try {
    const res = await fetch('https://liturgia.up.railway.app/v2/', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getSantoDoDia() {
  try {
    const res = await fetch('https://api-liturgia-diaria.vercel.app/santo-do-dia', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.today || null;
  } catch {
    return null;
  }
}

function Leitura({ titulo, item, corHex }) {
  if (!item) return null;
  return (
    <div
      className="rounded-2xl p-5 mb-4 border-l-4"
      style={{ borderLeftColor: corHex, backgroundColor: hexParaRgba(corHex, 0.06) }}
    >
      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: corHex }}>
        {titulo}
      </p>
      <p className="text-sm text-black/50 mb-3">{item.referencia}</p>
      {item.refrao && (
        <p className="text-sm italic text-wine mb-3">"{item.refrao}"</p>
      )}
      <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">{item.texto}</p>
    </div>
  );
}

export default async function LiturgiaDiaria() {
  const [config, liturgia, santo] = await Promise.all([
    getConfig(),
    getLiturgia(),
    getSantoDoDia(),
  ]);
  const cor = liturgia?.cor;
  const corHex = CORES[cor] || '#B8862E';

  return (
    <>
      <NavPublica nome={config.nome_igreja} logoUrl={config.logo_url} />

      <section
        className="pb-2"
        style={{
          background: `linear-gradient(${hexParaRgba(corHex, 0.12)}, transparent)`,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16">
          <p className="font-medium tracking-widest text-xs uppercase mb-3" style={{ color: corHex }}>
            Liturgia diária
          </p>

          <Link
            href="/missal-dominical"
            className="inline-flex items-center gap-1.5 text-sm text-wine hover:underline mb-4"
          >
            📖 Ver o Missal do próximo Domingo →
          </Link>

          {liturgia && (
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1">
                  {liturgia.liturgia}
                </h1>
                <p className="text-sm text-black/50">{liturgia.data}</p>
              </div>
              {cor && (
                <span
                  className="text-xs font-medium px-3 py-1.5 rounded-full text-white shrink-0"
                  style={{ backgroundColor: corHex }}
                >
                  Cor: {cor}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16">
        {!liturgia ? (
          <p className="text-black/50 text-sm">
            Não foi possível carregar a liturgia de hoje agora. Tente de novo em instantes.
          </p>
        ) : (
          <>
            {santo?.title && (
              <div
                className="rounded-2xl p-5 mb-6 border-l-4"
                style={{ borderLeftColor: corHex, backgroundColor: hexParaRgba(corHex, 0.06) }}
              >
                <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: corHex }}>
                  Santo do dia
                </p>
                <p className="font-display text-lg text-ink mb-3">{santo.title}</p>
                {santo.full_text && (
                  <details className="text-sm text-black/70 leading-relaxed">
                    <summary className="cursor-pointer text-sage font-medium mb-2 list-none">
                      Ler a história completa ↓
                    </summary>
                    <p className="whitespace-pre-line mt-2">{santo.full_text.trim()}</p>
                  </details>
                )}
              </div>
            )}

            {liturgia.oracoes?.coleta && (
              <div
                className="rounded-2xl p-5 mb-4 border-l-4"
                style={{ borderLeftColor: corHex, backgroundColor: hexParaRgba(corHex, 0.06) }}
              >
                <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: corHex }}>
                  Oração da coleta
                </p>
                <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">
                  {liturgia.oracoes.coleta}
                </p>
              </div>
            )}

            {liturgia.leituras?.primeiraLeitura?.[0] && (
              <Leitura titulo="Primeira leitura" item={liturgia.leituras.primeiraLeitura[0]} corHex={corHex} />
            )}
            {liturgia.leituras?.salmo?.[0] && (
              <Leitura titulo="Salmo" item={liturgia.leituras.salmo[0]} corHex={corHex} />
            )}
            {liturgia.leituras?.segundaLeitura?.[0] && (
              <Leitura titulo="Segunda leitura" item={liturgia.leituras.segundaLeitura[0]} corHex={corHex} />
            )}
            {liturgia.leituras?.evangelho?.[0] && (
              <Leitura titulo="Evangelho" item={liturgia.leituras.evangelho[0]} corHex={corHex} />
            )}

            <p className="text-xs text-black/30 mt-6">
              Fonte: liturgia.up.railway.app (CNBB) · Santo do dia: Canção Nova
            </p>
          </>
        )}
      </section>
    </>
  );
}
