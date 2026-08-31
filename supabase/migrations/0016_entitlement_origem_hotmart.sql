-- =====================================================================
-- 0016_entitlement_origem_hotmart.sql
-- BodyMy — Permite origem = 'hotmart' nos entitlements, para o webhook da
-- Hotmart registrar a origem correta da compra (antes só kiwify/manual/bonus).
-- Idempotente.
-- =====================================================================

alter table public.entitlements drop constraint if exists entitlements_origem_check;
alter table public.entitlements
  add constraint entitlements_origem_check
  check (origem in ('kiwify', 'manual', 'bonus', 'hotmart'));

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select conname, pg_get_constraintdef(oid) as definicao
  from pg_constraint
 where conrelid = 'public.entitlements'::regclass and conname = 'entitlements_origem_check';
