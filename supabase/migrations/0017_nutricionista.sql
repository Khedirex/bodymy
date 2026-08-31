-- =====================================================================
-- 0017_nutricionista.sql
-- BodyMy — Acompañamiento Diario (asistente de IA do protocolo + plano de apoio).
-- A assistente conhece o dia do desafio, adapta a sessão, fala de sintomas
-- (calores/ansiedade) e orienta a alimentação como APOIO — não prescreve dieta.
--
-- Modelo de acesso à experiência (dentro da aba "Dieta"):
--   1) entitlement ATIVO do produto 'acompanhamento-diario' (upsell pago) → acesso pago;
--   2) senão, trial válido (< 7 dias a partir do MOMENTO EM QUE MONTA A DIETA) → acesso trial;
--   3) senão → bloqueado (paywall do upsell).
--
-- O trial começa quando a aluna CONCLUI o questionário (monta a dieta),
-- não no acesso nem na compra do produto base.
--
-- Tabelas:
--   nutri_perfil    — respostas do questionário (1 por usuária).
--   nutri_trials    — controle do teste grátis de 7 dias (1 por usuária).
--   nutri_dietas    — dietas mensais geradas pela IA (com substituições + retorno).
--   nutri_mensagens — histórico do chat (usuária ↔ IA).
--
-- Escrita SEMPRE via servidor (rotas /api/nutri/* com service role), que
-- valida acesso/trial antes de chamar o n8n. O client só LÊ (RLS dono).
-- Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Produto vendável do upsell. Os ids de plataforma (Kiwify/Hotmart) ficam
-- NULL até a aluna criar o SKU do upsell; assim que existir, é só um UPDATE
-- (o mesmo webhook de compra passa a liberar o entitlement automaticamente).
-- ---------------------------------------------------------------------
-- Se uma versão anterior já criou o produto com o slug antigo
-- ('nutricionista-online'), renomeia para o slug novo ANTES do upsert (assim
-- preserva o id e eventuais entitlements/ids de plataforma). Só quando o novo
-- ainda não existe, evitando conflito de unique(slug).
update public.products
   set slug = 'acompanhamento-diario'
 where slug = 'nutricionista-online'
   and not exists (select 1 from public.products where slug = 'acompanhamento-diario');

insert into public.products (slug, nome, tipo, descricao, ativo)
values (
  'acompanhamento-diario',
  'Acompañamiento Diario',
  'extra',
  'Asistente que te acompaña cada día del reto: adapta tu sesión, responde tus dudas y orienta tu alimentación como apoyo al estímulo hormonal.',
  true
)
on conflict (slug) do update
  set nome = excluded.nome,
      tipo = excluded.tipo,
      descricao = excluded.descricao,
      ativo = excluded.ativo;

-- ---------------------------------------------------------------------
-- nutri_perfil — respostas do questionário (base para a IA montar a dieta).
-- ---------------------------------------------------------------------
create table if not exists public.nutri_perfil (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  dados jsonb not null default '{}'::jsonb,
  completo boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- nutri_trials — teste grátis de 7 dias. Começa quando monta a dieta.
-- ---------------------------------------------------------------------
create table if not exists public.nutri_trials (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  iniciado_em timestamptz not null default now(),
  expira_em timestamptz not null
);

-- ---------------------------------------------------------------------
-- nutri_dietas — dietas mensais geradas pela IA (n8n). "ativa" = vigente.
-- ---------------------------------------------------------------------
create table if not exists public.nutri_dietas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  conteudo jsonb not null,
  gerada_em timestamptz not null default now(),
  retorno_em timestamptz,
  ativa boolean not null default true
);
create index if not exists nutri_dietas_user_idx on public.nutri_dietas(user_id);
-- No máximo uma dieta ATIVA por usuária.
create unique index if not exists nutri_dietas_uma_ativa
  on public.nutri_dietas(user_id) where ativa;

-- ---------------------------------------------------------------------
-- nutri_mensagens — histórico do chat.
-- ---------------------------------------------------------------------
create table if not exists public.nutri_mensagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  papel text not null check (papel in ('user', 'assistant')),
  conteudo text not null,
  criado_em timestamptz not null default now()
);
create index if not exists nutri_mensagens_user_idx
  on public.nutri_mensagens(user_id, criado_em);

-- ---------------------------------------------------------------------
-- RLS: dono LÊ o próprio; escrita só via servidor (service role bypassa RLS).
-- ---------------------------------------------------------------------
alter table public.nutri_perfil    enable row level security;
alter table public.nutri_trials    enable row level security;
alter table public.nutri_dietas    enable row level security;
alter table public.nutri_mensagens enable row level security;

drop policy if exists "nutri_perfil_select_own" on public.nutri_perfil;
create policy "nutri_perfil_select_own" on public.nutri_perfil
  for select using (auth.uid() = user_id);

drop policy if exists "nutri_trials_select_own" on public.nutri_trials;
create policy "nutri_trials_select_own" on public.nutri_trials
  for select using (auth.uid() = user_id);

drop policy if exists "nutri_dietas_select_own" on public.nutri_dietas;
create policy "nutri_dietas_select_own" on public.nutri_dietas
  for select using (auth.uid() = user_id);

drop policy if exists "nutri_mensagens_select_own" on public.nutri_mensagens;
create policy "nutri_mensagens_select_own" on public.nutri_mensagens
  for select using (auth.uid() = user_id);

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select slug, nome, tipo from public.products where slug = 'acompanhamento-diario';
select table_name from information_schema.tables
 where table_schema = 'public'
   and table_name in ('nutri_perfil','nutri_trials','nutri_dietas','nutri_mensagens')
 order by table_name;
