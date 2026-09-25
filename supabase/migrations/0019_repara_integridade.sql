-- =====================================================================
-- 0019_repara_integridade.sql
-- BodyMy — Repara constraints de unicidade que estão FALTANDO no banco de
-- produção e limpa as duplicatas que elas deveriam ter impedido.
--
-- Sintoma que motivou esta migration:
--   "42P10: there is no unique or exclusion constraint matching the
--    ON CONFLICT specification" + program_weeks_config com 5 linhas para a
--   semana 1 e 2 linhas contraditórias para a semana 2.
--
-- O que faz:
--   1) program_weeks_config: deduplica (mantém a linha liberada quando há
--      conflito), remove semanas fora do reto de 14 dias e RECRIA a PK.
--   2) products.slug: cria o índice único se não existir. Se houver slugs
--      duplicados, NÃO apaga nada — apenas avisa quais são, porque produtos
--      têm entitlements apontando para o id e a fusão precisa ser decidida
--      caso a caso.
--
-- Idempotente e não-destrutiva para dados de aluna.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) program_weeks_config — deduplicar e restaurar a PK
-- ---------------------------------------------------------------------

-- Fora do reto de 14 dias (semanas 3 e 4 do protocolo antigo).
delete from public.program_weeks_config where semana > 2;

-- Deduplica: no reto de 14 dias as DUAS semanas nascem liberadas (ver 0018),
-- então o estado correto é exatamente 2 linhas, ambas true. Zeramos e
-- reinserimos — nenhuma aluna perde acesso, já que ambas ficam liberadas.
delete from public.program_weeks_config;

-- Reinsere uma linha por semana do reto, ambas liberadas.
insert into public.program_weeks_config (semana, liberada)
select v.semana, true
  from (values (1), (2)) as v(semana)
 where not exists (
   select 1 from public.program_weeks_config p where p.semana = v.semana
 );

-- Restaura a PRIMARY KEY (é ela que faltava e permitiu as duplicatas).
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.program_weeks_config'::regclass
       and contype = 'p'
  ) then
    alter table public.program_weeks_config
      add constraint program_weeks_config_pkey primary key (semana);
  end if;
end $$;

-- Teto do reto de 14 dias.
alter table public.program_weeks_config
  drop constraint if exists program_weeks_config_semana_check;
alter table public.program_weeks_config
  add constraint program_weeks_config_semana_check
  check (semana between 1 and 2);

-- ---------------------------------------------------------------------
-- 2) products.slug — restaurar a unicidade (sem destruir dados)
-- ---------------------------------------------------------------------
do $$
declare
  duplicados text;
  tem_unico boolean;
begin
  -- Olha pg_index (não pg_constraint): a unicidade pode vir tanto de uma
  -- constraint quanto de um índice único solto — os dois satisfazem o
  -- ON CONFLICT e os dois precisam ser detectados aqui.
  select exists (
    select 1
      from pg_index i
     where i.indrelid = 'public.products'::regclass
       and i.indisunique
       and i.indnkeyatts = 1
       and (
         select a.attname from pg_attribute a
          where a.attrelid = i.indrelid and a.attnum = i.indkey[0]
       ) = 'slug'
  ) into tem_unico;

  if tem_unico then
    raise notice 'products.slug já é único — nada a fazer.';
    return;
  end if;

  select string_agg(slug || ' (' || n || 'x)', ', ')
    into duplicados
    from (
      select slug, count(*) as n
        from public.products
       group by slug
      having count(*) > 1
    ) d;

  if duplicados is not null then
    -- NÃO apagamos: entitlements apontam para products.id. Resolver na mão.
    raise warning 'products.slug DUPLICADO, índice único NÃO criado. Slugs: %', duplicados;
  else
    create unique index if not exists products_slug_key on public.products(slug);
    raise notice 'Índice único products_slug_key criado.';
  end if;
end $$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — o esperado é: 2 linhas (1 e 2), ambas true.
-- ---------------------------------------------------------------------
select semana, liberada from public.program_weeks_config order by semana;

-- Constraints de unicidade presentes agora.
select c.relname as tabela, con.conname, con.contype
  from pg_constraint con
  join pg_class c on c.oid = con.conrelid
 where c.relname in ('program_weeks_config', 'products')
   and con.contype in ('p', 'u')
 order by 1, 2;

-- Slugs duplicados que ainda precisam de decisão manual (esperado: vazio).
select slug, count(*) as copias
  from public.products
 group by slug having count(*) > 1;
