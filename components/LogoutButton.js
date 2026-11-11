'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();

  async function sair() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      className="w-full text-left px-3 py-2 rounded-lg text-sm text-parchment/70 transition-colors hover:bg-[#22C55E] hover:text-white"
    >
      Sair
    </button>
  );
}
