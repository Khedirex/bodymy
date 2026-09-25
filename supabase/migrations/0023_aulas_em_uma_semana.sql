-- =====================================================================
-- 0023_aulas_em_uma_semana.sql
-- BodyMy — Consolida TODAS as aulas do programa na primeira semana.
--
-- Por quê: o reto passou a ter 2 semanas, mas o material de leitura
-- ("Comprende la práctica", /entenda) continuava dividido em Semana 1..4 —
-- a aluna via semanas que não existem mais no plano.
--
-- O que faz: move todos os `program_days` para a semana 1, renumerando de
-- 1 a N na ordem original (semana 2 dia 1 vira dia 8, e assim por diante),
-- e remove as semanas que ficaram vazias.
--
-- Nenhuma aula é apagada: `lessons` aponta para `program_days`, e os dias
-- são MOVIDOS, não recriados. As semanas 2+ só são removidas depois de
-- ficarem sem dias (senão o ON DELETE CASCADE levaria as aulas junto).
--
-- Não mexe no circuito: `program_weeks` (leitura) é outra tabela, separada
-- de `program_weeks_config` (liberação de semanas do treino).
--
-- Idempotente.
-- =====================================================================

do $$
declare
  v_program_id uuid;
  v_week1_id   uuid;
  v_total      int;
begin
  -- Programa canônico (o do protocolo no ar).
  select p.id into v_program_id
    from public.programs p
    join public.products pr on pr.id = p.product_id
   where pr.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho')
   order by p.ordem_exibicao
   limit 1;

  if v_program_id is null then
    raise exception 'Programa canônico não encontrado. Rode as migrations anteriores antes desta.';
  end if;

  select id into v_week1_id
    from public.program_weeks
   where program_id = v_program_id and numero = 1;

  if v_week1_id is null then
    raise exception 'Semana 1 do programa não encontrada — nada a consolidar.';
  end if;

  -- 1) Desloca a numeração para uma faixa livre. Sem isto, o UPDATE do
  --    passo 2 esbarraria em unique (week_id, numero) no meio do caminho.
  update public.program_days d
     set numero = d.numero + 1000
   where d.week_id in (select id from public.program_weeks where program_id = v_program_id)
     and d.numero < 1000;

  -- 2) Move tudo para a semana 1, renumerando na ordem original.
  with ordenado as (
    select d.id,
           row_number() over (order by w.numero, d.numero) as n
      from public.program_days d
      join public.program_weeks w on w.id = d.week_id
     where w.program_id = v_program_id
  )
  update public.program_days d
     set week_id = v_week1_id,
         numero = o.n
    from ordenado o
   where o.id = d.id;

  -- 3) Remove as semanas que ficaram vazias (seguro: já não têm dias).
  delete from public.program_weeks w
   where w.program_id = v_program_id
     and w.numero <> 1
     and not exists (select 1 from public.program_days d where d.week_id = w.id);

  -- 4) O título da semana 1 deixa de fazer sentido como cabeçalho de tudo.
  select count(*) into v_total from public.program_days where week_id = v_week1_id;
  update public.program_weeks
     set titulo = 'Todas las lecturas'
   where id = v_week1_id
     and titulo is distinct from 'Todas las lecturas';

  raise notice 'Aulas consolidadas na semana 1: % dias.', v_total;
end $$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — esperado: 1 semana, com todas as aulas, numeradas 1..N.
-- ---------------------------------------------------------------------
select w.numero as semana, w.titulo,
       count(d.id) as dias,
       (select count(*) from public.lessons l
         join public.program_days d2 on d2.id = l.day_id
        where d2.week_id = w.id) as aulas
  from public.program_weeks w
  left join public.program_days d on d.week_id = w.id
  join public.programs p on p.id = w.program_id
  join public.products pr on pr.id = p.product_id
 where pr.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho')
 group by w.id, w.numero, w.titulo
 order by w.numero;

-- Nenhuma aula pode ter ficado órfã.
select count(*) as aulas_totais from public.lessons;
