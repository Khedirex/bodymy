-- =====================================================================
-- BodyMy — Schema inicial
-- Todas as tabelas terão RLS habilitada em 0002_rls.sql
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles (espelha auth.users)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  email text,
  quiz_data jsonb,
  onboarding_completo boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- products (catálogo vendável — espelha produtos da Kiwify)
-- ---------------------------------------------------------------------
create table if not exists public.products (
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
create index if not exists products_kiwify_product_id_idx on public.products(kiwify_product_id);

-- ---------------------------------------------------------------------
-- entitlements (o que cada usuário desbloqueou)
-- ---------------------------------------------------------------------
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  origem text not null default 'kiwify' check (origem in ('kiwify','manual','bonus')),
  kiwify_order_id text,
  status text not null default 'ativo' check (status in ('ativo','revogado')),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
create index if not exists entitlements_user_id_idx on public.entitlements(user_id);

-- ---------------------------------------------------------------------
-- programs
-- ---------------------------------------------------------------------
create table if not exists public.programs (
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

create table if not exists public.program_weeks (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  numero int not null,
  titulo text not null,
  unique (program_id, numero)
);

create table if not exists public.program_days (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.program_weeks(id) on delete cascade,
  numero int not null,
  titulo text not null,
  unique (week_id, numero)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.program_days(id) on delete cascade,
  titulo text not null,
  tipo text not null check (tipo in ('video','guia')),
  panda_video_id text,
  conteudo jsonb,
  duracao_min int not null default 30,
  ordem int not null default 0
);
create index if not exists lessons_day_id_idx on public.lessons(day_id);

-- ---------------------------------------------------------------------
-- diet_plans / diet_days
-- product_id null = plano base incluso; preenchido = premium bloqueável
-- ---------------------------------------------------------------------
create table if not exists public.diet_plans (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  slug text unique not null,
  nome text not null,
  descricao text,
  ativo boolean not null default true
);

create table if not exists public.diet_days (
  id uuid primary key default gen_random_uuid(),
  diet_plan_id uuid not null references public.diet_plans(id) on delete cascade,
  numero int not null,
  refeicoes jsonb not null,
  unique (diet_plan_id, numero)
);

-- ---------------------------------------------------------------------
-- Registros do usuário
-- ---------------------------------------------------------------------
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  tipo text not null check (tipo in ('treino','dieta','agua')),
  created_at timestamptz not null default now(),
  unique (user_id, data, tipo)
);
create index if not exists checkins_user_data_idx on public.checkins(user_id, data);

create table if not exists public.lesson_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index if not exists lesson_completions_user_idx on public.lesson_completions(user_id);

create table if not exists public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  foto_path text,
  medidas jsonb,
  peso numeric,
  nota text,
  created_at timestamptz not null default now()
);
create index if not exists progress_entries_user_idx on public.progress_entries(user_id, data);

-- ---------------------------------------------------------------------
-- webhook_events (log + idempotência)
-- ---------------------------------------------------------------------
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null,
  payload jsonb,
  processed boolean not null default false,
  created_at timestamptz not null default now(),
  unique (provider, event_id)
);
