'use client';

import { useEffect, useState } from 'react';

export default function BannerCarrossel({ banners }) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setIndice((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  const atual = banners[indice];

  const Conteudo = (
    <div className="relative w-full aspect-[16/7] sm:aspect-[16/5] rounded-2xl overflow-hidden border border-ink/10 bg-ink/5">
      <img
        src={atual.imagem_url}
        alt={atual.titulo || ''}
        className="w-full h-full object-cover"
      />
      {atual.titulo && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/70 to-transparent px-4 py-3 sm:px-6 sm:py-4">
          <p className="text-parchment font-display text-base sm:text-lg">{atual.titulo}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
      <div className="relative">
        {atual.link ? (
          <a href={atual.link} target="_blank" rel="noopener noreferrer">
            {Conteudo}
          </a>
        ) : (
          Conteudo
        )}

        {banners.length > 1 && (
          <>
            <button
              onClick={() => setIndice((i) => (i - 1 + banners.length) % banners.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/50 text-parchment flex items-center justify-center hover:bg-ink/70 transition-colors"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={() => setIndice((i) => (i + 1) % banners.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-ink/50 text-parchment flex items-center justify-center hover:bg-ink/70 transition-colors"
              aria-label="Próximo"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndice(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === indice ? 'bg-parchment' : 'bg-parchment/40'
                  }`}
                  aria-label={`Ir para banner ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
