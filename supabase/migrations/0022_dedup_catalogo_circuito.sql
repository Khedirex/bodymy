-- =====================================================================
-- 0022_dedup_catalogo_circuito.sql
-- BodyMy — Remove as duplicatas do catálogo do circuito e RECRIA as
-- constraints de unicidade que estão faltando em produção.
--
-- Contexto: a 0021 falhou com 23505 ao criar a unique por programa, porque
-- exercises tem linhas duplicadas no mesmo slot. A causa é a mesma da 0019:
-- as uniques declaradas nas migrations não existem no banco, então entrou
-- conteúdo repetido.
--
-- Diagnóstico da produção (consultas 4A/4B e 5):
--   lote 12/08 →  35 exercícios, 21 com vídeo, 105 registros de histórico
--   lote 23/09 → 119 exercícios,  0 com vídeo,   0 histórico, 0 dado de aluna
-- O lote novo é inerte (rascunhos de vários protocolos no catálogo global).
--
-- REGRA DE DESEMPATE (não é "apagar o mais novo" às cegas): por slot,
-- sobrevive a linha MAIS USADA — mais histórico, depois mais vídeos, e só
-- então a mais antiga. Assim, se um dia o conteúdo bom for o recente, ele
-- é preservado.
--
-- NADA é apagado sem cópia: tudo vai para tabelas backup_* antes.
-- Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Backup do que será removido (inspecionável e restaurável)
-- ---------------------------------------------------------------------
create table if not exists public.backup_dedup_exercises (like public.exercises including defaults);
create table if not exists public.backup_dedup_exercise_variations (like public.exercise_variations including defaults);
create table if not exists public.backup_dedup_stretches (like public.stretches including defaults);

-- Ranqueia por slot: rn = 1 é quem fica.
create temporary view _ex_rank as
select e.id,
       row_number() over (
         partition by e.dia_do_ciclo, e.ordem_no_dia
         order by (select count(*) from public.session_exercises s where s.exercise_id = e.id) desc,
                  (select count(*) from public.exercise_variations v
                    where v.exercise_id = e.id and v.panda_video_id is not null) desc,
                  e.created_at asc
       ) as rn
  from public.exercises e;

insert into public.backup_dedup_exercise_variations
select v.* from public.exercise_variations v
 where v.exercise_id in (select id from _ex_rank where rn > 1)
   and not exists (select 1 from public.backup_dedup_exercise_variations b where b.id = v.id);

insert into public.backup_dedup_exercises
select e.* from public.exercises e
 where e.id in (select id from _ex_rank where rn > 1)
   and not exists (select 1 from public.backup_dedup_exercises b where b.id = e.id);

-- ---------------------------------------------------------------------
-- 2) Remove as duplicatas de exercises
--    (o cascade leva junto as exercise_variations já copiadas acima)
-- ---------------------------------------------------------------------
delete from public.exercises where id in (select id from _ex_rank where rn > 1);

drop view if exists _ex_rank;

-- ---------------------------------------------------------------------
-- 3) Mesma coisa para stretches (nada referencia stretches: sem cascade)
-- ---------------------------------------------------------------------
create temporary view _st_rank as
select s.id,
       row_number() over (
         partition by s.ordem
         order by (s.panda_video_id is not null) desc, s.created_at asc
       ) as rn
  from public.stretches s;

insert into public.backup_dedup_stretches
select s.* from public.stretches s
 where s.id in (select id from _st_rank where rn > 1)
   and not exists (select 1 from public.backup_dedup_stretches b where b.id = s.id);

delete from public.stretches where id in (select id from _st_rank where rn > 1);

drop view if exists _st_rank;

-- ---------------------------------------------------------------------
-- 4) Recria as uniques que faltavam (é o que permitiu a bagunça)
--    A 0021 vai trocá-las pelas versões por programa logo depois.
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.exercises'::regclass
       and conname = 'exercises_dia_do_ciclo_ordem_no_dia_key'
  ) then
    alter table public.exercises
      add constraint exercises_dia_do_ciclo_ordem_no_dia_key unique (dia_do_ciclo, ordem_no_dia);
  end if;

  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.stretches'::regclass
       and conname = 'stretches_ordem_key'
  ) then
    alter table public.stretches add constraint stretches_ordem_key unique (ordem);
  end if;
end $$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — esperado: 35 exercícios, 10 alongamentos, 0 duplicatas,
-- e o histórico/vídeos intactos.
-- ---------------------------------------------------------------------
select 'exercises' as tabela, count(*) as linhas from public.exercises
union all select 'stretches', count(*) from public.stretches
union all select 'backup exercises', count(*) from public.backup_dedup_exercises
union all select 'backup stretches', count(*) from public.backup_dedup_stretches;

select 'slots duplicados' as checagem, count(*) from (
  select 1 from public.exercises group by dia_do_ciclo, ordem_no_dia having count(*) > 1
) d;

-- O que sobreviveu tem que ser o conteúdo em uso.
select count(*) filter (where v.panda_video_id is not null) as variacoes_com_video,
       (select count(*) from public.session_exercises)      as registros_historico
  from public.exercise_variations v;
