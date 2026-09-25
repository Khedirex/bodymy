-- =====================================================================
-- DIAGNÓSTICO (somente leitura) — duplicatas no catálogo do circuito
-- Não altera nada. Rode e me mande os 5 resultados.
-- =====================================================================

-- 1) Tamanho do catálogo. Esperado: 35 exercícios e 10 alongamentos.
--    Se vier 70 / 20, a seed rodou duas vezes.
select 'exercises' as tabela, count(*) as linhas from public.exercises
union all
select 'stretches', count(*) from public.stretches;

-- 2) As constraints de unicidade existem? (é a ausência delas que permitiu
--    as duplicatas). Esperado hoje: provavelmente VAZIO.
select c.relname as tabela, con.conname, pg_get_constraintdef(con.oid) as definicao
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
 where c.relname in ('exercises', 'stretches')
   and con.contype in ('p', 'u')
 order by 1, 2;

-- 3) Quais slots estão duplicados e quantas cópias cada um tem.
select dia_do_ciclo, ordem_no_dia, count(*) as copias
  from public.exercises
 group by 1, 2
having count(*) > 1
 order by 1, 2;

-- 4) O PONTO CRÍTICO: cada cópia tem vídeo ou dado de aluna preso nela?
--    Se as duplicatas estiverem todas zeradas, a limpeza é trivial.
--    Se houver vídeo/dados espalhados entre as cópias, precisamos fundir.
select e.dia_do_ciclo,
       e.ordem_no_dia,
       e.id,
       e.nome,
       e.created_at,
       (select count(*) from public.exercise_variations v
         where v.exercise_id = e.id) as variacoes,
       (select count(*) from public.exercise_variations v
         where v.exercise_id = e.id and v.panda_video_id is not null) as com_video,
       (select count(*) from public.user_exercise_variations u
         where u.exercise_id = e.id) as alunas_com_nivel,
       (select count(*) from public.session_exercises s
         where s.exercise_id = e.id) as registros_historico
  from public.exercises e
 where (e.dia_do_ciclo, e.ordem_no_dia) in (
        select dia_do_ciclo, ordem_no_dia
          from public.exercises
         group by 1, 2 having count(*) > 1
      )
 order by e.dia_do_ciclo, e.ordem_no_dia, e.created_at;

-- 5) Mesma checagem para os alongamentos.
select s.ordem, s.id, s.nome, s.created_at,
       (s.panda_video_id is not null) as tem_video
  from public.stretches s
 where s.ordem in (select ordem from public.stretches group by ordem having count(*) > 1)
 order by s.ordem, s.created_at;
