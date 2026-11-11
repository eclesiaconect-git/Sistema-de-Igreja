import Link from 'next/link';
import { createClient } from '@/lib/supabaseServer';
import LogoutButton from '@/components/LogoutButton';

const LINKS_BASE = [
  { href: '/painel', label: 'Início' },
  { href: '/painel/membros', label: 'Membros' },
  { href: '/painel/dizimos', label: 'Dízimos' },
  { href: '/painel/escalas', label: 'Escalas' },
  { href: '/painel/atividades', label: 'Atividades' },
  { href: '/painel/publicacoes', label: 'Publicações' },
  { href: '/painel/banners', label: 'Banners' },
  { href: '/painel/galeria', label: 'Galeria' },
  { href: '/painel/oracoes', label: 'Pedidos de oração' },
  { href: '/painel/intencoes-missa', label: 'Intenções de missa' },
  { href: '/painel/oracoes-catalogo', label: 'Biblioteca de orações' },
  { href: '/painel/configuracoes', label: 'Configurações' },
];

export default async function PainelLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let papel = null;
  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('papel')
      .eq('id', user.id)
      .single();
    papel = perfil?.papel;
  }

  const links =
    papel === 'admin'
      ? [...LINKS_BASE, { href: '/painel/usuarios', label: 'Usuários' }]
      : LINKS_BASE;

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      <aside className="sm:w-56 shrink-0 border-b sm:border-b-0 sm:border-r border-ink/10 bg-ink text-parchment">
        <div className="p-6">
          <p className="font-display text-lg">Painel interno</p>
          {user && (
            <p className="text-xs text-parchment/50 mt-1 truncate">
              {user.email}
              {papel && ` · ${papel}`}
            </p>
          )}
        </div>
        <nav className="flex sm:flex-col overflow-x-auto sm:overflow-visible px-3 gap-1 pb-3 sm:pb-0">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap px-3 py-2 rounded-lg text-sm text-parchment/70 hover:bg-[#22C55E] hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 mt-2">
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 bg-parchment">{children}</main>
    </div>
  );
}
