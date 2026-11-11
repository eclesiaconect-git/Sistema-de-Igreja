import './globals.css';
import { getConfig } from '@/lib/config';
import RegistrarServiceWorker from '@/components/RegistrarServiceWorker';

export async function generateMetadata() {
  const config = await getConfig();
  const nome = config.nome_igreja || 'Sistema da Igreja';
  const icone = config.logo_url || '/icons/icon-192.png';

  return {
    title: nome,
    description: 'Horários, atividades, pedidos de oração e dízimo online.',
    themeColor: '#000000',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: nome,
    },
    icons: {
      icon: icone,
      apple: icone,
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="font-body">
        {children}
        <RegistrarServiceWorker />
      </body>
    </html>
  );
}
