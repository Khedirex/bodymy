-- =====================================================================
-- 0012_kiwify_drenagem.sql
-- BodyMy — Aponta o produto principal para o NOVO produto da Kiwify
-- ("Drenagem Tailandesa"): novo kiwify_product_id + nova kiwify_checkout_url.
--
-- Idempotente. Localiza o produto pelo slug (novo ou anterior) e atualiza só
-- os campos da Kiwify.
--
-- POR QUE É SEGURO PARA QUEM JÁ COMPROU: o entitlement referencia o product_id
-- interno (uuid), que NÃO muda. Trocar kiwify_product_id só altera como o
-- webhook casa COMPRAS FUTURAS — nenhuma aluna atual perde acesso.
--
-- O webhook (processPurchaseEvent) casa o produto por products.kiwify_product_id
-- = id enviado pela Kiwify. Com este valor, compras no novo produto passam a
-- liberar acesso automaticamente.
-- =====================================================================

update public.products
   set kiwify_product_id  = 'ff1914e0-9bd1-11f1-883e-3d60bcd2ab30',
       kiwify_checkout_url = 'https://pay.kiwify.com.br/KUAxoaY'
 where slug in ('drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-somatico', 'caminhada-japonesa');

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO (kiwify_* devem refletir o novo produto; entitlements intactos)
-- ---------------------------------------------------------------------
select slug, nome, kiwify_product_id, kiwify_checkout_url
  from public.products
 where kiwify_product_id = 'ff1914e0-9bd1-11f1-883e-3d60bcd2ab30';

select count(*) as entitlements_ativos
  from public.entitlements e
  join public.products pr on pr.id = e.product_id
 where pr.kiwify_product_id = 'ff1914e0-9bd1-11f1-883e-3d60bcd2ab30' and e.status = 'ativo';
