-- ============================================================
-- MIGRAÇÃO: gestão de usuários (papéis/permissões) + transmissão ao vivo
-- Cole no SQL Editor do Supabase e clique em RUN.
-- ============================================================

-- Garante que a tabela perfis tenha e-mail salvo (pra listar sem precisar de chave admin)
alter table perfis add column if not exists email text;

-- Atualiza a função que cria o perfil automaticamente no cadastro, incluindo o e-mail
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome, email, papel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'papel', 'lider')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Preenche o e-mail de quem já existia
update perfis p set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- Só administradores podem alterar o papel de alguém
drop policy if exists "admin atualiza perfis" on perfis;
create policy "admin atualiza perfis" on perfis
  for update using (
    exists (select 1 from perfis p where p.id = auth.uid() and p.papel = 'admin')
  );

-- Link da transmissão ao vivo (YouTube)
alter table configuracoes add column if not exists transmissao_url text;
