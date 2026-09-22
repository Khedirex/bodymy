-- =====================================================================
-- 0018_protocolos_por_produto.sql
-- BodyMy — Separa o app POR PRODUTO. Cada produto vendável aponta para um
-- CIRCUITO próprio (catálogo de exercícios + bloco de mobilidade + semanas),
-- e a aluna só recebe o conteúdo dos produtos que comprou.
--
--   * circuitos            — catálogo de protocolos (slug, nome, nº de semanas)
--   * products.circuito    — qual circuito o produto libera
--   * exercises/stretches/program_weeks_config/user_training_config/
--     training_sessions    — ganham a coluna `circuito` (tudo que existia
--                            vira do circuito legado 'drenagem')
--
-- Produto principal (Hotmart 8385058): "Protocolo Descompresión Articular -
-- Reto de 14 Días" → circuito 'rodillas' (2 semanas × 7 dias). Deixa de ser
-- o mesmo produto do 'pilates-hormonal' (Kiwify), que segue no circuito
-- legado. Quem comprou pela Hotmart passa para o produto de rodillas.
--
-- Esteira: "Suelta la Cadera" (8565517), "Suelta la Espalda Baja" (8565495)
-- e "Suelta las Manos" (8565546), cada um com o próprio circuito de 7 dias.
--
-- O CONTEÚDO dos novos circuitos vem em 0019_conteudo_protocolos.sql
-- (gerada). Rode esta ANTES do deploy do código novo. Idempotente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Catálogo de circuitos (protocolos)
-- ---------------------------------------------------------------------
create table if not exists public.circuitos (
  slug text primary key,
  nome text not null,
  semanas int not null default 1 check (semanas between 1 and 4),
  -- Programa de leitura complementar (/entenda), opcional.
  programa_slug text,
  created_at timestamptz not null default now()
);
alter table public.circuitos enable row level security;
drop policy if exists "circuitos_read_auth" on public.circuitos;
create policy "circuitos_read_auth" on public.circuitos
  for select to authenticated using (true);

insert into public.circuitos (slug, nome, semanas, programa_slug) values
  ('drenagem', 'Protocolo 28 Días', 4, 'drenagem-tailandesa'),
  ('rodillas', 'Descompresión Articular — Rodillas', 2, null),
  ('cadera',   'Suelta la Cadera', 1, null),
  ('lumbar',   'Suelta la Espalda Baja', 1, null),
  ('manos',    'Suelta las Manos', 1, null)
on conflict (slug) do update
  set nome = excluded.nome,
      semanas = excluded.semanas,
      programa_slug = excluded.programa_slug;

-- ---------------------------------------------------------------------
-- 2) products.circuito — qual circuito o produto libera
-- ---------------------------------------------------------------------
alter table public.products
  add column if not exists circuito text references public.circuitos(slug);

update public.products set circuito = 'drenagem'
 where slug in ('drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-hormonal')
   and circuito is null;

-- ---------------------------------------------------------------------
-- 3) Catálogo e estado do circuito passam a ser POR circuito
-- ---------------------------------------------------------------------
-- exercises
alter table public.exercises
  add column if not exists circuito text not null default 'drenagem' references public.circuitos(slug);
alter table public.exercises drop constraint if exists exercises_dia_do_ciclo_ordem_no_dia_key;
create unique index if not exists exercises_circuito_dia_ordem_uq
  on public.exercises(circuito, dia_do_ciclo, ordem_no_dia);

-- stretches (bloco de mobilidade)
alter table public.stretches
  add column if not exists circuito text not null default 'drenagem' references public.circuitos(slug);
alter table public.stretches drop constraint if exists stretches_ordem_key;
create unique index if not exists stretches_circuito_ordem_uq on public.stretches(circuito, ordem);

-- program_weeks_config: PK (semana) → (circuito, semana)
alter table public.program_weeks_config
  add column if not exists circuito text not null default 'drenagem' references public.circuitos(slug);
do $$
begin
  if not exists (
    select 1 from information_schema.key_column_usage
     where table_schema = 'public' and table_name = 'program_weeks_config'
       and constraint_name = 'program_weeks_config_pkey' and column_name = 'circuito'
  ) then
    alter table public.program_weeks_config drop constraint if exists program_weeks_config_pkey;
    alter table public.program_weeks_config add constraint program_weeks_config_pkey primary key (circuito, semana);
  end if;
end $$;

-- user_training_config: PK (user_id) → (user_id, circuito). Cada protocolo
-- tem o próprio progresso (semana/dia) e intensidade.
alter table public.user_training_config
  add column if not exists circuito text not null default 'drenagem' references public.circuitos(slug);
do $$
begin
  if not exists (
    select 1 from information_schema.key_column_usage
     where table_schema = 'public' and table_name = 'user_training_config'
       and constraint_name = 'user_training_config_pkey' and column_name = 'circuito'
  ) then
    alter table public.user_training_config drop constraint if exists user_training_config_pkey;
    alter table public.user_training_config add constraint user_training_config_pkey primary key (user_id, circuito);
  end if;
end $$;

-- training_sessions
alter table public.training_sessions
  add column if not exists circuito text not null default 'drenagem' references public.circuitos(slug);
create index if not exists training_sessions_circuito_idx on public.training_sessions(user_id, circuito, data);

-- Semanas dos novos circuitos. Rodillas: conteúdo das 2 semanas já está
-- completo (texto), então a Semana 2 nasce liberada — bloqueie em
-- /admin/semanas se quiser esperar os vídeos da v2.
insert into public.program_weeks_config (circuito, semana, liberada) values
  ('rodillas', 1, true),
  ('rodillas', 2, true),
  ('cadera', 1, true),
  ('lumbar', 1, true),
  ('manos', 1, true)
on conflict (circuito, semana) do nothing;

-- ---------------------------------------------------------------------
-- 4) Produto principal: Protocolo Descompresión Articular (rodillas)
-- ---------------------------------------------------------------------
-- O id Hotmart 8385058 deixa de apontar para o 'pilates-hormonal' (Kiwify).
update public.products
   set hotmart_product_id = null,
       nome = 'Pilates Hormonal'
 where slug = 'pilates-hormonal'
   and hotmart_product_id = '8385058';

insert into public.products (slug, nome, descricao, tipo, hotmart_product_id, circuito, ativo, sales_page)
values (
  'descompresion-rodillas',
  'Protocolo Descompresión Articular - Reto de 14 Días',
  'Alivia tus rodillas en casa: 14 días de movimientos suaves para dar espacio a la articulación y moverte con más confianza.',
  'programa',
  '8385058',
  'rodillas',
  true,
  $sp${"headline":"14 días para cuidar tus rodillas en casa","subheadline":"Movimientos suaves que dan espacio a la articulación — sin impacto, sin equipamiento, a tu ritmo.","bullets":["Sesiones guiadas de 10 a 15 minutos, día a día","Bloque de movilidad + 5 ejercicios que se ajustan a ti","Pensado para quien siente las rodillas rígidas o cansadas"],"cta_label":"QUIERO EL RETO"}$sp$::jsonb
)
on conflict (slug) do update
  set nome = excluded.nome,
      descricao = excluded.descricao,
      tipo = excluded.tipo,
      hotmart_product_id = excluded.hotmart_product_id,
      circuito = excluded.circuito,
      ativo = true;

-- Quem comprou o 8385058 pela Hotmart (entitlement no 'pilates-hormonal')
-- passa para o produto de rodillas — mantém data e referência do pedido.
insert into public.entitlements (user_id, product_id, origem, kiwify_order_id, status, created_at)
select e.user_id, r.id, e.origem, e.kiwify_order_id, e.status, e.created_at
  from public.entitlements e
  join public.products p on p.id = e.product_id and p.slug = 'pilates-hormonal'
 cross join (select id from public.products where slug = 'descompresion-rodillas') r
 where e.origem = 'hotmart'
on conflict (user_id, product_id) do nothing;

delete from public.entitlements e
 using public.products p
 where p.id = e.product_id
   and p.slug = 'pilates-hormonal'
   and e.origem = 'hotmart';

-- ---------------------------------------------------------------------
-- 5) Produtos da esteira (Hotmart). Checkout URL/preço ficam para o admin
--    (não são sobrescritos ao rodar de novo).
-- ---------------------------------------------------------------------
insert into public.products (slug, nome, descricao, tipo, hotmart_product_id, circuito, ativo, sales_page)
values
  (
    'suelta-la-cadera',
    'Suelta la Cadera',
    '7 días de movimientos suaves para liberar la cadera y caminar con más soltura.',
    'programa', '8565517', 'cadera', true,
    $sp${"headline":"Suelta la cadera en 7 días","subheadline":"Tu cadera sostiene tus rodillas. Movimientos suaves para ganar soltura y caminar más ligera.","bullets":["7 sesiones cortas, guiadas paso a paso","Bloque de movilidad + ejercicios que se ajustan a ti","Complementa tu reto de rodillas"],"cta_label":"QUIERO SOLTAR MI CADERA"}$sp$::jsonb
  ),
  (
    'suelta-la-espalda-baja',
    'Suelta la Espalda Baja (lumbar)',
    '7 días de movimientos suaves para aliviar la sensación de rigidez en la zona lumbar.',
    'programa', '8565495', 'lumbar', true,
    $sp${"headline":"Suelta tu espalda baja en 7 días","subheadline":"Movimientos suaves para la zona lumbar — sin abdominales, sin impacto, en casa.","bullets":["7 sesiones cortas, guiadas paso a paso","Bloque de movilidad + ejercicios que se ajustan a ti","Para levantarte y agacharte con más confianza"],"cta_label":"QUIERO SOLTAR MI ESPALDA"}$sp$::jsonb
  ),
  (
    'suelta-las-manos',
    'Suelta las Manos',
    '7 días de movimientos suaves para manos, dedos y muñecas.',
    'programa', '8565546', 'manos', true,
    $sp${"headline":"Suelta tus manos en 7 días","subheadline":"Movimientos suaves para dedos y muñecas — pocos minutos al día, en cualquier lugar.","bullets":["7 sesiones cortas, guiadas paso a paso","Movilidad de dedos, manos y muñecas","Para abrir frascos, escribir y cocinar con más soltura"],"cta_label":"QUIERO SOLTAR MIS MANOS"}$sp$::jsonb
  )
on conflict (slug) do update
  set nome = excluded.nome,
      descricao = excluded.descricao,
      tipo = excluded.tipo,
      hotmart_product_id = excluded.hotmart_product_id,
      circuito = excluded.circuito,
      ativo = true;

-- ---------------------------------------------------------------------
-- 6) Esteira: cada protocolo articular oferece os outros três; o de
--    rodillas oferece também o Acompañamiento Diario.
-- ---------------------------------------------------------------------
insert into public.product_upsells (product_id, upsell_product_id, ordem, ativo)
select o.id, u.id, x.ordem, true
  from (values
    ('descompresion-rodillas', 'suelta-la-cadera', 1),
    ('descompresion-rodillas', 'suelta-la-espalda-baja', 2),
    ('descompresion-rodillas', 'suelta-las-manos', 3),
    ('descompresion-rodillas', 'acompanhamento-diario', 4),
    ('suelta-la-cadera', 'descompresion-rodillas', 1),
    ('suelta-la-cadera', 'suelta-la-espalda-baja', 2),
    ('suelta-la-cadera', 'suelta-las-manos', 3),
    ('suelta-la-espalda-baja', 'descompresion-rodillas', 1),
    ('suelta-la-espalda-baja', 'suelta-la-cadera', 2),
    ('suelta-la-espalda-baja', 'suelta-las-manos', 3),
    ('suelta-las-manos', 'descompresion-rodillas', 1),
    ('suelta-las-manos', 'suelta-la-cadera', 2),
    ('suelta-las-manos', 'suelta-la-espalda-baja', 3)
  ) as x(origem, upsell, ordem)
  join public.products o on o.slug = x.origem
  join public.products u on u.slug = x.upsell
on conflict (product_id, upsell_product_id) do nothing;

-- O Acompañamiento Diario serve a qualquer protocolo (não só o hormonal).
update public.products
   set descricao = 'Asistente que te acompaña cada día del reto: adapta tu sesión, responde tus dudas y orienta tu alimentación como apoyo a tu protocolo.'
 where slug = 'acompanhamento-diario';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select * from (values
  ('circuitos (esperado 5)', (select count(*)::text from public.circuitos)),
  ('produto principal', (select slug || ' → hotmart:' || coalesce(hotmart_product_id, '—') || ' / circuito:' || coalesce(circuito, '—')
                           from public.products where slug = 'descompresion-rodillas')),
  ('produtos com hotmart 8385058 (esperado 1)', (select count(*)::text from public.products where hotmart_product_id = '8385058')),
  ('produtos da esteira com circuito (esperado 3)', (select count(*)::text from public.products
                           where slug in ('suelta-la-cadera','suelta-la-espalda-baja','suelta-las-manos') and circuito is not null)),
  ('upsells do produto principal (esperado 4)', (select count(*)::text from public.product_upsells pu
                           join public.products p on p.id = pu.product_id where p.slug = 'descompresion-rodillas')),
  ('alunas no produto principal', (select count(*)::text from public.entitlements e
                           join public.products p on p.id = e.product_id where p.slug = 'descompresion-rodillas' and e.status = 'ativo')),
  ('exercicios legado (drenagem)', (select count(*)::text from public.exercises where circuito = 'drenagem'))
) as v(verificacao, valor) order by verificacao;
