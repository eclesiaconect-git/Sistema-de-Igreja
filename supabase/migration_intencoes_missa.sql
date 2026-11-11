-- ============================================================
-- MIGRAÇÃO: intenções de missa (com limite por horário)
-- Cole no SQL Editor do Supabase e clique em RUN.
-- ============================================================

alter table configuracoes add column if not exists limite_intencoes_missa int default 10;

create table if not exists intencoes_missa (
  id uuid primary key default gen_random_uuid(),
  nome text,
  contato text,
  intencao text not null,
  titulo_missa text,
  data_missa date not null,
  hora_missa text,
  atendida boolean default false,
  created_at timestamptz default now()
);

alter table intencoes_missa enable row level security;

-- Só a equipe logada pode LER a lista completa (protege privacidade de quem pediu)
create policy "equipe logada le intencoes de missa" on intencoes_missa
  for select using (auth.role() = 'authenticated');

-- Qualquer pessoa pode ENVIAR um pedido
create policy "qualquer um envia intencao de missa" on intencoes_missa
  for insert with check (true);

create policy "equipe logada atualiza intencoes de missa" on intencoes_missa
  for update using (auth.role() = 'authenticated');
create policy "equipe logada apaga intencoes de missa" on intencoes_missa
  for delete using (auth.role() = 'authenticated');

-- Função que conta quantas intenções já existem para uma data+horário específicos,
-- sem precisar dar acesso de leitura pública à tabela inteira (protege privacidade).
create or replace function contar_intencoes_missa(p_data date, p_hora text)
returns int
language sql
security definer
as $$
  select count(*)::int
  from intencoes_missa
  where data_missa = p_data
    and coalesce(hora_missa, '') = coalesce(p_hora, '');
$$;

grant execute on function contar_intencoes_missa(date, text) to anon, authenticated;
