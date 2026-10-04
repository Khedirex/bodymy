-- =====================================================================
-- 0036_escutas_e_pergunta_do_dia_seguinte.sql
-- BodyMy — "¿Cómo fue anoche?" no dia seguinte, não no fim do áudio.
--
-- A pergunta no fim da faixa tinha um defeito de origem: o objetivo do
-- produto é que ela DURMA antes do áudio terminar. Quem dorme não responde
-- formulário — e quem responde é justamente quem não dormiu. O retorno viria
-- envenenado, dizendo que nada funciona.
--
-- Então registramos o que ela abriu (audio_escutas, um por dia) e a pergunta
-- aparece no dia seguinte, quando ela volta ao módulo e já sabe como foi a
-- noite. Cada resposta recebe uma devolutiva própria.
-- =====================================================================

create table if not exists public.audio_escutas (
  user_id uuid not null references auth.users(id) on delete cascade,
  audio_id uuid not null references public.audio_biblioteca(id) on delete cascade,
  data date not null,
  modulo text not null,
  criado_em timestamptz not null default now(),
  primary key (user_id, audio_id, data)
);

create index if not exists audio_escutas_user_data_idx on public.audio_escutas (user_id, data desc);

-- RLS ligada e SEM policy: escrita pelo servidor, leitura só no painel.
alter table public.audio_escutas enable row level security;

comment on table public.audio_escutas is
  'Que áudio a aluna abriu em que dia. Serve para perguntar "como foi ontem?" no dia seguinte.';

-- ---------------------------------------------------------------------
-- O retorno é da NOITE, não da faixa.
--
-- Ao acordar ela não distingue um áudio do outro — distingue se dormiu.
-- Perguntar por áudio faria quem ouviu três responder três vezes, e ninguém
-- faz isso. audio_id vira opcional (guardado quando a noite teve um só, para
-- saber que faixa tocava nas noites mal avaliadas) e a chave do retorno
-- passa a ser aluna + produto + noite.
-- ---------------------------------------------------------------------
alter table public.audio_feedback alter column audio_id drop not null;
alter table public.audio_feedback add column if not exists data date;
update public.audio_feedback set data = created_at::date where data is null;
alter table public.audio_feedback alter column data set not null;
alter table public.audio_feedback alter column data set default current_date;

create unique index if not exists audio_feedback_user_modulo_data_key
  on public.audio_feedback (user_id, modulo, data);

comment on column public.audio_feedback.audio_id is
  'Opcional: o áudio da noite, quando havia um só. O retorno é da noite (modulo + data).';
