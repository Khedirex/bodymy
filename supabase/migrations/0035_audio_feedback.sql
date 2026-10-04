-- =====================================================================
-- 0035_audio_feedback.sql
-- BodyMy — o que a aluna achou do áudio, perguntado quando ele termina.
--
-- A pergunta aparece sozinha no fim de cada áudio, com três respostas de um
-- toque. É o único retorno que temos de um produto que ela usa de olhos
-- fechados: não há vídeo assistido, não há exercício marcado, e se ela
-- dormir no meio (que é o objetivo) nunca volta para avaliar depois.
-- =====================================================================

create table if not exists public.audio_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  audio_id uuid not null references public.audio_biblioteca(id) on delete cascade,
  modulo text not null,
  resposta text not null check (resposta in ('dormi','relajo','no_ayudo')),
  comentario text,
  created_at timestamptz not null default now()
);

create index if not exists audio_feedback_modulo_idx on public.audio_feedback (modulo, created_at desc);
create index if not exists audio_feedback_audio_idx on public.audio_feedback (audio_id);

-- RLS ligada e SEM policy: a escrita passa pela rota autenticada e a leitura
-- só acontece no painel, com a service role.
alter table public.audio_feedback enable row level security;

comment on table public.audio_feedback is
  'O que a aluna respondeu quando o áudio terminou. Escrita pelo servidor; leitura só no painel.';
