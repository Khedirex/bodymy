-- =====================================================================
-- 0010_bloco_mobilidade.sql
-- BodyMy — Semana Zero deixa de existir; os 10 alongamentos viram um
-- BLOCO DE MOBILIDADE executado todo dia, antes do circuito.
--
-- Idempotente. Faz:
--   1. Migra alunas: quem estava na Semana Zero (semana_zero_completa=false)
--      passa para Semana 1, Dia 1. Quem já estava no circuito não muda.
--   2. Remove as colunas obsoletas de Semana Zero.
--   3. stretches: duração fixa 30s + coluna `lados` (1 simples, 2 bilateral,
--      3 = pescoço em três direções). A tabela CONTINUA — só muda de função.
--   4. training_sessions.alongou — registra adesão ao alongamento por sessão.
-- =====================================================================

-- 1 + 2. Migração das alunas e limpeza do modelo (só se a coluna existir).
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'user_training_config'
       and column_name = 'semana_zero_completa'
  ) then
    update public.user_training_config
       set semana_atual = 1, dia_atual = 1, atualizado_em = now()
     where semana_zero_completa = false;
  end if;
end $$;

alter table public.user_training_config drop column if exists semana_zero_completa;
alter table public.user_training_config drop column if exists semana_zero_dias;

-- 3. stretches: duração fixa 30s + lados.
alter table public.stretches
  add column if not exists lados int not null default 1 check (lados between 1 and 3);
update public.stretches set duracao_seg = 30 where duracao_seg is null or duracao_seg <> 30;
update public.stretches set lados = 2
 where nome in ('Torção deitada', 'Alongar atrás da perna', 'Quadril em quatro') and lados <> 2;
update public.stretches set lados = 3
 where nome = 'Pescoço em três direções' and lados <> 3;

-- 4. Adesão ao alongamento por sessão (null = sessão antiga / desconhecido).
alter table public.training_sessions add column if not exists alongou boolean;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select * from (values
  ('colunas semana_zero removidas', (select case when not exists (select 1 from information_schema.columns where table_name='user_training_config' and column_name like 'semana_zero%') then 'OK' else 'FALTA' end)),
  ('coluna stretches.lados', (select case when exists (select 1 from information_schema.columns where table_name='stretches' and column_name='lados') then 'OK' else 'FALTA' end)),
  ('coluna training_sessions.alongou', (select case when exists (select 1 from information_schema.columns where table_name='training_sessions' and column_name='alongou') then 'OK' else 'FALTA' end)),
  ('alongamentos bilaterais (lados=2)', (select count(*)::text from public.stretches where lados=2)),
  ('alongamento pescoço (lados=3)', (select count(*)::text from public.stretches where lados=3))
) as v(verificacao, valor) order by verificacao;
