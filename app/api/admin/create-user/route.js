import { NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/authAdmin';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request) {
  const admin = await exigirAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  }

  const { email, senha, nome, papel } = await request.json();

  if (!email || !senha || !nome || !papel) {
    return NextResponse.json({ error: 'Preencha todos os campos.' }, { status: 400 });
  }
  if (senha.length < 6) {
    return NextResponse.json({ error: 'A senha precisa ter ao menos 6 caracteres.' }, { status: 400 });
  }
  if (!['admin', 'tesouraria', 'lider'].includes(papel)) {
    return NextResponse.json({ error: 'Papel inválido.' }, { status: 400 });
  }

  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, papel },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // O gatilho já cria o perfil com papel "lider" por padrão — garante o papel escolhido.
  await supabaseAdmin.from('perfis').update({ papel, nome }).eq('id', data.user.id);

  return NextResponse.json({ ok: true });
}
