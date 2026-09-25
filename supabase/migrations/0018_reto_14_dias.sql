-- =====================================================================
-- 0018_reto_14_dias.sql
-- BodyMy — Converte o protocolo de 28 dias (4 semanas × 7 dias, níveis
-- v1→v4) no **Reto 14 Días**: o mesmo ciclo de 7 dias roda 2 vezes,
-- com a semana 1 em v1 e a semana 2 em v2.
--
-- Decisões aplicadas:
--   • Conteúdo REAPROVEITADO: os 35 exercícios e as variações continuam
--     como estão. v3/v4 seguem no catálogo, apenas sem uso no reto.
--   • Alunas ativas MIGRADAS PROPORCIONALMENTE: dia 15/28 → dia 8/14
--     (dia14 = ceil(dia28 / 2)).
--   • Produtos RENOMEADOS mantendo id, slug, entitlements e os ids de
--     plataforma (Kiwify/Hotmart) — ninguém perde acesso.
--
-- Idempotente. A migração proporcional roda UMA única vez (controlada por
-- public.app_migrations), porque reaplicá-la comprimiria o progresso de novo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Controle de migrações de DADOS (não-idempotentes por natureza)
-- ---------------------------------------------------------------------
create table if not exists public.app_migrations (
  chave text primary key,
  aplicada_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 1) Alunas ativas: reposiciona proporcionalmente 28 → 14 dias
--    dia28  = (semana_atual - 1) * 7 + dia_atual        (1..28)
--    dia14  = ceil(dia28 / 2)                            (1..14)
--    semana = ((dia14 - 1) / 7) + 1  |  dia = ((dia14 - 1) % 7) + 1
--    (o UPDATE usa os valores ANTIGOS da linha nas duas expressões)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from public.app_migrations where chave = '0018_reposiciona_28_para_14'
  ) then
    update public.user_training_config
       set semana_atual =
             ((ceil((((semana_atual - 1) * 7 + dia_atual))::numeric / 2)::int - 1) / 7) + 1,
           dia_atual =
             ((ceil((((semana_atual - 1) * 7 + dia_atual))::numeric / 2)::int - 1) % 7) + 1,
           atualizado_em = now();

    insert into public.app_migrations (chave) values ('0018_reposiciona_28_para_14');
  end if;
end $$;

-- Quem aguardava a liberação de uma semana que não existe mais (3 ou 4).
-- Guarda defensiva: a coluna vem da 0008. Se por algum motivo ela não
-- existir, seguimos em vez de abortar no meio (o que deixaria os dados já
-- migrados sem as constraints do passo 2).
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name = 'user_training_config'
       and column_name = 'aguardando_liberacao'
  ) then
    update public.user_training_config
       set aguardando_liberacao = 0, atualizado_em = now()
     where aguardando_liberacao > 2;
  end if;
end $$;

-- Níveis por exercício acima de v2 são rebaixados para v2 (teto do reto).
update public.user_exercise_variations
   set variacao_nivel = 2, atualizado_em = now()
 where variacao_nivel > 2;

-- ---------------------------------------------------------------------
-- 2) Constraints acompanham a nova regra (só DEPOIS de migrar os dados)
-- ---------------------------------------------------------------------
alter table public.user_training_config
  drop constraint if exists user_training_config_semana_atual_check;
alter table public.user_training_config
  add constraint user_training_config_semana_atual_check
  check (semana_atual between 1 and 2);

alter table public.user_exercise_variations
  drop constraint if exists user_exercise_variations_variacao_nivel_check;
alter table public.user_exercise_variations
  add constraint user_exercise_variations_variacao_nivel_check
  check (variacao_nivel between 1 and 2);

-- ---------------------------------------------------------------------
-- 3) Liberação de semanas: o reto tem 2, ambas abertas (senão a aluna
--    empacaria no dia 7 esperando o admin liberar).
-- ---------------------------------------------------------------------
delete from public.program_weeks_config where semana > 2;

alter table public.program_weeks_config
  drop constraint if exists program_weeks_config_semana_check;
alter table public.program_weeks_config
  add constraint program_weeks_config_semana_check
  check (semana between 1 and 2);

-- UPDATE + INSERT-se-não-existe em vez de ON CONFLICT: não depende de haver
-- um índice único em program_weeks_config.semana (evita o erro 42P10).
update public.program_weeks_config
   set liberada = true, atualizado_em = now()
 where semana in (1, 2);

insert into public.program_weeks_config (semana, liberada)
select v.semana, true
  from (values (1), (2)) as v(semana)
 where not exists (
   select 1 from public.program_weeks_config p where p.semana = v.semana
 );

-- ---------------------------------------------------------------------
-- 4) Renomeia produtos e programas: "28" → "14", "Protocolo" → "Reto".
--    Mantém id/slug/kiwify_product_id/hotmart_product_id e os entitlements.
-- ---------------------------------------------------------------------
update public.products
   set nome = replace(replace(nome, '28', '14'), 'Protocolo', 'Reto'),
       descricao = replace(replace(coalesce(descricao, ''), '28', '14'), 'Protocolo', 'Reto')
 where slug in ('drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-hormonal')
   and (nome like '%28%' or nome like '%Protocolo%'
        or coalesce(descricao, '') like '%28%' or coalesce(descricao, '') like '%Protocolo%')
   -- Não mexe em nomes já definidos pela 0020 (senão o "Protocolo" do nome
   -- final viraria "Reto" numa reexecução desta migration).
   and nome not ilike '%reto 14%';

-- Duração: sempre 2 semanas no reto, independente do nome.
update public.programs
   set duracao_semanas = 2
 where duracao_semanas <> 2;

-- Nome/descrição: só o replace textual, e nunca sobre um nome já definido
-- pela 0020 (senão "Protocolo ... — Reto 14 días" viraria "Reto ... ").
update public.programs
   set nome = replace(replace(nome, '28', '14'), 'Protocolo', 'Reto'),
       descricao = replace(replace(coalesce(descricao, ''), '28', '14'), 'Protocolo', 'Reto')
 where (nome like '%28%' or nome like '%Protocolo%')
   and nome not ilike '%reto 14%';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select slug, nome from public.products
 where slug in ('drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-hormonal');

select nome, duracao_semanas from public.programs;

select semana, liberada from public.program_weeks_config order by semana;

-- Distribuição das alunas no novo reto (deve ficar tudo em semana 1-2).
select semana_atual, dia_atual, count(*) as alunas
  from public.user_training_config
 group by 1, 2 order by 1, 2;
