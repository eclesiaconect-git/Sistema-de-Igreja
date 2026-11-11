import { NextResponse } from 'next/server';
import { exigirAdmin } from '@/lib/authAdmin';
import { createAdminClient } from '@/lib/supabaseAdmin';

export async function POST(request) {
  const admin = await exigirAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID não informado.' }, { status: 400 });
  }
  if (id === admin.id) {
    return NextResponse.json(
      { error: 'Você não pode excluir a própria conta por aqui.' },
      { status: 400 }
    );
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
