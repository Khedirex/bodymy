-- =====================================================================
-- 0013_pilates_hormonal.sql
-- BodyMy — Novo produto (SKU) "Pilates Hormonal" que libera A MESMA
-- experiência do produto principal (mesmo circuito + mesmas aulas).
--
-- É só um PRODUTO novo (para vender por outro checkout da Kiwify). NÃO cria
-- programa nem duplica conteúdo — o acesso a esse produto passa a liberar o
-- mesmo circuito/aulas via CIRCUITO_ACCESS_SLUGS no código.
--
-- Idempotente (upsert por slug). O webhook casa o produto por
-- kiwify_product_id, então compras neste produto liberam acesso.
-- =====================================================================

insert into public.products (slug, nome, descricao, tipo, kiwify_product_id, ativo)
values (
  'pilates-hormonal',
  'Pilates Hormonal',
  'Movimentos suaves de Pilates para praticar em casa, no seu ritmo e sem equipamento.',
  'programa',
  'e08d83c0-9f65-11f1-8481-bf45dfdb6fb2',
  true
)
on conflict (slug) do update
  set nome              = excluded.nome,
      descricao         = excluded.descricao,
      tipo              = excluded.tipo,
      kiwify_product_id = excluded.kiwify_product_id,
      ativo             = true;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select slug, nome, tipo, kiwify_product_id, ativo
  from public.products
 where slug = 'pilates-hormonal';
