-- =====================================================================
-- 0015_hotmart.sql
-- BodyMy — Integração Hotmart: coluna products.hotmart_product_id e
-- vínculo do MESMO produto "Pilates Hormonal" (já vendido na Kiwify) ao
-- produto da Hotmart (id 8385058). É o mesmo produto nas duas plataformas.
--
-- Idempotente. O webhook /api/webhooks/hotmart casa o produto por
-- hotmart_product_id OU kiwify_product_id; o entitlement é por product_id
-- interno (inalterado) → quem já comprou não é afetado.
-- =====================================================================

alter table public.products add column if not exists hotmart_product_id text;
create index if not exists products_hotmart_product_id_idx on public.products(hotmart_product_id);

-- Mesmo produto: adiciona o id da Hotmart ao 'pilates-hormonal' existente.
-- Atualiza o nome para o título usado na oferta em espanhol.
update public.products
   set hotmart_product_id = '8385058',
       nome = 'Pilates Hormonal - Reto de 28 Días'
 where slug = 'pilates-hormonal';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select 'coluna hotmart_product_id' as verificacao,
       case when exists (select 1 from information_schema.columns
             where table_name='products' and column_name='hotmart_product_id')
            then 'OK' else 'FALTA' end as valor
union all
select 'produto (kiwify + hotmart)',
       (select slug || ' → kiwify:' || coalesce(kiwify_product_id,'—') || ' / hotmart:' || coalesce(hotmart_product_id,'—')
          from public.products where slug = 'pilates-hormonal');
