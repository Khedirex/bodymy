-- =====================================================================
-- BodyMy — Flag de admin no profile (uso futuro: painel admin)
-- =====================================================================

alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- ---------------------------------------------------------------------
-- Segurança: nenhum usuário final pode alterar o PRÓPRIO is_admin
-- (escalonar privilégio). A policy de update do profile permite editar
-- as próprias linhas, mas o RLS WITH CHECK não enxerga o valor ANTIGO —
-- então usamos um trigger que bloqueia mudança de is_admin quando a
-- requisição vem de um usuário final (role authenticated/anon via
-- PostgREST). A service_role (webhook/seed) e o acesso direto ao banco
-- continuam podendo definir is_admin.
-- ---------------------------------------------------------------------
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
        using errcode = '42501'; -- insufficient_privilege
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
