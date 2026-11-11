'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import NavPublica from '@/components/NavPublica';
import { createClient } from '@/lib/supabaseClient';

export default function Categoria() {
  const params = useParams();
  const categoria = decodeURIComponent(params.categoria);

  const [oracoes, setOracoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [nomeIgreja, setNomeIgreja] = useState('Nossa Igreja');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('configuracoes')
      .select('nome_igreja, logo_url')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          data.nome_igreja && setNomeIgreja(data.nome_igreja);
          setLogoUrl(data.logo_url || '');
        }
      });

    supabase
      .from('oracoes_catalogo')
      .select('*')
      .eq('categoria', categoria)
      .order('ordem')
      .then(({ data }) => {
        setOracoes(data || []);
        setCarregando(false);
      });
  }, [categoria]);

  return (
    <>
      <NavPublica nome={nomeIgreja} logoUrl={logoUrl} />

      <section className="max-w-lg mx-auto px-6 py-10 sm:py-16">
        <Link href="/oracao" className="text-sm text-black/50 hover:text-ink">
          ← Voltar para as categorias
        </Link>

        <h1 className="font-display text-3xl text-ink mt-4 mb-8">{categoria}</h1>

        {carregando ? (
          <p className="text-black/50 text-sm">Carregando...</p>
        ) : oracoes.length === 0 ? (
          <p className="text-black/50 text-sm">Nenhuma oração nesta categoria ainda.</p>
        ) : (
          <div className="space-y-3">
            {oracoes.map((o) => (
              <details
                key={o.id}
                className="border border-ink/10 rounded-2xl p-5 bg-white/40 group"
              >
                <summary className="cursor-pointer list-none flex items-center justify-between">
                  <span className="font-display text-lg text-ink">{o.titulo}</span>
                  <span className="text-black/40 group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="text-sm text-black/80 leading-relaxed whitespace-pre-line mt-4">
                  {o.texto}
                </p>
              </details>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
