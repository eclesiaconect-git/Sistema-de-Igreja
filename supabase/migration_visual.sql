-- ============================================================
-- MIGRAÇÃO: seção "Sobre", foto de capa e redes sociais
-- Cole no SQL Editor do Supabase e clique em RUN.
--
-- ANTES de rodar, crie o bucket no Storage:
--   Storage -> New bucket -> nome: capa -> marque "Public bucket" -> Create
-- ============================================================

alter table configuracoes add column if not exists sobre_texto text;
alter table configuracoes add column if not exists nome_paroco text;
alter table configuracoes add column if not exists capa_url text;
alter table configuracoes add column if not exists instagram text;
alter table configuracoes add column if not exists facebook text;
alter table configuracoes add column if not exists whatsapp text;

create policy "qualquer um ve a capa"
  on storage.objects for select using (bucket_id = 'capa');
create policy "equipe logada envia a capa"
  on storage.objects for insert with check (bucket_id = 'capa' and auth.role() = 'authenticated');
create policy "equipe logada substitui a capa"
  on storage.objects for update using (bucket_id = 'capa' and auth.role() = 'authenticated');
create policy "equipe logada remove a capa"
  on storage.objects for delete using (bucket_id = 'capa' and auth.role() = 'authenticated');
