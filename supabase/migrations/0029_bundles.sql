-- =====================================================================
-- 0029_bundles.sql
-- BodyMy — Um produto pode CONTER outros (bundle).
--
-- Motivo: o "Combo 3 en 1 — Ritual Noche Perfecta" vende os três bumps
-- juntos. Sem modelar isso, a aluna comprava o combo e continuava vendo os
-- três itens à venda na vitrine, como se não os tivesse — e não teria
-- acesso ao conteúdo deles quando existir.
--
-- A expansão acontece em getActiveEntitlementProductIds (src/lib/
-- entitlements.ts), que é por onde passam TODAS as checagens de acesso.
--
-- Idempotente. Aplicado em produção em 02/10.
-- =====================================================================

create table if not exists public.product_bundles (
  bundle_product_id   uuid not null references public.products(id) on delete cascade,
  included_product_id uuid not null references public.products(id) on delete cascade,
  primary key (bundle_product_id, included_product_id)
);

-- Sem policy de leitura: só o servidor (service role) expande o bundle.
alter table public.product_bundles enable row level security;

-- Combo 3 en 1 → os três bumps do Ritual Noche Perfecta.
insert into public.product_bundles (bundle_product_id, included_product_id)
select b.id, c.id
  from public.products b
  join public.products c
    on c.slug in ('oracion-noches-bendecidas', 'protocolo-reset-madrugada', 'receta-natural-pre-sueno')
 where b.slug = 'combo-3-en-1-noche'
   and not exists (
     select 1 from public.product_bundles pb
      where pb.bundle_product_id = b.id and pb.included_product_id = c.id
   );

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — o que a compra do combo passa a liberar.
-- ---------------------------------------------------------------------
select b.slug as combo, c.slug as inclui, c.nome
  from public.product_bundles pb
  join public.products b on b.id = pb.bundle_product_id
  join public.products c on c.id = pb.included_product_id
 order by b.slug, c.slug;
