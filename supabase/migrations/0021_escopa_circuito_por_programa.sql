-- =====================================================================
-- 0021_escopa_circuito_por_programa.sql
-- BodyMy — FASE 1 do suporte a múltiplos protocolos.
--
-- Hoje o circuito é GLOBAL: `exercises` tem unique (dia_do_ciclo, ordem_no_dia)
-- e `stretches` tem unique (ordem) — ou seja, só cabe UM catálogo no banco
-- inteiro. E `user_training_config` tem user_id como PK, então cada aluna só
-- pode estar em um ponto de um único protocolo.
--
-- Esta migration escopa tudo por PROGRAMA, sem mudar comportamento: o
-- protocolo existente é atribuído ao seu programa e tudo segue idêntico.
-- O cadastro de um segundo protocolo (ex.: Rodillas) vem na fase 2.
--
-- Tabelas afetadas:
--   exercises            + program_id   (unique passa a incluir o programa)
--   stretches            + program_id   (idem)
--   program_weeks_config + program_id   (PK vira composta)
--   user_training_config + program_id   (PK vira composta — PROGRESSO DAS ALUNAS)
--   training_sessions    + program_id   (histórico deixa de misturar)
--
-- Idempotente. Aborta com mensagem clara se o programa canônico não existir,
-- em vez de aplicar pela metade.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Descobre o programa canônico (o do protocolo que já está no ar).
-- ---------------------------------------------------------------------
do $$
declare
  v_program_id uuid;
begin
  select p.id into v_program_id
    from public.programs p
    join public.products pr on pr.id = p.product_id
   where pr.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho')
   order by p.ordem_exibicao
   limit 1;

  if v_program_id is null then
    raise exception 'Programa canônico não encontrado (produto drenagem-tailandesa / ritual-do-tapetinho). Rode as migrations anteriores antes desta.';
  end if;

  -- Guarda para os passos seguintes desta mesma migration.
  create temporary table if not exists _prog (id uuid);
  delete from _prog;
  insert into _prog values (v_program_id);
end $$;

-- ---------------------------------------------------------------------
-- 1) exercises
-- ---------------------------------------------------------------------
alter table public.exercises
  add column if not exists program_id uuid references public.programs(id) on delete cascade;

update public.exercises set program_id = (select id from _prog) where program_id is null;

alter table public.exercises alter column program_id set not null;

-- A unicidade passa a ser POR PROGRAMA (antes: só um exercício por slot no
-- banco inteiro — o que impedia um segundo protocolo).
alter table public.exercises drop constraint if exists exercises_dia_do_ciclo_ordem_no_dia_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.exercises'::regclass
       and conname = 'exercises_programa_slot_key'
  ) then
    alter table public.exercises
      add constraint exercises_programa_slot_key unique (program_id, dia_do_ciclo, ordem_no_dia);
  end if;
end $$;

create index if not exists exercises_program_idx
  on public.exercises(program_id, dia_do_ciclo, ordem_no_dia);

-- ---------------------------------------------------------------------
-- 2) stretches
-- ---------------------------------------------------------------------
alter table public.stretches
  add column if not exists program_id uuid references public.programs(id) on delete cascade;

update public.stretches set program_id = (select id from _prog) where program_id is null;

alter table public.stretches alter column program_id set not null;

alter table public.stretches drop constraint if exists stretches_ordem_key;
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.stretches'::regclass
       and conname = 'stretches_programa_ordem_key'
  ) then
    alter table public.stretches
      add constraint stretches_programa_ordem_key unique (program_id, ordem);
  end if;
end $$;

create index if not exists stretches_program_idx on public.stretches(program_id, ordem);

-- ---------------------------------------------------------------------
-- 3) program_weeks_config — liberação de semanas por programa
-- ---------------------------------------------------------------------
alter table public.program_weeks_config
  add column if not exists program_id uuid references public.programs(id) on delete cascade;

update public.program_weeks_config set program_id = (select id from _prog) where program_id is null;

alter table public.program_weeks_config alter column program_id set not null;

alter table public.program_weeks_config drop constraint if exists program_weeks_config_pkey;
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.program_weeks_config'::regclass
       and contype = 'p'
  ) then
    alter table public.program_weeks_config
      add constraint program_weeks_config_pkey primary key (program_id, semana);
  end if;
end $$;

-- A duração agora é propriedade do PROGRAMA (programs.duracao_semanas).
-- Aqui só mantemos um limite sanitário, em vez do teto fixo de 2 semanas.
alter table public.program_weeks_config drop constraint if exists program_weeks_config_semana_check;
alter table public.program_weeks_config
  add constraint program_weeks_config_semana_check check (semana between 1 and 52);

-- ---------------------------------------------------------------------
-- 4) user_training_config — O PROGRESSO DAS ALUNAS
--    user_id (PK) → (user_id, program_id). Nenhuma linha é apagada: cada
--    aluna mantém semana/dia/séries/descanso, agora atrelados ao programa.
-- ---------------------------------------------------------------------
alter table public.user_training_config
  add column if not exists program_id uuid references public.programs(id) on delete cascade;

update public.user_training_config set program_id = (select id from _prog) where program_id is null;

alter table public.user_training_config alter column program_id set not null;

alter table public.user_training_config drop constraint if exists user_training_config_pkey;
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.user_training_config'::regclass
       and contype = 'p'
  ) then
    alter table public.user_training_config
      add constraint user_training_config_pkey primary key (user_id, program_id);
  end if;
end $$;

create index if not exists user_training_config_user_idx
  on public.user_training_config(user_id);

-- O teto de semanas deixa de ser fixo: quem manda é programs.duracao_semanas.
alter table public.user_training_config drop constraint if exists user_training_config_semana_atual_check;
alter table public.user_training_config
  add constraint user_training_config_semana_atual_check check (semana_atual between 1 and 52);

-- ---------------------------------------------------------------------
-- 5) training_sessions — histórico por programa
-- ---------------------------------------------------------------------
alter table public.training_sessions
  add column if not exists program_id uuid references public.programs(id) on delete cascade;

update public.training_sessions set program_id = (select id from _prog) where program_id is null;

alter table public.training_sessions alter column program_id set not null;

create index if not exists training_sessions_program_idx
  on public.training_sessions(user_id, program_id, data);

drop table if exists _prog;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
-- Nenhuma linha órfã (esperado: tudo zero).
select 'exercises sem programa'   as checagem, count(*) from public.exercises where program_id is null
union all select 'stretches sem programa',        count(*) from public.stretches where program_id is null
union all select 'config sem programa',           count(*) from public.user_training_config where program_id is null
union all select 'sessões sem programa',          count(*) from public.training_sessions where program_id is null;

-- Progresso das alunas preservado.
select semana_atual, dia_atual, count(*) as alunas
  from public.user_training_config
 group by 1, 2 order by 1, 2;

-- Catálogo atribuído ao programa certo.
select p.nome as programa,
       (select count(*) from public.exercises e where e.program_id = p.id) as exercicios,
       (select count(*) from public.stretches s where s.program_id = p.id) as alongamentos,
       p.duracao_semanas
  from public.programs p;
