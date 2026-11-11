'use client';

import { useEffect, useState } from 'react';
import NavPublica from '@/components/NavPublica';
import { gerarPayloadPix } from '@/lib/pix';
import { createClient } from '@/lib/supabaseClient';
import QRCode from 'qrcode';

export default function Doacao() {
  const [valor, setValor] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [config, setConfig] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('configuracoes')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        setConfig(data);
        setCarregando(false);
      });
  }, []);

  const chave = config?.pix_chave || '';
  const nomeIgreja = config?.nome_igreja || 'Nossa Igreja';
  const nomeRecebedor = config?.pix_nome_recebedor || nomeIgreja;
  const cidade = config?.pix_cidade || 'BRASIL';

  const payload = chave
    ? gerarPayloadPix({
        chave,
        nomeRecebedor,
        cidade,
        valor: valor ? Number(valor.replace(',', '.')) : undefined,
      })
    : '';

  useEffect(() => {
    if (!payload) return;
    QRCode.toDataURL(payload, { margin: 1, width: 260 }).then(setQrDataUrl);
  }, [payload]);

  function copiar() {
    navigator.clipboard.writeText(payload);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  if (carregando) {
    return (
      <>
        <NavPublica />
        <section className="max-w-lg mx-auto px-6 py-16 text-center text-black/50">
          Carregando...
        </section>
      </>
    );
  }

  if (!chave) {
    return (
      <>
        <NavPublica nome={nomeIgreja} logoUrl={config?.logo_url} />
        <section className="max-w-lg mx-auto px-6 py-16">
          <p className="text-black/60">
            A chave PIX da igreja ainda não foi configurada. Peça a um administrador
            para preencher em <strong>Painel → Configurações</strong>.
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      <NavPublica nome={nomeIgreja} logoUrl={config?.logo_url} />
      <section className="max-w-lg mx-auto px-6 py-16 text-center">
        <p className="text-gold font-medium tracking-widest text-xs uppercase mb-3">
          Dízimo e ofertas
        </p>
        <h1 className="font-display text-3xl text-ink mb-3">Contribua via PIX</h1>
        <p className="text-black/60 text-sm mb-8">
          Aponte a câmera do seu banco para o código abaixo, ou copie a chave.
        </p>

        <div className="mb-6 text-left">
          <label className="block text-sm font-medium text-black/70 mb-1">
            Valor (opcional)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="Ex: 50,00 — deixe em branco para digitar no app do banco"
            className="w-full rounded-xl border border-ink/15 px-4 py-2.5 bg-white/60 focus:border-gold outline-none text-center"
          />
        </div>

        {qrDataUrl && (
          <img
            src={qrDataUrl}
            alt="QR Code PIX"
            className="mx-auto rounded-2xl border border-ink/10 p-3 bg-white mb-6"
            width={260}
            height={260}
          />
        )}

        <button
          onClick={copiar}
          className="w-full rounded-full bg-gold text-ink font-medium py-3 hover:bg-wine hover:text-parchment transition-colors"
        >
          {copiado ? 'Código copiado!' : 'Copiar código PIX'}
        </button>

        <p className="text-xs text-black/40 mt-6">
          Chave PIX: {chave} · {nomeRecebedor}
        </p>
      </section>
    </>
  );
}
