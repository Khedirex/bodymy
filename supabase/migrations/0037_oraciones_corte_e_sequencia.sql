-- =====================================================================
-- 0037_oraciones_corte_e_sequencia.sql
-- BodyMy — o corte das oraciones e as bibliotecas em sequência.
--
-- 1) Oraciones: das 40 do catálogo, as 23 primeiras ficam no bump e as 17
--    seguintes passam ao upsell. O cadeado já era por áudio, então o corte é
--    uma troca de product_id — nada de código.
--
-- 2) Mantenimiento 21 Noches deixa de ser lista e vira SEQUÊNCIA: uma noite
--    por dia, com avanço guardado. Sem isso ela ouviria as 21 numa tarde, e
--    é a constância que este produto vende.
-- =====================================================================

update public.audio_biblioteca
   set product_id = (select id from public.products where slug = 'oraciones-coleccion-completa')
 where modulo = 'oraciones' and ordem > 23;

update public.products
   set nome = 'Colección Completa de Oraciones',
       descricao = 'Las 17 oraciones que faltan, desbloqueadas para siempre.',
       kiwify_checkout_url = 'https://pay.hotmart.com/U107859451G?off=5cq1zlnf'
 where slug = 'oraciones-coleccion-completa';

-- Avanço das bibliotecas em sequência.
create table if not exists public.biblioteca_progresso (
  user_id uuid not null,
  modulo text not null,
  numero int not null,
  audio_id uuid,
  concluida_em timestamptz not null default now(),
  primary key (user_id, modulo, numero)
);

alter table public.biblioteca_progresso enable row level security;

drop policy if exists biblioteca_progresso_select_own on public.biblioteca_progresso;
create policy biblioteca_progresso_select_own on public.biblioteca_progresso
  for select using (auth.uid() = user_id);

comment on table public.biblioteca_progresso is
  'Avanço das bibliotecas em sequência (uma noite por dia), como o Mantenimiento 21 Noches.';
