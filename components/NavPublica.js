'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabaseClient';

function linkInstagram(v) {
  if (!v) return null;
  return v.startsWith('http') ? v : `https://instagram.com/${v.replace('@', '')}`;
}
function linkFacebook(v) {
  if (!v) return null;
  return v.startsWith('http') ? v : `https://facebook.com/${v}`;
}
function linkWhatsapp(v) {
  if (!v) return null;
  return `https://wa.me/${v.replace(/\D/g, '')}`;
}

function IconesSociais({ redes, tamanho = 'w-8 h-8' }) {
  const itens = [
    redes.instagram && {
      href: linkInstagram(redes.instagram),
      label: 'Instagram',
      style: { background: 'linear-gradient(45deg, #f9ce34, #ee2a7b, #6228d7)' },
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    redes.facebook && {
      href: linkFacebook(redes.facebook),
      label: 'Facebook',
      style: { backgroundColor: '#1877F2' },
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M13 22v-9h3l.5-3.5H13V7.5c0-1 .3-1.7 1.8-1.7H17V2.6c-.3 0-1.4-.1-2.6-.1-2.6 0-4.4 1.6-4.4 4.5V9.5H7V13h3v9h3z" />
        </svg>
      ),
    },
    redes.whatsapp && {
      href: linkWhatsapp(redes.whatsapp),
      label: 'WhatsApp',
      style: { backgroundColor: '#25D366' },
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.85 1h0a7.94 7.94 0 0 0 5.55-13.58zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1 1 12.24-3.51 6.55 6.55 0 0 1-6.65 6.6zm3.62-4.94c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.51.64-.62.76-.23.15-.42.05a5.4 5.4 0 0 1-1.59-.98 6 6 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.29-.35a1.3 1.3 0 0 0 .2-.33.36.36 0 0 0 0-.35c-.05-.1-.44-1.06-.6-1.45s-.32-.33-.44-.33h-.38a.72.72 0 0 0-.53.25 2.2 2.2 0 0 0-.68 1.63 3.8 3.8 0 0 0 .8 2.03 8.7 8.7 0 0 0 3.33 2.95c.47.2.83.32 1.11.41a2.7 2.7 0 0 0 1.22.08 2 2 0 0 0 1.31-.92 1.6 1.6 0 0 0 .11-.92c-.05-.08-.18-.13-.38-.23z" />
        </svg>
      ),
    },
  ].filter(Boolean);

  if (itens.length === 0) return null;

  return (
    <>
      {itens.map((it) => (
        <a
          key={it.label}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          title={it.label}
          style={it.style}
          className={`${tamanho} shrink-0 rounded-full flex items-center justify-center hover:opacity-85 transition-opacity`}
        >
          {it.icon}
        </a>
      ))}
    </>
  );
}

export default function NavPublica({ nome = 'Nossa Igreja', logoUrl = '' }) {
  const NOME_SISTEMA = 'ECLÉSIA CONECT';
  const [aberto, setAberto] = useState(false);
  const [redes, setRedes] = useState({});

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('configuracoes')
      .select('instagram, facebook, whatsapp')
      .eq('id', 1)
      .single()
      .then(({ data }) => data && setRedes(data));
  }, []);

  const links = [
    { href: '/#atividades', label: 'Atividades' },
    { href: '/liturgia', label: 'Liturgia do dia' },
    { href: '/transmissao', label: '🔴 Ao vivo' },
    { href: '/oracao', label: 'Oração' },
    { href: '/doacao', label: 'Dízimo / Oferta', destaque: true },
    { href: '/instalar', label: '📲 Instalar app' },
    { href: '/login', label: 'Entrar', botao: true },
  ];

  return (
    <header className="border-b border-ink/10 bg-parchment/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3">
        <Link href="/" onClick={() => setAberto(false)} className="flex items-center gap-2.5 shrink-0">
          {logoUrl && (
            <img
              src={logoUrl}
              alt=""
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shrink-0 border border-ink/10"
            />
          )}
          <span className="flex flex-col leading-tight">
            <span className="font-display text-base sm:text-lg tracking-tight text-ink whitespace-nowrap">
              {NOME_SISTEMA}
            </span>
            <span className="text-[10px] sm:text-xs text-black/45 whitespace-nowrap -mt-0.5">
              {nome}
            </span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 text-sm font-medium flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-end">
          <Link href="/#atividades" className="shrink-0 px-2.5 py-1.5 rounded-full text-black/70 hover:bg-[#22C55E] hover:text-white transition-colors">
            Atividades
          </Link>
          <Link href="/liturgia" className="shrink-0 px-2.5 py-1.5 rounded-full text-black/70 hover:bg-[#22C55E] hover:text-white transition-colors">
            Liturgia
          </Link>
          <Link href="/transmissao" className="shrink-0 px-2.5 py-1.5 rounded-full text-wine hover:bg-[#22C55E] hover:text-white transition-colors">
            🔴 Ao vivo
          </Link>
          <Link href="/oracao" className="shrink-0 px-2.5 py-1.5 rounded-full text-black/70 hover:bg-[#22C55E] hover:text-white transition-colors">
            Oração
          </Link>
          <Link href="/doacao" className="shrink-0 px-2.5 py-1.5 rounded-full text-gold hover:bg-[#22C55E] hover:text-white transition-colors">
            Dízimo
          </Link>
          <Link
            href="/instalar"
            title="Instalar app no celular"
            className="shrink-0 ml-1 w-8 h-8 flex items-center justify-center rounded-full text-black/60 hover:bg-[#22C55E] hover:text-white transition-colors text-base"
          >
            📲
          </Link>

          <div className="shrink-0 flex items-center gap-1.5 ml-1 pl-2 border-l border-ink/10">
            <IconesSociais redes={redes} tamanho="w-7 h-7" />
          </div>

          <Link
            href="/login"
            className="shrink-0 ml-2 border border-ink/20 rounded-full px-4 py-1.5 text-black/80 hover:bg-[#22C55E] hover:text-white hover:border-transparent transition-colors"
          >
            Entrar
          </Link>
        </nav>

        <div className="sm:hidden flex items-center gap-2 ml-auto shrink-0">
          <IconesSociais redes={redes} tamanho="w-8 h-8" />
          <button
            onClick={() => setAberto(!aberto)}
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg border border-ink/15 text-ink outline-none focus:outline-none"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Abrir menu"
          >
            {aberto ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="sm:hidden border-t border-ink/10 px-4 py-3 flex flex-col gap-1 bg-parchment">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setAberto(false)}
              className={`px-2 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-[#22C55E] hover:text-white ${
                l.botao
                  ? 'border border-ink/20 text-center mt-1'
                  : l.destaque
                  ? 'text-gold'
                  : 'text-black/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
