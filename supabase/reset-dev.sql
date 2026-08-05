-- =====================================================================
--  BodyMy — RESET DE DESENVOLVIMENTO (schema consolidado)
--
--  ⚠️⚠️  APAGA TODOS OS DADOS DO SCHEMA public DO PROJETO  ⚠️⚠️
--  NUNCA rode isto em produção com clientes reais. Uso exclusivo para
--  reparar um banco de dev em estado inconsistente (migrations parciais/
--  fora de ordem).
--
--  Como usar: cole este arquivo INTEIRO no SQL Editor do Supabase e
--  execute de uma vez. É idempotente — pode rodar quantas vezes quiser.
--
--  Fonte da verdade para produção continua sendo as migrations numeradas
--  em supabase/migrations (0001..0004). Este arquivo reproduz exatamente
--  o MESMO schema final delas, num único passo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Extensão necessária
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- 1) DROP de tudo que é nosso (idempotente)
--    CASCADE remove FKs, índices, policies e triggers das tabelas.
-- ---------------------------------------------------------------------

-- Triggers e functions próprios (as functions são standalone; tables caem abaixo)
drop trigger if exists trg_prevent_is_admin_change on public.profiles;
drop function if exists public.prevent_is_admin_change() cascade;
drop function if exists public.calcular_streak(uuid) cascade;

-- Tabelas do projeto (ordem não importa por causa do CASCADE)
drop table if exists public.progress_entries   cascade;
drop table if exists public.lesson_completions cascade;
drop table if exists public.checkins           cascade;
drop table if exists public.diet_days          cascade;
drop table if exists public.diet_plans         cascade;
drop table if exists public.lessons            cascade;
drop table if exists public.program_days       cascade;
drop table if exists public.program_weeks      cascade;
drop table if exists public.programs           cascade;
drop table if exists public.entitlements       cascade;
drop table if exists public.products           cascade;
drop table if exists public.profiles           cascade;
drop table if exists public.webhook_events     cascade;

-- Policies do bucket de fotos (storage.objects NÃO é dropada — é do sistema)
drop policy if exists "progress_photos_read_own"   on storage.objects;
drop policy if exists "progress_photos_insert_own" on storage.objects;
drop policy if exists "progress_photos_delete_own" on storage.objects;

-- =====================================================================
-- 2) RECRIAÇÃO — tabelas (equivale a 0001_schema.sql + is_admin de 0004)
-- =====================================================================

-- profiles (espelha auth.users) — já com is_admin (migration 0004)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  quiz_data jsonb,
  onboarding_completo boolean not null default false,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- products (catálogo vendável — espelha produtos da Kiwify)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nome text not null,
  descricao text,
  tipo text not null check (tipo in ('programa','dieta_premium','bundle','extra')),
  kiwify_product_id text,
  kiwify_checkout_url text,
  preco_exibicao text,
  sales_page jsonb,
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);
create index products_kiwify_product_id_idx on public.products(kiwify_product_id);

-- entitlements (o que cada usuário desbloqueou)
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  origem text not null default 'kiwify' check (origem in ('kiwify','manual','bonus')),
  kiwify_order_id text,
  status text not null default 'ativo' check (status in ('ativo','revogado')),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index entitlements_user_id_idx on public.entitlements(user_id);

-- programs
create table public.programs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  slug text unique not null,
  nome text not null,
  descricao text,
  capa_url text,
  duracao_semanas int not null default 4,
  ordem_exibicao int not null default 0,
  ativo boolean not null default true
);

create table public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  numero int not null,
  titulo text not null,
  unique (program_id, numero)
);

create table public.program_days (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.program_weeks(id) on delete cascade,
  numero int not null,
  titulo text not null,
  unique (week_id, numero)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.program_days(id) on delete cascade,
  titulo text not null,
  tipo text not null check (tipo in ('video','guia')),
  panda_video_id text,
  conteudo jsonb,
  duracao_min int not null default 30,
  ordem int not null default 0
);
create index lessons_day_id_idx on public.lessons(day_id);

-- diet_plans / diet_days (product_id null = plano base incluso)
create table public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  slug text unique not null,
  nome text not null,
  descricao text,
  ativo boolean not null default true
);

create table public.diet_days (
  id uuid primary key default gen_random_uuid(),
  diet_plan_id uuid not null references public.diet_plans(id) on delete cascade,
  numero int not null,
  refeicoes jsonb not null,
  unique (diet_plan_id, numero)
);

-- Registros do usuário
create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  tipo text not null check (tipo in ('treino','dieta','agua')),
  created_at timestamptz not null default now(),
  unique (user_id, data, tipo)
);
create index checkins_user_data_idx on public.checkins(user_id, data);

create table public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index lesson_completions_user_idx on public.lesson_completions(user_id);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  foto_path text,
  medidas jsonb,
  peso numeric,
  nota text,
  created_at timestamptz not null default now()
);
create index progress_entries_user_idx on public.progress_entries(user_id, data);

-- webhook_events (log + idempotência)
create table public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payload jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);

-- =====================================================================
-- 3) RLS + POLICIES (equivale a 0002_rls.sql)
-- =====================================================================

alter table public.profiles           enable row level security;
alter table public.products           enable row level security;
alter table public.entitlements       enable row level security;
alter table public.programs           enable row level security;
alter table public.program_weeks      enable row level security;
alter table public.program_days       enable row level security;
alter table public.lessons            enable row level security;
alter table public.diet_plans         enable row level security;
alter table public.diet_days          enable row level security;
alter table public.checkins           enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.progress_entries   enable row level security;
alter table public.webhook_events     enable row level security;

-- profiles: dono lê/escreve o próprio perfil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Catálogo — leitura para autenticados (vitrine)
create policy "products_read_auth" on public.products
  for select to authenticated using (true);
create policy "programs_read_auth" on public.programs
  for select to authenticated using (true);
create policy "program_weeks_read_auth" on public.program_weeks
  for select to authenticated using (true);
create policy "program_days_read_auth" on public.program_days
  for select to authenticated using (true);
create policy "diet_plans_read_auth" on public.diet_plans
  for select to authenticated using (true);

-- diet_days: cardápio base (product_id null) legível; premium só via servidor
create policy "diet_days_read_base" on public.diet_days
  for select to authenticated using (
    exists (
      select 1 from public.diet_plans dp
      where dp.id = diet_days.diet_plan_id
        and dp.product_id is null
    )
  );

-- lessons: SEM policy de leitura no client (conteúdo servido via servidor).

-- entitlements: dono lê os próprios; sem escrita pelo client
create policy "entitlements_select_own" on public.entitlements
  for select using (auth.uid() = user_id);

-- checkins: CRUD do dono
create policy "checkins_select_own" on public.checkins
  for select using (auth.uid() = user_id);
create policy "checkins_insert_own" on public.checkins
  for insert with check (auth.uid() = user_id);
create policy "checkins_delete_own" on public.checkins
  for delete using (auth.uid() = user_id);

-- lesson_completions: dono lê/insere
create policy "lesson_completions_select_own" on public.lesson_completions
  for select using (auth.uid() = user_id);
create policy "lesson_completions_insert_own" on public.lesson_completions
  for insert with check (auth.uid() = user_id);

-- progress_entries: CRUD do dono
create policy "progress_select_own" on public.progress_entries
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress_entries
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress_entries
  for delete using (auth.uid() = user_id);

-- webhook_events: sem policies => somente service role.

-- =====================================================================
-- 4) FUNCTIONS (equivale a 0003_functions.sql) + is_admin (0004)
-- =====================================================================

-- Streak no fuso America/Sao_Paulo
create or replace function public.calcular_streak(p_user_id uuid)
returns table (streak_atual int, streak_recorde int, fez_hoje boolean)
language plpgsql
security invoker
stable
as $$
declare
  v_hoje date := (now() at time zone 'America/Sao_Paulo')::date;
  v_dates date[];
  v_atual int := 0;
  v_recorde int := 0;
  v_run int := 0;
  v_prev date;
  v_cur date;
  v_ancora date;
  v_fez_hoje boolean;
begin
  select array_agg(distinct data order by data)
    into v_dates
  from public.checkins
  where user_id = p_user_id;

  if v_dates is null then
    return query select 0, 0, false;
    return;
  end if;

  v_prev := null;
  foreach v_cur in array v_dates loop
    if v_prev is not null and v_cur - v_prev = 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    if v_run > v_recorde then
      v_recorde := v_run;
    end if;
    v_prev := v_cur;
  end loop;

  v_fez_hoje := v_hoje = any(v_dates);

  if v_fez_hoje then
    v_ancora := v_hoje;
  elsif (v_hoje - 1) = any(v_dates) then
    v_ancora := v_hoje - 1;
  else
    return query select 0, v_recorde, v_fez_hoje;
    return;
  end if;

  v_cur := v_ancora;
  while v_cur = any(v_dates) loop
    v_atual := v_atual + 1;
    v_cur := v_cur - 1;
  end loop;

  return query select v_atual, v_recorde, v_fez_hoje;
end;
$$;

-- Bloqueia usuário final (authenticated/anon) de alterar o próprio is_admin
create or replace function public.prevent_is_admin_change()
returns trigger
language plpgsql
as $$
declare
  v_role text := current_setting('request.jwt.claims', true)::jsonb ->> 'role';
begin
  if new.is_admin is distinct from old.is_admin then
    if v_role in ('authenticated', 'anon') then
      raise exception 'Alteração de is_admin não permitida.'
        using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_is_admin_change on public.profiles;
create trigger trg_prevent_is_admin_change
  before update on public.profiles
  for each row
  execute function public.prevent_is_admin_change();

-- =====================================================================
-- 5) STORAGE — bucket privado de fotos + policies (equivale a 0002)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

create policy "progress_photos_read_own" on storage.objects
  for select to authenticated using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "progress_photos_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "progress_photos_delete_own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'progress-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =====================================================================
-- Pronto. Schema recriado do zero.
-- Próximos passos (no seu terminal): npm run seed && npm run seed:admin
-- =====================================================================
