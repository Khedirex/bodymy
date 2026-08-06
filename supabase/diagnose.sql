-- =====================================================================
--  BodyMy — Diagnóstico de leitura da vitrine (rode no SQL Editor do
--  projeto de PRODUÇÃO). Não altera nada — só mostra o estado.
--
--  Objetivo: descobrir por que /descubra pode falhar. Confere policies
--  de RLS, GRANTs para o role authenticated, e se os seeds rodaram.
-- =====================================================================

-- 1) As tabelas do catálogo têm policy de SELECT para 'authenticated'?
--    (A vitrine precisa ler products/programs/diet_plans mesmo bloqueados.)
select
  tablename,
  policyname,
  cmd,
  roles
from pg_policies
where schemaname = 'public'
  and tablename in ('products','programs','program_weeks','program_days','diet_plans','diet_days','entitlements')
order by tablename, policyname;

-- 2) O role 'authenticated' tem GRANT de SELECT nessas tabelas?
--    (RLS não basta: sem GRANT, o PostgREST devolve permission denied.)
select
  table_name,
  has_table_privilege('authenticated', 'public.' || table_name, 'SELECT') as authenticated_pode_select
from (values
  ('products'),('programs'),('program_weeks'),('program_days'),
  ('diet_plans'),('diet_days'),('entitlements'),('profiles')
) as t(table_name)
order by table_name;

-- 3) RLS está HABILITADA nessas tabelas? (deve estar 'true')
select relname as tabela, relrowsecurity as rls_habilitada
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('products','programs','diet_plans','diet_days','entitlements','profiles')
order by relname;

-- 4) Os seeds rodaram? Contagens esperadas: products>=3, programs>=1,
--    program_days=28, lessons=28, diet_plans>=1, diet_days=7.
select 'products' as tabela, count(*) from public.products
union all select 'programs', count(*) from public.programs
union all select 'program_days', count(*) from public.program_days
union all select 'lessons', count(*) from public.lessons
union all select 'diet_plans', count(*) from public.diet_plans
union all select 'diet_days', count(*) from public.diet_days
union all select 'entitlements', count(*) from public.entitlements
order by tabela;

-- 5) products tem as colunas esperadas? (deve listar kiwify_product_id,
--    kiwify_checkout_url, sales_page, ativo, etc.)
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'products'
order by ordinal_position;
