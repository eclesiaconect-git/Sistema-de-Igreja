import { getConfig } from '@/lib/config';

export default async function manifest() {
  const config = await getConfig();
  const nome = config.nome_igreja || 'Sistema da Igreja';
  const logo = config.logo_url;

  // Se a igreja já enviou uma logo em Configurações, usa ela como ícone do app.
  // Se não, usa o ícone padrão (cruz dourada) que já vem no projeto.
  const icons = logo
    ? [
        { src: logo, sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: logo, sizes: '512x512', type: 'image/png', purpose: 'any' },
      ]
    : [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        {
          src: '/icons/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ];

  return {
    name: nome,
    short_name: nome.length > 15 ? nome.slice(0, 15) : nome,
    description: 'Horários, atividades, pedidos de oração e dízimo online.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#F6F1E6',
    theme_color: '#000000',
    icons,
  };
}
