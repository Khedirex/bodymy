-- =====================================================================
-- 0007_circuito.sql
-- BodyMy — Circuito de vídeo com personalização adaptativa
--
-- Substitui o formato de "aula por dia" por um CIRCUITO: 5 exercícios/dia,
-- com séries, descanso e variação (v1–v4) ajustados pelo feedback da aluna.
-- Também: Semana Zero (10 alongamentos, 3 dias) de adaptação.
--
-- As 28 aulas de Pilates Somático NÃO são tocadas aqui — viram material
-- complementar. Streak/check-ins/esteira continuam intactos: um dia do
-- circuito concluído gera um check-in 'treino', como já acontecia.
--
-- Idempotente (create ... if not exists + policies guardadas). Não cria
-- vídeos: os 150 slots (35×4 variações + 10 alongamentos) nascem com
-- panda_video_id NULL e são preenchidos pelo admin aos poucos.
-- =====================================================================

-- ---------------------------------------------------------------------
-- CATÁLOGO DO CIRCUITO (conteúdo — sem policy de leitura no client;
-- servido por rota de servidor que valida entitlement, como as lessons)
-- ---------------------------------------------------------------------

-- 35 exercícios: 5 por dia × 7 dias de um ciclo semanal.
create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  dia_do_ciclo int not null check (dia_do_ciclo between 1 and 7),
  ordem_no_dia int not null check (ordem_no_dia between 1 and 5),
  ordem_no_circuito int not null,           -- 1..35, ordem global
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (dia_do_ciclo, ordem_no_dia)
);
create index if not exists exercises_dia_idx on public.exercises(dia_do_ciclo, ordem_no_dia);

-- 4 variações por exercício (v1 fácil → v4 difícil). panda_video_id nullable.
create table if not exists public.exercise_variations (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  nivel int not null check (nivel between 1 and 4),
  panda_video_id text,
  duracao_seg int,
  instrucoes text,
  created_at timestamptz not null default now(),
  unique (exercise_id, nivel)
);
create index if not exists exercise_variations_ex_idx on public.exercise_variations(exercise_id);

-- 10 alongamentos da Semana Zero (mesmos nos 3 dias). panda_video_id nullable.
create table if not exists public.stretches (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  panda_video_id text,
  ordem int not null,
  duracao_seg int,
  created_at timestamptz not null default now(),
  unique (ordem)
);

-- ---------------------------------------------------------------------
-- ESTADO DA ALUNA (dados pessoais — RLS: dono apenas)
-- ---------------------------------------------------------------------

-- Configuração de intensidade GLOBAL da aluna (séries + descanso valem
-- para todos os exercícios). Ponto de partida vem da faixa etária.
create table if not exists public.user_training_config (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  faixa_etaria text,                         -- '30-35' | '36-40' | '41-45' | '46+'
  series int not null default 3 check (series between 2 and 6),
  descanso_seg int not null default 60 check (descanso_seg between 20 and 120),
  semana_atual int not null default 1 check (semana_atual between 1 and 4),
  dia_atual int not null default 1 check (dia_atual between 1 and 7),
  semana_zero_completa boolean not null default false,
  semana_zero_dias int not null default 0 check (semana_zero_dias between 0 and 3),
  atualizado_em timestamptz not null default now()
);

-- Variação escolhida POR exercício (pode estar em v2 no ex.3 e v1 no ex.4).
create table if not exists public.user_exercise_variations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  variacao_nivel int not null default 1 check (variacao_nivel between 1 and 4),
  atualizado_em timestamptz not null default now(),
  unique (user_id, exercise_id)
);
create index if not exists user_exercise_variations_user_idx on public.user_exercise_variations(user_id);

-- Cada sessão (dia) realizada.
create table if not exists public.training_sessions (
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
create index if not exists training_sessions_user_idx on public.training_sessions(user_id, data);

-- O que aconteceu com cada exercício na sessão.
create table if not exists public.session_exercises (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.training_sessions(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  variacao_nivel int not null check (variacao_nivel between 1 and 4),
  status text not null check (status in ('fez','nao_conseguiu','pulou')),
  ordem int not null default 0,
  created_at timestamptz not null default now(),
  unique (session_id, exercise_id)
);
create index if not exists session_exercises_session_idx on public.session_exercises(session_id);

-- Avaliação final da sessão (comentário + eixo + intensidade + ajuste).
create table if not exists public.session_feedback (
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
create index if not exists session_feedback_user_idx on public.session_feedback(user_id, created_at desc);

-- ---------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------
alter table public.exercises                enable row level security;
alter table public.exercise_variations      enable row level security;
alter table public.stretches                enable row level security;
alter table public.user_training_config     enable row level security;
alter table public.user_exercise_variations enable row level security;
alter table public.training_sessions        enable row level security;
alter table public.session_exercises        enable row level security;
alter table public.session_feedback         enable row level security;

-- Catálogo do circuito: SEM policy de leitura no client (igual às lessons).
-- O conteúdo é servido por rota de servidor que valida entitlement; o admin
-- usa service_role e enxerga/edita tudo.

-- user_training_config: dono lê/escreve
drop policy if exists "utc_select_own" on public.user_training_config;
drop policy if exists "utc_insert_own" on public.user_training_config;
drop policy if exists "utc_update_own" on public.user_training_config;
create policy "utc_select_own" on public.user_training_config
  for select using (auth.uid() = user_id);
create policy "utc_insert_own" on public.user_training_config
  for insert with check (auth.uid() = user_id);
create policy "utc_update_own" on public.user_training_config
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- user_exercise_variations: dono CRUD
drop policy if exists "uev_select_own" on public.user_exercise_variations;
drop policy if exists "uev_insert_own" on public.user_exercise_variations;
drop policy if exists "uev_update_own" on public.user_exercise_variations;
create policy "uev_select_own" on public.user_exercise_variations
  for select using (auth.uid() = user_id);
create policy "uev_insert_own" on public.user_exercise_variations
  for insert with check (auth.uid() = user_id);
create policy "uev_update_own" on public.user_exercise_variations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- training_sessions: dono CRUD (select/insert/update)
drop policy if exists "ts_select_own" on public.training_sessions;
drop policy if exists "ts_insert_own" on public.training_sessions;
drop policy if exists "ts_update_own" on public.training_sessions;
create policy "ts_select_own" on public.training_sessions
  for select using (auth.uid() = user_id);
create policy "ts_insert_own" on public.training_sessions
  for insert with check (auth.uid() = user_id);
create policy "ts_update_own" on public.training_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- session_exercises: acesso via dono da sessão (subconsulta)
drop policy if exists "se_select_own" on public.session_exercises;
drop policy if exists "se_insert_own" on public.session_exercises;
drop policy if exists "se_update_own" on public.session_exercises;
create policy "se_select_own" on public.session_exercises
  for select using (exists (
    select 1 from public.training_sessions ts
    where ts.id = session_exercises.session_id and ts.user_id = auth.uid()
  ));
create policy "se_insert_own" on public.session_exercises
  for insert with check (exists (
    select 1 from public.training_sessions ts
    where ts.id = session_exercises.session_id and ts.user_id = auth.uid()
  ));
create policy "se_update_own" on public.session_exercises
  for update using (exists (
    select 1 from public.training_sessions ts
    where ts.id = session_exercises.session_id and ts.user_id = auth.uid()
  ));

-- session_feedback: dono lê/insere
drop policy if exists "sf_select_own" on public.session_feedback;
drop policy if exists "sf_insert_own" on public.session_feedback;
create policy "sf_select_own" on public.session_feedback
  for select using (auth.uid() = user_id);
create policy "sf_insert_own" on public.session_feedback
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- SLOTS DE VÍDEO (150): 35 exercícios × 4 variações + 10 alongamentos.
-- Nomes são placeholders editáveis ("Exercício N" / "Alongamento N") e
-- todos os panda_video_id nascem NULL. O admin preenche aos poucos.
-- Guardado: só cria se ainda não houver exercícios (não duplica).
-- ---------------------------------------------------------------------
do $seed$
declare
  d int; o int; ord int; ex_id uuid; n int;
begin
  if not exists (select 1 from public.exercises) then
    for d in 1..7 loop
      for o in 1..5 loop
        ord := (d - 1) * 5 + o;
        insert into public.exercises (nome, dia_do_ciclo, ordem_no_dia, ordem_no_circuito)
        values ('Exercício ' || ord, d, o, ord)
        returning id into ex_id;
        for n in 1..4 loop
          insert into public.exercise_variations (exercise_id, nivel)
          values (ex_id, n);
        end loop;
      end loop;
    end loop;
  end if;

  if not exists (select 1 from public.stretches) then
    for o in 1..10 loop
      insert into public.stretches (nome, ordem) values ('Alongamento ' || o, o);
    end loop;
  end if;
end
$seed$;

-- ---------------------------------------------------------------------
-- Recarrega o cache do PostgREST
-- ---------------------------------------------------------------------
notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select * from (values
  ('tabelas do circuito (esperado 8)',
    (select count(*)::text from information_schema.tables
      where table_schema = 'public'
        and table_name in ('exercises','exercise_variations','stretches',
          'user_training_config','user_exercise_variations','training_sessions',
          'session_exercises','session_feedback'))),
  ('exercicios (esperado 35)', (select count(*)::text from public.exercises)),
  ('variacoes (esperado 140)', (select count(*)::text from public.exercise_variations)),
  ('alongamentos (esperado 10)', (select count(*)::text from public.stretches)),
  ('slots de video (esperado 150)',
    ((select count(*) from public.exercise_variations)
     + (select count(*) from public.stretches))::text)
) as v(verificacao, valor) order by verificacao;
