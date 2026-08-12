/* eslint-disable no-console */
// =====================================================================
// BodyMy — Gera 0008_semana1_e_bloqueio.sql a partir da fonte única
// supabase/content/circuito-semana1.ts.
//
// Faz duas coisas (idempotente):
//   1. Sistema de bloqueio de semanas: tabela program_weeks_config
//      (semana 1 liberada, 2-4 bloqueadas) + coluna aguardando_liberacao.
//   2. Conteúdo real da Semana 1 (v1) e dos 10 alongamentos.
//
// Uso:  npx tsx scripts/gen-circuito-semana1.ts
// =====================================================================

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { EXERCICIOS, ALONGAMENTOS, instrucoesV1 } from '../supabase/content/circuito-semana1'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'supabase', 'migrations', '0008_semana1_e_bloqueio.sql')

if (EXERCICIOS.length !== 35) {
  console.error(`✗ Esperava 35 exercícios, encontrei ${EXERCICIOS.length}.`)
  process.exit(1)
}
if (ALONGAMENTOS.length !== 10) {
  console.error(`✗ Esperava 10 alongamentos, encontrei ${ALONGAMENTOS.length}.`)
  process.exit(1)
}

const exDoc = EXERCICIOS.map((e) => ({
  dia: e.dia,
  ordem: e.ordem,
  nome: e.nome,
  descricao: e.descricao,
  instrucoes: instrucoesV1(e),
}))
const stDoc = ALONGAMENTOS.map((a) => ({ ordem: a.ordem, nome: a.nome, descricao: a.descricao }))

function dq(payload: string, base: string): string {
  let tag = base
  let n = 0
  while (payload.includes(`$${tag}$`)) tag = `${base}${++n}`
  return `$${tag}$${payload}$${tag}$`
}

const sql = `-- =====================================================================
-- 0008_semana1_e_bloqueio.sql
-- BodyMy — Conteúdo real da Semana 1 (v1) + bloqueio das semanas 2-4.
--
-- GERADO por scripts/gen-circuito-semana1.ts a partir de
-- supabase/content/circuito-semana1.ts. NÃO edite à mão — regenere.
-- Idempotente: pode rodar mais de uma vez.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) BLOQUEIO DE SEMANAS
-- ---------------------------------------------------------------------
create table if not exists public.program_weeks_config (
  semana int primary key check (semana between 1 and 4),
  liberada boolean not null default false,
  atualizado_em timestamptz not null default now()
);
alter table public.program_weeks_config enable row level security;
drop policy if exists "pwc_read_auth" on public.program_weeks_config;
create policy "pwc_read_auth" on public.program_weeks_config
  for select to authenticated using (true);

-- Semana 1 sempre liberada; 2-4 bloqueadas por padrão.
insert into public.program_weeks_config (semana, liberada)
values (1, true), (2, false), (3, false), (4, false)
on conflict (semana) do nothing;
update public.program_weeks_config set liberada = true where semana = 1;

-- Registro de que a aluna concluiu o ciclo e aguarda a liberação da próxima
-- semana (0 = não aguarda). Usado para métrica e para o "avança no próximo
-- acesso" quando o Willian libera.
alter table public.user_training_config
  add column if not exists aguardando_liberacao int not null default 0;

-- ---------------------------------------------------------------------
-- 2) CONTEÚDO DA SEMANA 1 (v1) + ALONGAMENTOS
-- ---------------------------------------------------------------------
do $conteudo$
declare
  v_ex   jsonb := ${dq(JSON.stringify(exDoc), 'ex')}::jsonb;
  v_st   jsonb := ${dq(JSON.stringify(stDoc), 'st')}::jsonb;
  r      jsonb;
  v_exercise_id uuid;
begin
  -- Exercícios: nome + descrição (por dia/ordem) e instruções da v1.
  for r in select * from jsonb_array_elements(v_ex)
  loop
    update public.exercises
       set nome = r->>'nome', descricao = r->>'descricao'
     where dia_do_ciclo = (r->>'dia')::int
       and ordem_no_dia = (r->>'ordem')::int
    returning id into v_exercise_id;

    if v_exercise_id is not null then
      update public.exercise_variations
         set instrucoes = r->>'instrucoes'
       where exercise_id = v_exercise_id and nivel = 1;
    end if;
  end loop;

  -- Alongamentos da Semana Zero.
  for r in select * from jsonb_array_elements(v_st)
  loop
    update public.stretches
       set nome = r->>'nome', descricao = r->>'descricao'
     where ordem = (r->>'ordem')::int;
  end loop;
end
$conteudo$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select * from (values
  ('semanas configuradas (esperado 4)', (select count(*)::text from public.program_weeks_config)),
  ('semana 1 liberada', (select case when (select liberada from public.program_weeks_config where semana=1) then 'sim' else 'NAO' end)),
  ('semanas 2-4 bloqueadas', (select count(*)::text from public.program_weeks_config where semana in (2,3,4) and liberada = false)),
  ('exercicios renomeados (sem "Exercício N")', (select count(*)::text from public.exercises where nome !~ '^Exercício [0-9]+$')),
  ('variacoes v1 com instrucoes (esperado 35)', (select count(*)::text from public.exercise_variations where nivel=1 and instrucoes is not null)),
  ('alongamentos renomeados (sem "Alongamento N")', (select count(*)::text from public.stretches where nome !~ '^Alongamento [0-9]+$'))
) as v(verificacao, valor) order by verificacao;
`

writeFileSync(OUT, sql, 'utf8')
console.log(`✓ Migração gerada: ${OUT}`)
console.log(`  ${EXERCICIOS.length} exercícios (v1) + ${ALONGAMENTOS.length} alongamentos.`)
