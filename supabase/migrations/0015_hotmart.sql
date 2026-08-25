-- =====================================================================
-- 0015_hotmart.sql
-- BodyMy — Integração Hotmart: coluna products.hotmart_product_id +
-- produto "Pilates Hormonal - Reto de 28 Días" (Hotmart id 8385058),
-- que libera a mesma experiência (circuito + aulas) via CIRCUITO_ACCESS_SLUGS.
--
-- Idempotente. O webhook /api/webhooks/hotmart casa o produto por
-- hotmart_product_id; o entitlement é por product_id interno.
-- =====================================================================

alter table public.products add column if not exists hotmart_product_id text;
create index if not exists products_hotmart_product_id_idx on public.products(hotmart_product_id);

insert into public.products (slug, nome, descricao, tipo, hotmart_product_id, ativo)
values (
  'pilates-hormonal-reto',
  'Pilates Hormonal - Reto de 28 Días',
  'Movimientos suaves de Pilates para practicar en casa, a tu ritmo y sin equipo.',
  'programa',
  '8385058',
  true
)
on conflict (slug) do update
  set nome               = excluded.nome,
      descricao          = excluded.descricao,
      tipo               = excluded.tipo,
      hotmart_product_id = excluded.hotmart_product_id,
      ativo              = true;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select 'coluna hotmart_product_id' as verificacao,
       case when exists (select 1 from information_schema.columns
             where table_name='products' and column_name='hotmart_product_id')
            then 'OK' else 'FALTA' end as valor
union all
select 'produto Hotmart', (select slug || ' → ' || hotmart_product_id from public.products where hotmart_product_id = '8385058');
