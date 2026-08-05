-- =====================================================================
--  BodyMy — STORAGE (bucket privado de fotos de progresso + policies)
--
--  Rode DEPOIS de schema.sql. Está isolado porque criar policy em
--  storage.objects pode exigir privilégio de owner que o SQL Editor às
--  vezes não tem — e um erro aqui NÃO pode derrubar o schema principal.
--
--  Se estas policies falharem com "must be owner of table objects"
--  (42501), não tem problema: o app usa URLs assinadas geradas no
--  servidor (service role), que ignoram RLS. Nesse caso, crie as
--  policies pelo Dashboard: Storage → Policies → New policy no bucket
--  progress-photos, ou apenas siga sem elas.
--
--  É idempotente (drop policy if exists antes de criar) — pode rodar
--  quantas vezes quiser.
-- =====================================================================

-- Garante o bucket (idempotente).
insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Policies: dono só acessa objetos cujo 1º segmento do path é o seu uid.
drop policy if exists "progress_photos_read_own"   on storage.objects;
drop policy if exists "progress_photos_insert_own" on storage.objects;
drop policy if exists "progress_photos_delete_own" on storage.objects;

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

-- Verificação
select * from (
  values
    ('bucket progress-photos',
      (select case when exists (select 1 from storage.buckets where id='progress-photos')
        then 'OK' else 'FALTANDO' end)),
    ('policies progress_photos_* (esperado 3)',
      (select count(*)::text from pg_policies
        where schemaname='storage' and tablename='objects'
          and policyname like 'progress_photos%'))
) as v(verificacao, resultado)
order by verificacao;
