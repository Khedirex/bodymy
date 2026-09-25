-- =====================================================================
-- 0020_nome_protocolo_descompressao.sql
-- BodyMy — Define o nome definitivo do produto/programa canônico:
--
--     "Protocolo Descompresión Articular — Reto 14 días"
--
-- Por que existe: a 0018 renomeava por substituição de texto ("28"→"14",
-- "Protocolo"→"Reto") e, como este produto se chamava apenas
-- "Descompresión Articular", ela não o alcançou. Aqui o nome é definido
-- explicitamente, de uma vez.
--
-- O nome aparece no card "Tus cursos", no e-mail de boas-vindas e na página
-- de obrigado — por isso produto e programa ficam alinhados.
--
-- Mantém id, slug, entitlements e os ids de Kiwify/Hotmart. Idempotente.
-- =====================================================================

-- Produto canônico (slug atual + o anterior, por resiliência ao rename).
update public.products
   set nome = 'Protocolo Descompresión Articular — Reto 14 días'
 where slug in ('drenagem-tailandesa', 'ritual-do-tapetinho')
   and nome is distinct from 'Protocolo Descompresión Articular — Reto 14 días';

-- Programa (trilha de treino) do mesmo produto, para não divergir da vitrine.
update public.programs p
   set nome = 'Protocolo Descompresión Articular — Reto 14 días'
  from public.products pr
 where pr.id = p.product_id
   and pr.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho')
   and p.nome is distinct from 'Protocolo Descompresión Articular — Reto 14 días';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select slug, nome from public.products
 where slug in ('drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-hormonal')
 order by slug;

select p.slug, p.nome, p.duracao_semanas
  from public.programs p
  join public.products pr on pr.id = p.product_id
 where pr.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho');
