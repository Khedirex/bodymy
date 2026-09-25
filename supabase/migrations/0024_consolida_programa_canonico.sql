-- =====================================================================
-- 0024_consolida_programa_canonico.sql
-- BodyMy — Consolida os programas duplicados num único programa canônico.
--
-- PROBLEMA ENCONTRADO EM PRODUÇÃO:
--   programa              ativo  exercícios  alunas
--   caminhada-japonesa    false      35        20     ← catálogo e alunas
--   pilates-somatico      false       0         0
--   ritual-do-tapetinho   true        0         1     ← o que o app resolvia
--
-- Os três pertencem ao mesmo produto e ficaram com o mesmo nome. O código
-- exige ativo = true, então resolvia para `ritual-do-tapetinho`, que está
-- VAZIO — daí a tela de treino sem exercícios nem alongamentos.
--
-- Causa: a 0021 escolhia o programa com `order by ordem_exibicao limit 1`,
-- mas os três têm ordem_exibicao = 0 (empate → escolha arbitrária) e ela não
-- filtrava por ativo. O catálogo e as alunas foram parar no programa inativo.
--
-- O QUE ESTA MIGRATION FAZ:
--   Elege como canônico o programa que REALMENTE tem o catálogo (mais
--   exercícios), ativa-o, traz para ele as alunas e o histórico dos demais,
--   e desativa os duplicados. Nada é apagado: as aulas dos programas
--   desativados continuam no banco, apenas fora da vitrine.
--
-- Idempotente.
-- =====================================================================

do $$
declare
  v_canon    uuid;
  v_exs      int;
  v_movidas  int;
begin
  -- 1) Canônico = quem tem o catálogo. Desempate determinístico (nada de
  --    ordem_exibicao empatada): mais exercícios, depois mais alunas, depois id.
  select p.id into v_canon
    from public.programs p
   order by (select count(*) from public.exercises e where e.program_id = p.id) desc,
            (select count(*) from public.user_training_config c where c.program_id = p.id) desc,
            p.id
   limit 1;

  if v_canon is null then
    raise exception 'Nenhum programa encontrado.';
  end if;

  select count(*) into v_exs from public.exercises where program_id = v_canon;
  if v_exs = 0 then
    raise exception 'O programa eleito não tem exercícios — abortado para não ativar um catálogo vazio.';
  end if;

  -- 2) Ativa o canônico e dá a ele a primeira posição.
  update public.programs
     set ativo = true, ordem_exibicao = 0
   where id = v_canon;

  -- 3) Traz as alunas dos outros programas. Se a aluna JÁ tem config no
  --    canônico, a linha duplicada é descartada (a boa é a do canônico, que
  --    é onde está o catálogo) — senão colidiria com a PK (user_id, program_id).
  delete from public.user_training_config c
   where c.program_id <> v_canon
     and exists (
       select 1 from public.user_training_config j
        where j.user_id = c.user_id and j.program_id = v_canon
     );

  update public.user_training_config
     set program_id = v_canon, atualizado_em = now()
   where program_id <> v_canon;
  get diagnostics v_movidas = row_count;

  -- 4) Histórico acompanha (training_sessions não tem unique: movimento livre).
  update public.training_sessions
     set program_id = v_canon
   where program_id <> v_canon;

  -- 5) Desativa os duplicados e manda para o fim da ordenação.
  update public.programs
     set ativo = false, ordem_exibicao = 99
   where id <> v_canon
     and product_id in (select product_id from public.programs where id = v_canon);

  -- 6) Identidade final: passamos a trabalhar SÓ com este programa.
  --    Os legados (ritual-do-tapetinho, caminhada-japonesa, pilates-somatico)
  --    ficam arquivados no passo 5, com os nomes de volta para não se
  --    confundirem com o canônico (a 0020 renomeou os três por engano).
  if not exists (select 1 from public.programs where slug = 'descompresion-articular' and id <> v_canon) then
    update public.programs
       set slug = 'descompresion-articular'
     where id = v_canon and slug is distinct from 'descompresion-articular';
  end if;

  update public.programs
     set nome = 'Protocolo Descompresión Articular'
   where id = v_canon and nome is distinct from 'Protocolo Descompresión Articular';

  -- Devolve nomes distintos aos arquivados (eram todos o mesmo texto).
  update public.programs p
     set nome = case p.slug
                  when 'ritual-do-tapetinho' then '[Archivado] Ritual do Tapetinho'
                  when 'caminhada-japonesa'  then '[Archivado] Caminhada Japonesa'
                  when 'pilates-somatico'    then '[Archivado] Pilates Somático'
                  else '[Archivado] ' || p.slug
                end
   where p.id <> v_canon
     and p.slug in ('ritual-do-tapetinho', 'caminhada-japonesa', 'pilates-somatico');

  raise notice 'Canônico: % (% exercícios). Configs movidas: %.', v_canon, v_exs, v_movidas;
end $$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — esperado: UM programa ativo, com 35 exercícios, 10
-- alongamentos e as 21 alunas; os outros dois inativos e zerados.
-- ---------------------------------------------------------------------
select p.slug as programa, p.ativo, p.ordem_exibicao,
       (select count(*) from public.exercises e where e.program_id = p.id)            as exercicios,
       (select count(*) from public.stretches s where s.program_id = p.id)            as alongamentos,
       (select count(*) from public.user_training_config c where c.program_id = p.id) as alunas,
       (select count(*) from public.program_weeks w where w.program_id = p.id)        as semanas
  from public.programs p
 order by p.ativo desc, p.ordem_exibicao, p.slug;
