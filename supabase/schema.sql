-- =====================================================================
--  BodyMy — SCHEMA DEFINITIVO (rodar UMA vez num projeto Supabase NOVO)
--
--  Este arquivo NÃO tem DROPs. Usa `create table` puro (sem if not
--  exists) de propósito: se alguma coisa já existir, ele FALHA ALTO em
--  vez de mascarar — é o que queremos num banco que deve estar vazio.
--
--  Ordem: tabelas → RLS/policies → funções → trigger → bucket →
--  reload do PostgREST → verificação.
--
--  ⚠️ A configuração de POLICIES do Storage (storage.objects) foi
--  ISOLADA em supabase/storage-setup.sql. Motivo: criar policy em
--  storage.objects pode exigir privilégio de owner que o SQL Editor
--  nem sempre tem, e como o Editor roda tudo em UMA transação, um erro
--  ali faria rollback de TODO o schema. Rode storage-setup.sql depois.
--  (O app usa URLs assinadas geradas no servidor com a service role,
--   então funciona mesmo sem essas policies — elas são reforço.)
--
--  Observação: gen_random_uuid() é função nativa do Postgres 13+
--  (Supabase é 15+), então não precisamos de extensão.
-- =====================================================================

-- ---------------------------------------------------------------------
-- TABELAS (na ordem de dependência)
-- ---------------------------------------------------------------------

-- profiles (espelha auth.users) — já com is_admin
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

-- product_upsells (esteira de backend: quais produtos são upsell de outro)
create table public.product_upsells (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  upsell_product_id uuid not null references public.products(id) on delete cascade,
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, upsell_product_id),
  constraint product_upsells_no_self check (product_id <> upsell_product_id)
);
create index product_upsells_product_idx on public.product_upsells(product_id);

-- admin_logs (auditoria de ações administrativas)
create table public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id) on delete set null,
  acao text not null,
  alvo_tipo text,
  alvo_id text,
  detalhes jsonb,
  created_at timestamptz not null default now()
);
create index admin_logs_created_idx on public.admin_logs(created_at desc);

-- ---------------------------------------------------------------------
-- RLS + POLICIES
-- ---------------------------------------------------------------------
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
alter table public.product_upsells    enable row level security;
alter table public.admin_logs         enable row level security;

-- profiles: dono lê/escreve o próprio perfil
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- products: leitura só do "mundo" da aluna — o que ela possui + upsells
-- (ativos) do que ela possui. Isola as ofertas entre si (multi-oferta).
create policy "products_read_own_world" on public.products
  for select to authenticated using (
    exists (
      select 1 from public.entitlements e
      where e.user_id = auth.uid() and e.product_id = products.id and e.status = 'ativo'
    )
    or exists (
      select 1 from public.product_upsells pu
      join public.entitlements e
        on e.product_id = pu.product_id and e.user_id = auth.uid() and e.status = 'ativo'
      where pu.upsell_product_id = products.id and pu.ativo = true
    )
  );
-- product_upsells: leitura para autenticados (a RLS de products acima é o
-- que efetivamente limita o que a aluna enxerga).
create policy "product_upsells_read_auth" on public.product_upsells
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

-- ---------------------------------------------------------------------
-- FUNÇÕES
-- ---------------------------------------------------------------------

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

create trigger trg_prevent_is_admin_change
  before update on public.profiles
  for each row
  execute function public.prevent_is_admin_change();

-- ---------------------------------------------------------------------
-- STORAGE — bucket privado (a inserção de bucket é permitida ao SQL
-- Editor). As POLICIES ficam em storage-setup.sql (ver aviso no topo).
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- CIRCUITO DE VÍDEO (Semana Zero + 5 exercícios/dia com adaptação)
-- Catálogo (exercises/exercise_variations/stretches): sem policy de
-- leitura no client — servido via servidor após validar entitlement.
-- Estado da aluna: RLS dono apenas. Um dia concluído gera check-in
-- 'treino', então streak/constância continuam funcionando.
-- ---------------------------------------------------------------------
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  dia_do_ciclo int not null check (dia_do_ciclo between 1 and 7),
  ordem_no_dia int not null check (ordem_no_dia between 1 and 5),
  ordem_no_circuito int not null,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (dia_do_ciclo, ordem_no_dia)
);
create index exercises_dia_idx on public.exercises(dia_do_ciclo, ordem_no_dia);

create table public.exercise_variations (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  nivel int not null check (nivel between 1 and 4),
  panda_video_id text,
  duracao_seg int,
  instrucoes text,
  created_at timestamptz not null default now(),
  unique (exercise_id, nivel)
);
create index exercise_variations_ex_idx on public.exercise_variations(exercise_id);

create table public.stretches (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  panda_video_id text,
  ordem int not null,
  duracao_seg int,
  created_at timestamptz not null default now(),
  unique (ordem)
);

create table public.user_training_config (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  faixa_etaria text,
  series int not null default 3 check (series between 2 and 6),
  descanso_seg int not null default 60 check (descanso_seg between 20 and 120),
  semana_atual int not null default 1 check (semana_atual between 1 and 4),
  dia_atual int not null default 1 check (dia_atual between 1 and 7),
  semana_zero_completa boolean not null default false,
  semana_zero_dias int not null default 0 check (semana_zero_dias between 0 and 3),
  atualizado_em timestamptz not null default now()
);

create table public.user_exercise_variations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  variacao_nivel int not null default 1 check (variacao_nivel between 1 and 4),
  atualizado_em timestamptz not null default now(),
  unique (user_id, exercise_id)
);
create index user_exercise_variations_user_idx on public.user_exercise_variations(user_id);

create table public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data date not null,
  semana int not null,
  dia int not null,
  completa boolean not null default false,
  series_usadas int,
  descanso_usado int,
  created_at timestamptz not null default now()
);
create index training_sessions_user_idx on public.training_sessions(user_id, data);

create table public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  variacao_nivel int not null check (variacao_nivel between 1 and 4),
  status text not null check (status in ('fez','nao_conseguiu','pulou')),
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id, exercise_id)
);
create index session_exercises_session_idx on public.session_exercises(session_id);

create table public.session_feedback (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  comentario text,
  eixo_dificuldade text check (eixo_dificuldade in ('descanso','exercicio','series')),
  intensidade_percebida int check (intensidade_percebida between 1 and 6),
  ajuste_aceito boolean not null default false,
  ajuste_aplicado jsonb,
  created_at timestamptz not null default now(),
  unique (session_id)
);
create index session_feedback_user_idx on public.session_feedback(user_id, created_at desc);

alter table public.exercises                enable row level security;
alter table public.exercise_variations      enable row level security;
alter table public.stretches                enable row level security;
alter table public.user_training_config     enable row level security;
alter table public.user_exercise_variations enable row level security;
alter table public.training_sessions        enable row level security;
alter table public.session_exercises        enable row level security;
alter table public.session_feedback         enable row level security;

-- Catálogo: sem policy de leitura no client (servido via servidor).
create policy "utc_select_own" on public.user_training_config
  for select using (auth.uid() = user_id);
create policy "utc_insert_own" on public.user_training_config
  for insert with check (auth.uid() = user_id);
create policy "utc_update_own" on public.user_training_config
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "uev_select_own" on public.user_exercise_variations
  for select using (auth.uid() = user_id);
create policy "uev_insert_own" on public.user_exercise_variations
  for insert with check (auth.uid() = user_id);
create policy "uev_update_own" on public.user_exercise_variations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "ts_select_own" on public.training_sessions
  for select using (auth.uid() = user_id);
create policy "ts_insert_own" on public.training_sessions
  for insert with check (auth.uid() = user_id);
create policy "ts_update_own" on public.training_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "se_select_own" on public.session_exercises
  for select using (exists (
    select 1 from public.training_sessions ts
    where ts.id = session_exercises.session_id and ts.user_id = auth.uid()));
create policy "se_insert_own" on public.session_exercises
  for insert with check (exists (
    select 1 from public.training_sessions ts
    where ts.id = session_exercises.session_id and ts.user_id = auth.uid()));
create policy "se_update_own" on public.session_exercises
  for update using (exists (
    select 1 from public.training_sessions ts
    where ts.id = session_exercises.session_id and ts.user_id = auth.uid()));

create policy "sf_select_own" on public.session_feedback
  for select using (auth.uid() = user_id);
create policy "sf_insert_own" on public.session_feedback
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- Recarrega o cache de schema do PostgREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — deve aparecer como o resultado final no SQL Editor
-- ---------------------------------------------------------------------
select * from (
  values
    ('tabelas em public (esperado 23)',
      (select count(*)::text from information_schema.tables
        where table_schema = 'public' and table_type = 'BASE TABLE')),
    ('products.kiwify_product_id',
      (select case when exists (select 1 from information_schema.columns
        where table_schema='public' and table_name='products'
          and column_name='kiwify_product_id') then 'OK' else 'FALTANDO' end)),
    ('products.kiwify_checkout_url',
      (select case when exists (select 1 from information_schema.columns
        where table_schema='public' and table_name='products'
          and column_name='kiwify_checkout_url') then 'OK' else 'FALTANDO' end)),
    ('tabela entitlements',
      (select case when to_regclass('public.entitlements') is not null
        then 'OK' else 'FALTANDO' end)),
    ('bucket progress-photos',
      (select case when exists (select 1 from storage.buckets where id='progress-photos')
        then 'OK' else 'PENDENTE (rode storage-setup.sql)' end))
) as v(verificacao, resultado)
order by verificacao;
