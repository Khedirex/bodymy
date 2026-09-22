/* eslint-disable no-console */
// =====================================================================
// BodyMy — Gera 0019_conteudo_protocolos.sql a partir das fontes em
// supabase/content/protocolos/*.ts (um arquivo por circuito).
//
// Upsert por posição (circuito + dia + ordem / circuito + ordem) →
// idempotente e NÃO apaga panda_video_id já preenchido no admin.
//
// Uso:  npm run gen:protocolos-sql
// =====================================================================

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { ProtocoloConteudo, VariacaoConteudo } from '../supabase/content/protocolos/tipos'
import { protocolo as rodillas } from '../supabase/content/protocolos/rodillas'
import { protocolo as cadera } from '../supabase/content/protocolos/cadera'
import { protocolo as lumbar } from '../supabase/content/protocolos/lumbar'
import { protocolo as manos } from '../supabase/content/protocolos/manos'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'supabase', 'migrations', '0019_conteudo_protocolos.sql')

const PROTOCOLOS: ProtocoloConteudo[] = [rodillas, cadera, lumbar, manos]

// Mesmo formato de 5 blocos rotulados que a UI já interpreta.
function instrucoes(v: VariacaoConteudo): string {
  return [
    `Preparación: ${v.preparacao}`,
    `Movimiento: ${v.movimento}`,
    `Respiración: ${v.respiracao}`,
    `Qué vas a sentir: ${v.sentir}`,
    `Atención: ${v.atencao}`,
  ].join('\n')
}

function validar(p: ProtocoloConteudo) {
  const erros: string[] = []
  const chaves = new Set<string>()
  const porDia = new Map<number, number>()
  for (const e of p.exercicios) {
    const k = `${e.dia}-${e.ordem}`
    if (chaves.has(k)) erros.push(`posição duplicada ${k}`)
    chaves.add(k)
    if (e.dia < 1 || e.dia > 7) erros.push(`${e.nome}: dia fora de 1-7`)
    if (e.ordem < 1 || e.ordem > 5) erros.push(`${e.nome}: ordem fora de 1-5`)
    if (e.variacoes.length !== p.semanas) erros.push(`${e.nome}: esperava ${p.semanas} variações`)
    if (e.tipo === 'permanencia' && e.variacoes.some((v) => !v.duracao_seg)) {
      erros.push(`${e.nome}: permanência sem duracao_seg`)
    }
    porDia.set(e.dia, Math.max(porDia.get(e.dia) ?? 0, e.ordem))
  }
  if (porDia.size !== 7) erros.push(`esperava 7 dias, encontrei ${porDia.size}`)
  const ordens = new Set(p.alongamentos.map((a) => a.ordem))
  if (ordens.size !== p.alongamentos.length) erros.push('alongamentos com ordem duplicada')
  if (erros.length) {
    console.error(`✗ ${p.circuito}:\n  - ${erros.join('\n  - ')}`)
    process.exit(1)
  }
}

function dq(payload: string, base: string): string {
  let tag = base
  let n = 0
  while (payload.includes(`$${tag}$`)) tag = `${base}${++n}`
  return `$${tag}$${payload}$${tag}$`
}

PROTOCOLOS.forEach(validar)

const doc = PROTOCOLOS.map((p) => {
  const porDia = Math.max(...p.exercicios.map((e) => e.ordem))
  return {
    circuito: p.circuito,
    exercicios: p.exercicios.map((e) => ({
      dia: e.dia,
      ordem: e.ordem,
      ordem_circuito: (e.dia - 1) * porDia + e.ordem,
      nome: e.nome,
      descricao: e.descricao,
      tipo: e.tipo,
      bilateral: e.bilateral,
      variacoes: e.variacoes.map((v, i) => ({
        nivel: i + 1,
        instrucoes: instrucoes(v),
        duracao_seg: v.duracao_seg ?? null,
      })),
    })),
    alongamentos: p.alongamentos.map((a) => ({
      ordem: a.ordem,
      nome: a.nome,
      descricao: a.descricao,
      lados: a.lados,
    })),
  }
})

const resumo = PROTOCOLOS.map(
  (p) => `--   ${p.circuito.padEnd(9)} ${p.semanas} semana(s) · ${p.exercicios.length} exercícios · ${p.alongamentos.length} alongamentos`,
).join('\n')

const sql = `-- =====================================================================
-- 0019_conteudo_protocolos.sql
-- BodyMy — Conteúdo dos protocolos por produto (exercícios + variações +
-- bloco de mobilidade). Requer 0018_protocolos_por_produto.sql.
--
${resumo}
--
-- GERADO por scripts/gen-protocolos-migration.ts a partir de
-- supabase/content/protocolos/*.ts. NÃO edite à mão — regenere.
-- Idempotente: upsert por posição; panda_video_id preenchido é preservado.
-- =====================================================================

do $conteudo$
declare
  v_doc jsonb := ${dq(JSON.stringify(doc), 'doc')}::jsonb;
  p jsonb;
  e jsonb;
  v jsonb;
  a jsonb;
  v_ex_id uuid;
begin
  for p in select * from jsonb_array_elements(v_doc)
  loop
    for e in select * from jsonb_array_elements(p->'exercicios')
    loop
      insert into public.exercises
        (circuito, dia_do_ciclo, ordem_no_dia, ordem_no_circuito, nome, descricao, tipo, bilateral, ativo)
      values (
        p->>'circuito', (e->>'dia')::int, (e->>'ordem')::int, (e->>'ordem_circuito')::int,
        e->>'nome', e->>'descricao', e->>'tipo', (e->>'bilateral')::boolean, true
      )
      on conflict (circuito, dia_do_ciclo, ordem_no_dia) do update
        set nome = excluded.nome,
            descricao = excluded.descricao,
            ordem_no_circuito = excluded.ordem_no_circuito,
            tipo = excluded.tipo,
            bilateral = excluded.bilateral
      returning id into v_ex_id;

      for v in select * from jsonb_array_elements(e->'variacoes')
      loop
        insert into public.exercise_variations (exercise_id, nivel, instrucoes, duracao_seg)
        values (v_ex_id, (v->>'nivel')::int, v->>'instrucoes', nullif(v->>'duracao_seg', '')::int)
        on conflict (exercise_id, nivel) do update
          set instrucoes = excluded.instrucoes,
              duracao_seg = excluded.duracao_seg;
      end loop;
    end loop;

    for a in select * from jsonb_array_elements(p->'alongamentos')
    loop
      insert into public.stretches (circuito, ordem, nome, descricao, lados, duracao_seg)
      values (p->>'circuito', (a->>'ordem')::int, a->>'nome', a->>'descricao', (a->>'lados')::int, 30)
      on conflict (circuito, ordem) do update
        set nome = excluded.nome,
            descricao = excluded.descricao,
            lados = excluded.lados;
    end loop;
  end loop;
end
$conteudo$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select c.slug as circuito,
       c.semanas,
       (select count(*) from public.exercises e where e.circuito = c.slug) as exercicios,
       (select count(*) from public.exercise_variations ev
          join public.exercises e on e.id = ev.exercise_id where e.circuito = c.slug) as variacoes,
       (select count(*) from public.stretches s where s.circuito = c.slug) as alongamentos
  from public.circuitos c
 order by c.slug;
`

writeFileSync(OUT, sql)
console.log(`✓ Gerado ${OUT}`)
console.log(resumo.replace(/^-- {3}/gm, '  '))
