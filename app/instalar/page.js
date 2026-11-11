import QRCode from 'qrcode';
import NavPublica from '@/components/NavPublica';
import BotaoInstalar from '@/components/BotaoInstalar';
import { getConfig } from '@/lib/config';

const SITE_URL = 'https://sistemade-igreja.vercel.app';

export default async function Instalar() {
  const config = await getConfig();
  const qrDataUrl = await QRCode.toDataURL(SITE_URL, { margin: 1, width: 240 });

  return (
    <>
      <NavPublica nome={config.nome_igreja} logoUrl={config.logo_url} />

      <section className="max-w-lg mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
        <p className="text-gold font-medium tracking-widest text-xs uppercase mb-3">
          App da igreja
        </p>
        <h1 className="font-display text-3xl text-ink mb-3">
          Instale no seu celular
        </h1>
        <p className="text-ink/60 text-sm mb-8">
          É grátis, não ocupa espaço de loja e fica com atalho na tela
          inicial, como um app de verdade.
        </p>

        {/* Botão de instalação direta (aparece quando o navegador permite) */}
        <div className="mb-8">
          <BotaoInstalar />
        </div>

        <p className="text-xs text-ink/40 mb-3">
          Está vendo isso em outro aparelho? Escaneie o código abaixo:
        </p>
        <img
          src={qrDataUrl}
          alt="QR Code para instalar o app"
          className="mx-auto rounded-2xl border border-ink/10 p-4 bg-white mb-8"
          width={240}
          height={240}
        />

        <div className="text-left border border-ink/10 rounded-2xl p-5 bg-white/50 space-y-4">
          <div>
            <p className="font-display text-base text-ink mb-1">No Android (Chrome)</p>
            <p className="text-sm text-ink/60">
              Toque no botão "Instalar agora" acima. Se ele não aparecer, toque
              nos três pontinhos (⋮) no canto superior direito e escolha
              <strong> "Instalar aplicativo"</strong>.
            </p>
          </div>
          <div>
            <p className="font-display text-base text-ink mb-1">No iPhone (Safari)</p>
            <p className="text-sm text-ink/60">
              A Apple não permite instalação automática — toque no ícone de
              compartilhar (□↑) e escolha <strong>"Adicionar à Tela de Início"</strong>.
            </p>
          </div>
          <div>
            <p className="font-display text-base text-ink mb-1">No computador</p>
            <p className="text-sm text-ink/60">
              Toque no botão "Instalar agora" acima, ou clique no ícone de
              instalação do lado direito da barra de endereço.
            </p>
          </div>
        </div>

        <p className="text-xs text-ink/30 mt-6">{SITE_URL}</p>
      </section>
    </>
  );
}
