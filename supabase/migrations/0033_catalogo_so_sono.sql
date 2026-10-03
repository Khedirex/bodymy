-- =====================================================================
-- 0033_catalogo_so_sono.sql
-- BodyMy — a vitrine passa a vender só a linha de insônia.
--
-- Decisão comercial: o foco agora é sono. A linha de movimento (circuito,
-- pilates, dieta) sai da VENDA — não do app.
--
-- `ativo = false` significa "fora de venda", nunca "não existe":
--   · quem já comprou mantém o módulo, o progresso e o acesso;
--   · o produto some da esteira (getEsteira filtra ativo) e da página de
--     oferta;
--   · voltar a vender é um UPDATE com ativo = true.
--
-- Pré-requisito que veio junto neste commit: hasCisneAccess lia o produto
-- com `.eq('ativo', true)`. Arquivar o Cisne com esse filtro no lugar fazia
-- a checagem devolver false para TODAS as alunas e a página devolver 404 —
-- 4 compradoras perderiam o produto. O filtro saiu de lá.
-- =====================================================================

update public.products
   set ativo = false
 where slug in (
   'descompresion-rodillas',
   'ritual-do-tapetinho',
   'pilates-hormonal',
   'pilates-de-cadeira',
   'suelta-la-cadera',
   'suelta-la-espalda-baja',
   'suelta-las-manos',
   'cardapio-low-carb',
   'acompanhamento-diario',
   'reset-postura-cisne'
 );

-- Permanecem à venda (linha de sono):
--   ritual-noche-perfecta          front
--   oracion-noches-bendecidas      bump
--   protocolo-reset-madrugada      bump
--   receta-natural-pre-sueno       bump
--   combo-3-en-1-noche             bundle dos 3 bumps
--   oraciones-coleccion-completa   upsell das 43 oraciones
--   ritual-mantenimiento-21-noches upsell
--   ritual-dia-perfecto            upsell
