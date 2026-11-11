-- ============================================================
-- MIGRAÇÃO: aniversariantes de dizimistas avulsos
-- Cole isto no SQL Editor do Supabase e clique em RUN.
-- (O campo de aniversário dos membros, "data_nascimento", já existe
-- desde o schema.sql — esta migração adiciona o equivalente para
-- contribuintes avulsos, que não têm cadastro de membro.)
-- ============================================================

alter table dizimos
  add column if not exists data_nascimento_avulso date;
