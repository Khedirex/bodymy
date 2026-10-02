-- =====================================================================
-- 0028_ritual_noche_perfecta.sql
-- BodyMy — Esteira completa do Ritual Noche Perfecta.
--
--   FRONT   Ritual Noche Perfecta — Reprogramación cerebral del sueño
--   BUMPS   Oración Milagrosa para Noches Bendecidas
--           Protocolo Reset Madrugada
--           Receta Natural Pre-Sueño
--   UPSELLS Ritual de Mantenimiento 21 Noches
--           Ritual Día Perfecto
--
-- Cria os produtos, o programa do front, a esteira (product_upsells) e as
-- tabelas de progresso do módulo. Os hotmart_product_id ficam NULOS: assim
-- que você me passar os ids, é um UPDATE e o webhook passa a liberar sozinho.
--
-- Até lá o acesso é concedido manualmente (origem 'manual'), como nos
-- outros produtos.
--
-- Idempotente — usa UPDATE + INSERT-se-não-existe, sem ON CONFLICT.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Produtos da esteira
-- ---------------------------------------------------------------------
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('ritual-noche-perfecta',
       'Ritual Noche Perfecta',
       'programa',
       'Reprogramación cerebral del sueño en 7 minutos. 14 noches, 7 vibraciones nocturnas.'),
      ('oracion-noches-bendecidas',
       'Oración Milagrosa para Noches Bendecidas',
       'extra',
       'Una oración breve para entregar el día y dormir en paz.'),
      ('protocolo-reset-madrugada',
       'Protocolo Reset Madrugada',
       'extra',
       'Qué hacer cuando despiertas de madrugada y no logras volver a dormir.'),
      ('receta-natural-pre-sueno',
       'Receta Natural Pre-Sueño',
       'extra',
       'Una receta simple para tomar antes de acostarte.'),
      ('ritual-mantenimiento-21-noches',
       'Ritual de Mantenimiento 21 Noches',
       'programa',
       'Para que el sueño reconquistado no se pierda: 21 noches de mantenimiento.'),
      ('ritual-dia-perfecto',
       'Ritual Día Perfecto',
       'programa',
       'El complemento diurno: energía estable para sostener tus noches.')
    ) as t(slug, nome, tipo, descricao)
  loop
    update public.products
       set nome = r.nome, tipo = r.tipo, descricao = r.descricao, ativo = true
     where slug = r.slug;

    insert into public.products (slug, nome, tipo, descricao, ativo)
    select r.slug, r.nome, r.tipo, r.descricao, true
     where not exists (select 1 from public.products where slug = r.slug);
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 2) Programa do front (o mini-app vive aqui)
-- ---------------------------------------------------------------------
do $$
declare
  v_product_id uuid;
begin
  select id into v_product_id from public.products where slug = 'ritual-noche-perfecta';
  if v_product_id is null then
    raise exception 'Produto ritual-noche-perfecta não foi criado.';
  end if;

  update public.programs
     set nome = 'Ritual Noche Perfecta',
         descricao = '14 noches para reprogramar tu sueño, 7 minutos cada una.',
         duracao_semanas = 2,
         ativo = true,
         product_id = v_product_id
   where slug = 'ritual-noche-perfecta';

  insert into public.programs (product_id, slug, nome, descricao, duracao_semanas, ordem_exibicao, ativo)
  select v_product_id, 'ritual-noche-perfecta', 'Ritual Noche Perfecta',
         '14 noches para reprogramar tu sueño, 7 minutos cada una.', 2, 1, true
   where not exists (select 1 from public.programs where slug = 'ritual-noche-perfecta');
end $$;

-- ---------------------------------------------------------------------
-- 3) Esteira: quem compra o front vê bumps e upsells
-- ---------------------------------------------------------------------
do $$
declare
  v_front uuid;
  r record;
begin
  select id into v_front from public.products where slug = 'ritual-noche-perfecta';

  for r in
    select * from (values
      ('oracion-noches-bendecidas', 1),
      ('protocolo-reset-madrugada', 2),
      ('receta-natural-pre-sueno', 3),
      ('ritual-mantenimiento-21-noches', 4),
      ('ritual-dia-perfecto', 5)
    ) as t(slug, ordem)
  loop
    insert into public.product_upsells (product_id, upsell_product_id, ordem, ativo)
    select v_front, p.id, r.ordem, true
      from public.products p
     where p.slug = r.slug
       and not exists (
         select 1 from public.product_upsells u
          where u.product_id = v_front and u.upsell_product_id = p.id
       );

    update public.product_upsells u
       set ordem = r.ordem, ativo = true
      from public.products p
     where p.slug = r.slug
       and u.product_id = v_front
       and u.upsell_product_id = p.id;
  end loop;
end $$;

-- ---------------------------------------------------------------------
-- 4) Progresso do módulo
--    noche_registros: uma linha por noite concluída (base do progresso).
--    noche_estado:    nível, checkpoints e diário — o estado do protocolo.
-- ---------------------------------------------------------------------
create table if not exists public.noche_registros (
  user_id uuid not null references public.profiles(id) on delete cascade,
  noche int not null check (noche between 1 and 60),
  audio_id text not null,
  repeticao boolean not null default false,
  concluida_em timestamptz not null default now(),
  primary key (user_id, noche)
);
create index if not exists noche_registros_user_idx on public.noche_registros(user_id, noche);

create table if not exists public.noche_estado (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  nivel text check (nivel in ('leve', 'moderada', 'severa')),
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.noche_registros enable row level security;
alter table public.noche_estado    enable row level security;

drop policy if exists "noche_registros_select_own" on public.noche_registros;
create policy "noche_registros_select_own" on public.noche_registros
  for select using (auth.uid() = user_id);

drop policy if exists "noche_estado_select_own" on public.noche_estado;
create policy "noche_estado_select_own" on public.noche_estado
  for select using (auth.uid() = user_id);

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select slug, nome, tipo from public.products
 where slug in ('ritual-noche-perfecta','oracion-noches-bendecidas','protocolo-reset-madrugada',
                'receta-natural-pre-sueno','ritual-mantenimiento-21-noches','ritual-dia-perfecto')
 order by slug;

select f.slug as front, u.ordem, a.slug as oferta, u.ativo
  from public.product_upsells u
  join public.products f on f.id = u.product_id
  join public.products a on a.id = u.upsell_product_id
 where f.slug = 'ritual-noche-perfecta'
 order by u.ordem;

-- ---------------------------------------------------------------------
-- 5) Ids da Hotmart + o Combo 3 en 1 (aplicados em produção em 02/10)
--    Com eles o webhook libera o acesso sozinho.
-- ---------------------------------------------------------------------
update public.products p
   set hotmart_product_id = v.id
  from (values
    ('ritual-noche-perfecta','8642135'),
    ('oracion-noches-bendecidas','8642386'),
    ('protocolo-reset-madrugada','8642376'),
    ('receta-natural-pre-sueno','8642381'),
    ('ritual-mantenimiento-21-noches','8642395'),
    ('ritual-dia-perfecto','8642393')
  ) as v(slug, id)
 where p.slug = v.slug and p.hotmart_product_id is distinct from v.id;

insert into public.products (slug, nome, tipo, descricao, hotmart_product_id, ativo)
select 'combo-3-en-1-noche', 'Combo 3 en 1 — Ritual Noche Perfecta', 'bundle',
       'Oración Milagrosa + Protocolo Reset Madrugada + Receta Natural Pre-Sueño.',
       '8642365', true
 where not exists (select 1 from public.products where slug = 'combo-3-en-1-noche');
