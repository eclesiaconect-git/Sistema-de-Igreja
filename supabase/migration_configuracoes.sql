-- ============================================================
-- MIGRAÇÃO: adiciona configurações editáveis pelo painel
-- Cole isto no SQL Editor do Supabase e clique em RUN.
-- (Se você ainda não rodou o schema.sql nenhuma vez, não precisa
-- rodar este arquivo separado — ele já está incluso no schema.sql)
-- ============================================================

create table if not exists configuracoes (
  id int primary key default 1,
  nome_igreja text not null default 'Nome da Igreja',
  pix_chave text,
  pix_tipo text default 'email',
  pix_nome_recebedor text,
  pix_cidade text default 'BRASIL',
  updated_at timestamptz default now(),
  constraint somente_uma_linha check (id = 1)
);

insert into configuracoes (id, nome_igreja, pix_chave, pix_tipo, pix_nome_recebedor, pix_cidade)
values (1, 'Capela São João da Cruz', '+5583998583409', 'telefone', 'Capela Sao Joao da Cruz', 'QUIXELO')
on conflict (id) do nothing;

alter table configuracoes enable row level security;

create policy "qualquer um le configuracoes" on configuracoes
  for select using (true);

create policy "equipe logada atualiza configuracoes" on configuracoes
  for update using (auth.role() = 'authenticated');
