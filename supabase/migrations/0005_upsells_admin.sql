-- =====================================================================
-- BodyMy — Esteiras de upsell + auditoria admin + isolamento da vitrine
--
-- Modelo multi-oferta: cada aluna vê apenas o "mundo dela" — os produtos
-- que possui e os upsells configurados desses produtos. Uma aluna que
-- comprou Caminhada Japonesa NUNCA deve saber que existe Pilates, a menos
-- que Pilates seja upsell da Caminhada.
-- =====================================================================

-- ---------------------------------------------------------------------
-- product_upsells: esteira de backend de cada produto
-- ---------------------------------------------------------------------
create table if not exists public.product_upsells (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,       -- origem
  upsell_product_id uuid not null references public.products(id) on delete cascade, -- ofertado
  ordem int not null default 0,
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, upsell_product_id),
  constraint product_upsells_no_self check (product_id <> upsell_product_id)
);
create index if not exists product_upsells_product_idx on public.product_upsells(product_id);

alter table public.product_upsells enable row level security;
-- Leitura para autenticados (a lógica de "mundo dela" é reforçada pela RLS
-- de products abaixo); escrita apenas service_role (sem policy de write).
create policy "product_upsells_read_auth" on public.product_upsells
  for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- admin_logs: auditoria de toda ação administrativa que altera dados
-- ---------------------------------------------------------------------
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id) on delete set null,
  acao text not null,
  alvo_tipo text,
  alvo_id text,
  detalhes jsonb,
  created_at timestamptz not null default now()
);
create index if not exists admin_logs_created_idx on public.admin_logs(created_at desc);

alter table public.admin_logs enable row level security;
-- Sem policies: só service_role (usado pelo servidor do admin) acessa.

-- ---------------------------------------------------------------------
-- ISOLAMENTO DA VITRINE: products só é legível se estiver no "mundo" da
-- aluna — produto que ela possui OU upsell (ativo) de algo que ela possui.
-- Isso vale inclusive para consultas diretas do client (defesa real, não
-- só no front). O admin usa service_role e enxerga tudo.
-- ---------------------------------------------------------------------
drop policy if exists "products_read_auth" on public.products;
create policy "products_read_own_world" on public.products
  for select to authenticated using (
    exists (
      select 1 from public.entitlements e
      where e.user_id = auth.uid()
        and e.product_id = products.id
        and e.status = 'ativo'
    )
    or exists (
      select 1
      from public.product_upsells pu
      join public.entitlements e
        on e.product_id = pu.product_id
       and e.user_id = auth.uid()
       and e.status = 'ativo'
      where pu.upsell_product_id = products.id
        and pu.ativo = true
    )
  );
