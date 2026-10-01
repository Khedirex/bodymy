-- =====================================================================
-- 0026_hotmart_8385058_para_cisne.sql
-- BodyMy — O produto 8385058 da Hotmart passa a ser o
-- "Reset Postura de Cisne — Reto 14 días".
--
-- Até aqui (0015) esse id liberava o Pilates Hormonal. A partir desta
-- migration, uma compra 8385058 na Hotmart libera SÓ o Reset Postura de
-- Cisne (e o reembolso revoga só ele).
--
--   • pilates-hormonal: perde o vínculo com a Hotmart. Continua existindo
--     e vendável pela Kiwify (kiwify_product_id intacto).
--   • Quem já comprou Pilates Hormonal pela Hotmart MANTÉM o acesso: os
--     entitlements existentes não são tocados.
--
-- Ordem importa: primeiro solta o id do Pilates, depois grava no Cisne —
-- nunca existem dois produtos com o mesmo hotmart_product_id.
-- Idempotente.
-- =====================================================================

update public.products
   set hotmart_product_id = null
 where hotmart_product_id = '8385058'
   and slug <> 'reset-postura-cisne';

update public.products
   set hotmart_product_id = '8385058'
 where slug = 'reset-postura-cisne'
   and hotmart_product_id is distinct from '8385058';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — esperado: UMA linha, reset-postura-cisne.
-- (Se vier vazio, a 0025 ainda não foi aplicada: rode-a e repita esta.)
-- ---------------------------------------------------------------------
select slug, nome, hotmart_product_id
  from public.products
 where hotmart_product_id = '8385058';
