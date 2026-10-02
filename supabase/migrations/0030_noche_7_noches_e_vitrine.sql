-- =====================================================================
-- 0030_noche_7_noches_e_vitrine.sql
-- BodyMy — Ritual Noche Perfecta: 7 noches e presença na vitrine.
--
-- Dois ajustes:
--
-- 1) O protocolo é de 7 NOCHES (uma Vibración Nocturna por noite, VN1→VN7).
--    O 0028 cadastrou "14 noches" repetindo o ciclo de 7 áudios; o produto
--    vendido tem 7, e o de 21 noites é o upsell de manutenção.
--
-- 2) NENHUM produto oferecia o Ritual Noche Perfecta. A vitrine (getEsteira)
--    só mostra o que está em product_upsells a partir do que a aluna já tem,
--    então o produto existia no banco mas era invisível para as 47 alunas
--    ativas — não aparecia em "Para ti" nem em "Descubre".
--
-- Idempotente — UPDATE + INSERT-se-não-existe, sem ON CONFLICT (o banco de
-- produção não tem as uniques que o ON CONFLICT exigiria).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Produto e programa: 7 noches
-- ---------------------------------------------------------------------
update public.products
   set descricao = 'Reprogramación cerebral del sueño en 7 minutos. 7 noches, 7 vibraciones nocturnas.',
       sales_page = jsonb_build_object(
         'headline', 'Vuelve a dormir en 7 noches',
         'subheadline', 'Una Vibración Nocturna de 7 minutos por noche. Te acuestas, cierras los ojos y el audio hace el resto.',
         'bullets', jsonb_build_array(
           '7 audios de ~7 minutos, uno por noche',
           'Sin pastillas, sin levantarte de la cama',
           'Incluye el audio de rescate para las madrugadas'
         ),
         'cta_label', 'QUIERO DORMIR BIEN'
       )
 where slug = 'ritual-noche-perfecta';

update public.programs
   set descricao = '7 noches para reprogramar tu sueño, 7 minutos cada una.',
       duracao_semanas = 1
 where slug = 'ritual-noche-perfecta';

-- Registros além da noite 7 não deveriam existir (o produto nunca teve
-- alunas), mas se existirem eles travariam a tela: a aluna ficaria com
-- "concluidas" acima do total e o módulo nasceria terminado.
delete from public.noche_registros where noche > 7;

-- ---------------------------------------------------------------------
-- 2) A vitrine passa a oferecer o Ritual Noche Perfecta
--
-- Ordem 0: ele entra ANTES dos outros upsells. É o carro-chefe e o público
-- é o mesmo — quem tem dor articular aos 55 quase sempre dorme mal.
-- ---------------------------------------------------------------------
do $$
declare
  v_noche uuid;
  r record;
begin
  select id into v_noche from public.products where slug = 'ritual-noche-perfecta';
  if v_noche is null then
    raise exception 'Produto ritual-noche-perfecta não encontrado.';
  end if;

  for r in
    select id, slug from public.products
     where slug in (
       'ritual-do-tapetinho',
       'descompresion-rodillas',
       'pilates-hormonal',
       'pilates-de-cadeira',
       'reset-postura-cisne',
       'suelta-la-cadera',
       'suelta-la-espalda-baja',
       'suelta-las-manos'
     )
  loop
    update public.product_upsells
       set ordem = 0, ativo = true
     where product_id = r.id and upsell_product_id = v_noche;

    insert into public.product_upsells (product_id, upsell_product_id, ordem, ativo)
    select r.id, v_noche, 0, true
     where not exists (
       select 1 from public.product_upsells
        where product_id = r.id and upsell_product_id = v_noche
     );
  end loop;
end $$;
