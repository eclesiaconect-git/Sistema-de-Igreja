import { createClient } from './supabaseServer';

/**
 * Confirma que existe um usuário logado E que seu papel é "admin".
 * Retorna o usuário se autorizado, ou null se não.
 */
export async function exigirAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from('perfis')
    .select('papel')
    .eq('id', user.id)
    .single();

  if (perfil?.papel !== 'admin') return null;

  return user;
}
