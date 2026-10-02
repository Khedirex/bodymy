-- =====================================================================
-- 0027_reverte_hotmart_8385058.sql
-- BodyMy — Devolve o id Hotmart 8385058 ao produto que libera o protocolo
-- principal (pilates-hormonal), como na 0015.
--
-- O 8385058 é o "Protocolo Regeneración Articular - Reto de 14 Días" na
-- Hotmart. A 0026 o tinha movido para o Reset Postura de Cisne por engano.
-- Quem comprou nesse intervalo recebe o acesso que pagou (o acesso ao
-- Cisne que ganhou por engano não é removido).
--
-- O id Hotmart do Cisne continua NULL até ser confirmado em
-- Hotmart → Produtos → (o produto) → ID. Idempotente.
-- (Aplicada em produção em 02/10/2026.)
-- =====================================================================

update public.products
   set hotmart_product_id = null
 where slug = 'reset-postura-cisne' and hotmart_product_id = '8385058';

update public.products
   set hotmart_product_id = '8385058'
 where slug = 'pilates-hormonal' and hotmart_product_id is distinct from '8385058';

-- Compradoras afetadas: tinham o Cisne via Hotmart e nenhum acesso ao protocolo.
insert into public.entitlements (user_id, product_id, origem, status)
select e.user_id, ph.id, 'hotmart', 'ativo'
  from public.entitlements e
  join public.products c on c.id = e.product_id and c.slug = 'reset-postura-cisne'
 cross join (select id from public.products where slug = 'pilates-hormonal') ph
 where e.origem = 'hotmart'
   and not exists (
     select 1 from public.entitlements x where x.user_id = e.user_id and x.product_id = ph.id
   );

notify pgrst, 'reload schema';

select slug, hotmart_product_id from public.products
 where slug in ('pilates-hormonal', 'reset-postura-cisne');
