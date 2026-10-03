-- =====================================================================
-- 0034_noche_em_blocos.sql
-- BodyMy — Ritual Noche Perfecta passa a viver no catálogo, em blocos.
--
-- Antes: 7 áudios fixos num array do código, servidos de public/ sem login.
-- Agora: 5 blocos de 7, no bucket privado, com link assinado.
--
--   Preparación     7 · sequência
--   Módulo 1        7 · sequência
--   Módulo 2        7 · sequência   → 21 noites em ordem
--   Refuerzo        7 · fora de ordem, "se o sono não melhorou"
--   Reset Profundo  7 · fora de ordem, último recurso
--
-- Trocar um áudio ou acrescentar um bloco vira upload no painel, não deploy.
-- =====================================================================

alter table public.audio_biblioteca add column if not exists bloco text;
alter table public.audio_biblioteca add column if not exists resgate boolean not null default false;

create index if not exists audio_biblioteca_modulo_bloco_idx
  on public.audio_biblioteca (modulo, bloco, ordem);

comment on column public.audio_biblioteca.bloco is
  'Agrupamento dentro do módulo (ex.: preparacion, modulo-1, refuerzo). Null = biblioteca sem blocos.';
comment on column public.audio_biblioteca.resgate is
  'Áudio que ela pode abrir a qualquer momento, fora da sequência (madrugada).';

-- Nenhum dado a migrar: noche_registros estava vazio quando isto rodou
-- (nenhuma aluna tinha progresso), então a troca de conteúdo não quebra
-- ninguém. Se um dia houver progresso, a conversão teria de mapear o número
-- da noite antiga para o áudio novo antes de trocar o catálogo.
