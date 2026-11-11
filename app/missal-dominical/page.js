import NavPublica from '@/components/NavPublica';
import { getConfig } from '@/lib/config';
import { proximoDomingo, formatarDataCompleta } from '@/lib/proximoDomingo';

const CORES = {
  Verde: '#4A7A5C',
  Vermelho: '#8C2A2A',
  Roxo: '#5B4B8A',
  Rosa: '#C97B9B',
  Branco: '#B8862E',
};

async function getLiturgiaDoDomingo() {
  const domingo = proximoDomingo();
  const dia = String(domingo.getDate()).padStart(2, '0');
  const mes = String(domingo.getMonth() + 1).padStart(2, '0');
  const ano = domingo.getFullYear();

  try {
    const res = await fetch(
      `https://liturgia.up.railway.app/v2/?dia=${dia}&mes=${mes}&ano=${ano}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function Leitura({ titulo, item, corHex }) {
  if (!item) return null;
  return (
    <div className="rounded-2xl p-5 mb-4 border-l-4 bg-white/50" style={{ borderLeftColor: corHex }}>
      <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: corHex }}>
        {titulo}
      </p>
      <p className="text-sm text-black/50 mb-3">{item.referencia}</p>
      {item.refrao && <p className="text-sm italic text-wine mb-3">"{item.refrao}"</p>}
      <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line">{item.texto}</p>
    </div>
  );
}

function Rito({ numero, titulo, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-medium uppercase tracking-wide text-gold mb-1">
        {numero}. {titulo}
      </p>
      <div className="text-sm text-black/70 leading-relaxed">{children}</div>
    </div>
  );
}

export default async function MissalDominical() {
  const config = await getConfig();
  const domingo = proximoDomingo();
  const liturgia = await getLiturgiaDoDomingo();
  const cor = liturgia?.cor;
  const corHex = CORES[cor] || '#B8862E';

  return (
    <>
      <NavPublica nome={config.nome_igreja} logoUrl={config.logo_url} />

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <p className="text-gold font-medium tracking-widest text-xs uppercase mb-3">
          Missal dominical
        </p>
        <h1 className="font-display text-2xl sm:text-3xl text-ink mb-1 capitalize">
          {formatarDataCompleta(domingo)}
        </h1>
        {liturgia && (
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <p className="text-sm text-black/50">{liturgia.liturgia}</p>
            {cor && (
              <span
                className="text-xs font-medium px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: corHex }}
              >
                Cor: {cor}
              </span>
            )}
          </div>
        )}

        {/* Ritos Iniciais */}
        <Rito numero="I" titulo="Ritos Iniciais">
          <p className="mb-2">
            Canto de entrada, saudação, ato penitencial ("Confesso a Deus..."), Glória
            (nos domingos, exceto Advento e Quaresma) e oração da coleta.
          </p>
        </Rito>

        {/* Liturgia da Palavra */}
        <Rito numero="II" titulo="Liturgia da Palavra">
          <p className="mb-4">
            Primeira leitura, salmo responsorial, segunda leitura, aclamação ao
            Evangelho, Evangelho, homilia, Credo e preces da comunidade.
          </p>

          {!liturgia ? (
            <p className="text-black/50 text-sm">
              Não foi possível carregar as leituras deste domingo agora. Tente de novo
              em instantes.
            </p>
          ) : (
            <>
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
            </>
          )}
        </Rito>

        {/* Liturgia Eucarística */}
        <Rito numero="III" titulo="Liturgia Eucarística">
          <p>
            Apresentação das oferendas (pão e vinho), oração sobre as oferendas,
            Oração Eucarística (com a consagração), Pai Nosso, saudação da paz,
            fração do pão ("Cordeiro de Deus") e Comunhão.
          </p>
        </Rito>

        {/* Ritos Finais */}
        <Rito numero="IV" titulo="Ritos Finais">
          <p>
            Avisos da comunidade, bênção final e envio ("Ide em paz, e o Senhor vos
            acompanhe" — "Graças a Deus").
          </p>
        </Rito>

        <p className="text-xs text-black/30 mt-8">
          Leituras: liturgia.up.railway.app (CNBB). Estrutura da missa conforme o
          Missal Romano.
        </p>
      </section>
    </>
  );
}
