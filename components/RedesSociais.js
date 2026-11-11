export default function RedesSociais({ instagram, facebook, whatsapp, className = '' }) {
  const links = [
    instagram && {
      href: instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`,
      label: 'Instagram',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    facebook && {
      href: facebook.startsWith('http') ? facebook : `https://facebook.com/${facebook}`,
      label: 'Facebook',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    whatsapp && {
      href: `https://wa.me/${whatsapp.replace(/\D/g, '')}`,
      label: 'WhatsApp',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.6 6.32A7.85 7.85 0 0 0 12.05 4a7.94 7.94 0 0 0-6.9 11.9L4 20l4.2-1.1a7.9 7.9 0 0 0 3.85 1h0a7.94 7.94 0 0 0 5.55-13.58zm-5.55 12.2h0a6.6 6.6 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.6 6.6 0 1 1 12.24-3.51 6.55 6.55 0 0 1-6.65 6.6zm3.62-4.94c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.51.64-.62.76-.23.15-.42.05a5.4 5.4 0 0 1-1.59-.98 6 6 0 0 1-1.1-1.37c-.12-.2 0-.3.09-.4s.2-.23.29-.35a1.3 1.3 0 0 0 .2-.33.36.36 0 0 0 0-.35c-.05-.1-.44-1.06-.6-1.45s-.32-.33-.44-.33h-.38a.72.72 0 0 0-.53.25 2.2 2.2 0 0 0-.68 1.63 3.8 3.8 0 0 0 .8 2.03 8.7 8.7 0 0 0 3.33 2.95c.47.2.83.32 1.11.41a2.7 2.7 0 0 0 1.22.08 2 2 0 0 0 1.31-.92 1.6 1.6 0 0 0 .11-.92c-.05-.08-.18-.13-.38-.23z" />
        </svg>
      ),
    },
  ].filter(Boolean);

  if (links.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={l.label}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-ink/15 text-ink/60 hover:text-white hover:bg-[#22C55E] hover:border-transparent transition-colors"
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}
