-- =====================================================================
-- 0009_cronometro.sql
-- BodyMy — Cronômetro guiado de execução e descanso.
--
-- Adiciona o que o cronômetro precisa (idempotente):
--   * exercises.tipo        — 'tempo' | 'repeticao' | 'permanencia'
--   * exercises.bilateral   — alterna lados (direito/esquerdo)
--   * user_training_config.tempo_execucao_seg — duração da execução por
--     série nos exercícios do tipo 'tempo' (ponto de partida por faixa).
--
-- NOTA (defaults a confirmar): sem o prompt-base de "repetições e tempo",
-- todos os exercícios entram como tipo 'tempo' (o admin ajusta por exercício
-- em /admin/exercicios) e tempo_execucao_seg entra em 30s para todas as
-- faixas. Marcamos como bilaterais os 4 citados no complemento.
-- =====================================================================

alter table public.exercises
  add column if not exists tipo text not null default 'tempo'
    check (tipo in ('tempo','repeticao','permanencia'));
alter table public.exercises
  add column if not exists bilateral boolean not null default false;

alter table public.user_training_config
  add column if not exists tempo_execucao_seg int not null default 30
    check (tempo_execucao_seg between 10 and 120);

-- Marca como bilaterais os exercícios citados no complemento.
update public.exercises set bilateral = true
 where nome in ('Figura quatro', 'Equilíbrio de um pé', 'Alongamento em C', 'Nuca longa');

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select * from (values
  ('coluna exercises.tipo', (select case when exists (select 1 from information_schema.columns where table_name='exercises' and column_name='tipo') then 'OK' else 'FALTA' end)),
  ('coluna exercises.bilateral', (select case when exists (select 1 from information_schema.columns where table_name='exercises' and column_name='bilateral') then 'OK' else 'FALTA' end)),
  ('coluna tempo_execucao_seg', (select case when exists (select 1 from information_schema.columns where table_name='user_training_config' and column_name='tempo_execucao_seg') then 'OK' else 'FALTA' end)),
  ('exercicios bilaterais marcados', (select count(*)::text from public.exercises where bilateral))
) as v(verificacao, valor) order by verificacao;
