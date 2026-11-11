import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// ATENÇÃO: este arquivo usa a chave "service role", que tem acesso total
// ao banco de dados, ignorando todas as regras de segurança (RLS).
// Por isso ele SÓ pode ser importado dentro de app/api/ (código de servidor).
// Nunca importe isto em um componente 'use client' ou no navegador.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
