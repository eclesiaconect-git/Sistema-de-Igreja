-- ============================================================
-- SCHEMA DO SISTEMA DA IGREJA
-- Cole este arquivo inteiro no SQL Editor do Supabase e clique em RUN.
-- ============================================================

-- Perfis de usuário (ligado ao login do Supabase Auth)
create table if not exists perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  papel text not null default 'lider' check (papel in ('admin', 'tesouraria', 'lider')),
  created_at timestamptz default now()
);

-- Cria automaticamente um perfil quando um novo usuário se cadastra
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.perfis (id, nome, papel)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', new.email), 'lider');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Membros da igreja
create table if not exists membros (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  email text,
  ministerio text,
  data_nascimento date,
  ativo boolean default true,
  created_at timestamptz default now()
);

-- Dízimos e ofertas
create table if not exists dizimos (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid references membros(id) on delete set null,
  nome_avulso text, -- usado quando não está ligado a um membro cadastrado
  valor numeric(10,2) not null,
  tipo text not null default 'dizimo' check (tipo in ('dizimo', 'oferta', 'outro')),
  data_recebimento date not null default current_date,
  observacao text,
  created_at timestamptz default now()
);

-- Escalas de equipes (louvor, som, recepção etc.)
create table if not exists escalas (
  id uuid primary key default gen_random_uuid(),
  evento text not null,
  data_evento date not null,
  hora text,
  created_at timestamptz default now()
);

create table if not exists escala_membros (
  id uuid primary key default gen_random_uuid(),
  escala_id uuid references escalas(id) on delete cascade,
  membro_id uuid references membros(id) on delete cascade,
  funcao text
);

-- Atividades e horários públicos (missas, cultos, eventos)
create table if not exists atividades (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descricao text,
  data_evento date,
  hora text,
  recorrente boolean default false, -- true para horários fixos semanais (ex: missa de domingo)
  dia_semana int, -- 0=domingo .. 6=sabado, usado quando recorrente=true
  local text,
  created_at timestamptz default now()
);

-- Pedidos de intenção de oração
create table if not exists pedidos_oracao (
  id uuid primary key default gen_random_uuid(),
  nome text,
  contato text,
  pedido text not null,
  mostrar_nome boolean default true,
  atendido boolean default false,
  created_at timestamptz default now()
);

-- Configurações da igreja (nome, dados do PIX) — editável pelo painel
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

insert into configuracoes (id, nome_igreja, pix_cidade)
values (1, 'Nome da Igreja', 'BRASIL')
on conflict (id) do nothing;

-- ============================================================
-- SEGURANÇA (Row Level Security)
-- ============================================================

alter table perfis enable row level security;
alter table membros enable row level security;
alter table dizimos enable row level security;
alter table escalas enable row level security;
alter table escala_membros enable row level security;
alter table atividades enable row level security;
alter table pedidos_oracao enable row level security;
alter table configuracoes enable row level security;

-- PERFIS: cada usuário logado pode ver seu próprio perfil e o de outros da equipe
create policy "usuarios logados veem perfis" on perfis
  for select using (auth.role() = 'authenticated');

-- MEMBROS: só equipe logada acessa
create policy "equipe logada gerencia membros" on membros
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- DIZIMOS: só equipe logada acessa
create policy "equipe logada gerencia dizimos" on dizimos
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ESCALAS: só equipe logada acessa
create policy "equipe logada gerencia escalas" on escalas
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "equipe logada gerencia escala_membros" on escala_membros
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ATIVIDADES: qualquer pessoa (público) pode ler; só equipe logada edita
create policy "qualquer um le atividades" on atividades
  for select using (true);

create policy "equipe logada edita atividades" on atividades
  for insert with check (auth.role() = 'authenticated');
create policy "equipe logada atualiza atividades" on atividades
  for update using (auth.role() = 'authenticated');
create policy "equipe logada apaga atividades" on atividades
  for delete using (auth.role() = 'authenticated');

-- PEDIDOS DE ORAÇÃO: qualquer pessoa pode enviar; só equipe logada lê e gerencia
create policy "qualquer um envia pedido de oracao" on pedidos_oracao
  for insert with check (true);

create policy "equipe logada le pedidos" on pedidos_oracao
  for select using (auth.role() = 'authenticated');
create policy "equipe logada atualiza pedidos" on pedidos_oracao
  for update using (auth.role() = 'authenticated');
create policy "equipe logada apaga pedidos" on pedidos_oracao
  for delete using (auth.role() = 'authenticated');

-- CONFIGURAÇÕES: qualquer pessoa lê (o site público precisa), só equipe logada edita
create policy "qualquer um le configuracoes" on configuracoes
  for select using (true);

create policy "equipe logada atualiza configuracoes" on configuracoes
  for update using (auth.role() = 'authenticated');
