import NavPublica from '@/components/NavPublica';
import { getConfig } from '@/lib/config';
import { youtubeEmbedUrl } from '@/lib/youtube';

export default async function Transmissao() {
  const config = await getConfig();
  const embedUrl = youtubeEmbedUrl(config.transmissao_url);

  return (
    <>
      <NavPublica nome={config.nome_igreja} logoUrl={config.logo_url} />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <p className="text-gold font-medium tracking-widest text-xs uppercase mb-3">
          Ao vivo
        </p>
        <h1 className="font-display text-3xl text-ink mb-6">Transmissão</h1>

        {embedUrl ? (
          <div className="rounded-2xl overflow-hidden border border-ink/10 bg-ink aspect-video">
            <iframe
              src={embedUrl}
              title="Transmissão ao vivo"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="border border-ink/10 rounded-2xl p-8 bg-white/50 text-center">
            <p className="text-ink/60">
              Nenhuma transmissão configurada no momento.
            </p>
            <p className="text-sm text-ink/40 mt-2">
              Volte durante o horário da celebração para assistir ao vivo.
            </p>
          </div>
        )}
      </section>
    </>
  );
}
