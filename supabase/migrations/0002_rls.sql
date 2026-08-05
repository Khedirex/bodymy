-- =====================================================================
-- BodyMy — Row Level Security
--
-- Princípios:
--  * Usuário só lê/escreve as PRÓPRIAS linhas de dados pessoais.
--  * Metadados de catálogo (products/programs/weeks/days/diet_plans/
--    diet_days) são LEGÍVEIS por qualquer usuário autenticado — são a
--    vitrine (conteúdo bloqueado visível).
--  * O CONTEÚDO das aulas (lessons) e de cardápios premium NÃO é servido
--    direto pelo client: passa por rota de servidor que valida
--    entitlement. Ainda assim mantemos RLS restritiva por padrão.
--  * entitlements: usuário lê os próprios; escrita só via service role.
-- =====================================================================

alter table public.profiles          enable row level security;
alter table public.products          enable row level security;
alter table public.entitlements      enable row level security;
alter table public.programs          enable row level security;
alter table public.program_weeks     enable row level security;
alter table public.program_days      enable row level security;
alter table public.lessons           enable row level security;
alter table public.diet_plans        enable row level security;
alter table public.diet_days         enable row level security;
alter table public.checkins          enable row level security;
alter table public.lesson_completions enable row level security;
alter table public.progress_entries  enable row level security;
alter table public.webhook_events    enable row level security;

-- Nota: a service_role IGNORA RLS automaticamente, então o webhook e as
-- rotas de servidor com admin client não precisam de policies próprias.

-- ---------------------------------------------------------------------
-- profiles: dono lê/escreve o próprio perfil
-- ---------------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
-- insert do profile é feito pelo webhook (service role); não abrimos ao client.

-- ---------------------------------------------------------------------
-- Catálogo — leitura para autenticados (vitrine)
-- ---------------------------------------------------------------------
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

-- diet_days: cardápio do plano BASE (product_id null) é legível por
-- autenticados. Cardápio premium (product_id não-null) só via servidor.
create policy "diet_days_read_base" on public.diet_days
  for select to authenticated using (
    exists (
      select 1 from public.diet_plans dp
      where dp.id = diet_days.diet_plan_id
        and dp.product_id is null
    )
  );

-- lessons: NÃO abrimos leitura ao client. O conteúdo é servido por rota
-- de servidor que valida entitlement. (Sem policy de select para
-- authenticated => bloqueado por padrão sob RLS.)

-- ---------------------------------------------------------------------
-- entitlements: dono lê os próprios; sem escrita pelo client
-- ---------------------------------------------------------------------
create policy "entitlements_select_own" on public.entitlements
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- checkins: CRUD apenas do dono
-- ---------------------------------------------------------------------
create policy "checkins_select_own" on public.checkins
  for select using (auth.uid() = user_id);
create policy "checkins_insert_own" on public.checkins
  for insert with check (auth.uid() = user_id);
create policy "checkins_delete_own" on public.checkins
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- lesson_completions: dono lê/insere
-- ---------------------------------------------------------------------
create policy "lesson_completions_select_own" on public.lesson_completions
  for select using (auth.uid() = user_id);
create policy "lesson_completions_insert_own" on public.lesson_completions
  for insert with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- progress_entries: CRUD do dono
-- ---------------------------------------------------------------------
create policy "progress_select_own" on public.progress_entries
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress_entries
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "progress_delete_own" on public.progress_entries
  for delete using (auth.uid() = user_id);

-- webhook_events: sem policies => somente service role acessa.

-- ---------------------------------------------------------------------
-- Storage: bucket privado de fotos de progresso
-- Upload/leitura via URLs assinadas geradas no servidor. O path é
-- sempre prefixado por user_id/ para isolar as fotos por usuária.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Dono pode ler/gravar objetos cujo primeiro segmento do path é o seu uid.
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
