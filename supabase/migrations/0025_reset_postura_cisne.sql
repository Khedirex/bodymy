-- =====================================================================
-- 0025_reset_postura_cisne.sql
-- BodyMy — Módulo novo: "Reset Postura de Cisne — Reto 14 días".
--
-- Rotina de 14 dias para o pescoço/postura, feita na cama:
--   • dias 1–7: 7 sessões com 4 movimentos cada;
--   • dias 8–14: o mesmo ciclo, numa intensidade maior.
--
-- O CONTEÚDO (12 exercícios, plano diário, conselhos) vive no código, em
-- src/lib/cisne.ts. Aqui ficam só:
--   1. o PRODUTO (vendido na Hotmart) e o seu PROGRAMA;
--   2. cisne_registros — o diário da aluna (dia feito + "¿cómo quedó tu
--      cuello?" de 1 a 5), com RLS de dono;
--   3. a vitrine: o produto entra como upsell dos produtos do protocolo
--      canônico (aparece com cadeado em "Para ti" / Descubre).
--
-- Hotmart: o webhook casa o produto pelo ID NUMÉRICO (data.product.id),
-- que NÃO é o código do link pay.hotmart.com/C107702699A. Preencha
-- hotmart_product_id no /admin/produtos (ou no UPDATE comentado no fim).
--
-- Sem ON CONFLICT (produção já teve uniques ausentes → erro 42P10):
-- UPDATE + INSERT-se-não-existe. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Produto
-- ---------------------------------------------------------------------
update public.products
   set nome                = 'Reset Postura de Cisne — Reto 14 días',
       descricao           = 'Rutina guiada de 14 días para alinear tu cuello, abrir tus hombros y recuperar un perfil más largo y elegante. Todo, acostada en tu cama.',
       tipo                = 'programa',
       kiwify_checkout_url = coalesce(kiwify_checkout_url, 'https://pay.hotmart.com/C107702699A?checkoutMode=10'),
       ativo               = true
 where slug = 'reset-postura-cisne';

insert into public.products (slug, nome, descricao, tipo, kiwify_checkout_url, sales_page, ativo)
select 'reset-postura-cisne',
       'Reset Postura de Cisne — Reto 14 días',
       'Rutina guiada de 14 días para alinear tu cuello, abrir tus hombros y recuperar un perfil más largo y elegante. Todo, acostada en tu cama.',
       'programa',
       'https://pay.hotmart.com/C107702699A?checkoutMode=10',
       jsonb_build_object(
         'headline', 'Reset Postura de Cisne',
         'subheadline', 'Tu cuello no está “viejo”. Está desalineado. En 14 días, 10 minutos al día y acostada en tu cama, devuelve la cabeza a su lugar.',
         'imagem_url', '/guias/cisne/capa.webp',
         'bullets', jsonb_build_array(
           '4 movimientos por sesión, guiados paso a paso con dibujo',
           '10 minutos al día, sin bajar al piso: todo en tu cama',
           'Semana 1 para aprender, semana 2 con más intensidad',
           'Alinea el cuello, abre los hombros y afina el perfil',
           'Registro diario de cómo quedó tu cuello y fotos del día 1, 7 y 14'
         ),
         'cta_label', 'QUIERO MI POSTURA DE CISNE'
       ),
       true
 where not exists (select 1 from public.products where slug = 'reset-postura-cisne');

-- ---------------------------------------------------------------------
-- 2) Programa (é por ele que "Tus cursos" e /oferta chegam ao módulo)
-- ---------------------------------------------------------------------
update public.programs p
   set nome            = 'Reset Postura de Cisne — Reto 14 días',
       descricao       = '14 días · 10 minutos al día · en tu cama',
       capa_url        = '/guias/cisne/capa.webp',
       duracao_semanas = 2,
       ativo           = true
  from public.products pr
 where pr.id = p.product_id
   and pr.slug = 'reset-postura-cisne'
   and p.slug = 'reset-postura-cisne';

insert into public.programs (product_id, slug, nome, descricao, capa_url, duracao_semanas, ordem_exibicao, ativo)
select pr.id,
       'reset-postura-cisne',
       'Reset Postura de Cisne — Reto 14 días',
       '14 días · 10 minutos al día · en tu cama',
       '/guias/cisne/capa.webp',
       2,
       10, -- depois do protocolo canônico (ordem 0)
       true
  from public.products pr
 where pr.slug = 'reset-postura-cisne'
   and not exists (select 1 from public.programs where slug = 'reset-postura-cisne');

-- ---------------------------------------------------------------------
-- 3) Diário da aluna: um registro por dia concluído do reto
-- ---------------------------------------------------------------------
create table if not exists public.cisne_registros (
  user_id uuid not null references public.profiles(id) on delete cascade,
  dia int not null check (dia between 1 and 14),
  cuello int check (cuello between 1 and 5), -- 1 = muy tenso, 5 = muy suelto
  data date not null,                        -- dia (America/Sao_Paulo) da conclusão
  concluido_em timestamptz not null default now(),
  primary key (user_id, dia)
);
create index if not exists cisne_registros_user_idx on public.cisne_registros(user_id, data);

alter table public.cisne_registros enable row level security;

drop policy if exists "cisne_select_own" on public.cisne_registros;
drop policy if exists "cisne_insert_own" on public.cisne_registros;
drop policy if exists "cisne_update_own" on public.cisne_registros;
create policy "cisne_select_own" on public.cisne_registros
  for select using (auth.uid() = user_id);
create policy "cisne_insert_own" on public.cisne_registros
  for insert with check (auth.uid() = user_id);
create policy "cisne_update_own" on public.cisne_registros
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 4) Vitrine: upsell dos produtos que liberam o protocolo canônico.
--    O admin pode desligar/reordenar em /admin/produtos → esteira.
-- ---------------------------------------------------------------------
insert into public.product_upsells (product_id, upsell_product_id, ordem, ativo)
select origem.id, cisne.id, 5, true
  from public.products origem
  cross join public.products cisne
 where cisne.slug = 'reset-postura-cisne'
   and origem.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-hormonal')
   and not exists (
     select 1 from public.product_upsells pu
      where pu.product_id = origem.id and pu.upsell_product_id = cisne.id
   );

-- ---------------------------------------------------------------------
-- 5) Hotmart — preencha com o ID numérico do produto (Hotmart → Produtos
--    → o produto → "ID"), e descomente. Sem isso, a compra chega no
--    webhook e responde produto_nao_encontrado (com o id na resposta).
-- ---------------------------------------------------------------------
-- update public.products
--    set hotmart_product_id = '0000000'
--  where slug = 'reset-postura-cisne';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select pr.slug, pr.nome, pr.hotmart_product_id, pr.kiwify_checkout_url, pr.ativo,
       p.slug as programa, p.duracao_semanas, p.ativo as programa_ativo
  from public.products pr
  left join public.programs p on p.product_id = pr.id
 where pr.slug = 'reset-postura-cisne';

select 'tabela cisne_registros' as verificacao,
       case when to_regclass('public.cisne_registros') is not null then 'OK' else 'FALTA' end as valor
union all
select 'upsells para o Cisne',
       (select count(*)::text from public.product_upsells pu
          join public.products c on c.id = pu.upsell_product_id
         where c.slug = 'reset-postura-cisne');
