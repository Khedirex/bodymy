/* eslint-disable no-console */
// =====================================================================
// BodyMy — Gera a migração de tradução do CONTEÚDO para espanhol.
//
// Lê as fontes já traduzidas (supabase/content/*.ts) e emite
// supabase/migrations/0014_es_content.sql — UPDATES IN PLACE (por posição:
// semana/dia, dia_do_ciclo/ordem, ordem do alongamento). Preserva os ids,
// então nenhuma aluna perde progresso; só o texto muda.
//
// Uso:  npx tsx scripts/gen-es-content-migration.ts
// =====================================================================
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { PROGRAMA, RITUAL_SEMANAS, type Semana } from '../supabase/content/ritual-do-tapetinho'
import { EXERCICIOS, ALONGAMENTOS, instrucoesV1 } from '../supabase/content/circuito-semana1'
import { cardapioBaseES } from '../supabase/content/dieta-base'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'supabase', 'migrations', '0014_es_content.sql')

// Nomes dos dias em espanhol (program_days.titulo).
const ES_DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

// ---- Docs JSON embutidos ----
const weeksDoc = RITUAL_SEMANAS.map((s: Semana) => ({
  numero: s.numero,
  titulo: s.titulo,
  dias: s.dias.map((d, i) => ({
    numero: i + 1,
    titulo: ES_DIAS[i] ?? d.titulo,
    aula: { titulo: d.aula.titulo, conteudo: { intro: d.aula.intro, blocos: d.aula.blocos } },
  })),
}))

const exDoc = EXERCICIOS.map((e) => ({
  dia: e.dia,
  ordem: e.ordem,
  nome: e.nome,
  descricao: e.descricao,
  instr: instrucoesV1(e),
}))

const stDoc = ALONGAMENTOS.map((a) => ({ ordem: a.ordem, nome: a.nome, descricao: a.descricao }))

const dietDoc = cardapioBaseES().map((d, i) => ({ numero: i + 1, refeicoes: d }))

// Dollar-quoting seguro.
function dq(payload: string, base: string): string {
  let tag = base
  let n = 0
  while (payload.includes(`$${tag}$`)) {
    n += 1
    tag = `${base}${n}`
  }
  return `$${tag}$${payload}$${tag}$`
}

const CANON = ['drenagem-tailandesa', 'ritual-do-tapetinho', 'pilates-somatico', 'caminhada-japonesa']
const canonList = CANON.map((s) => `'${s}'`).join(', ')

const sql = `-- =====================================================================
-- 0014_es_content.sql
-- BodyMy — Tradução do CONTEÚDO para espanhol (UPDATE IN PLACE).
--
-- GERADO por scripts/gen-es-content-migration.ts a partir das fontes
-- traduzidas em supabase/content/. NÃO edite à mão — regenere.
--
-- Idempotente. Atualiza por POSIÇÃO (preserva ids → sem perda de progresso):
--   * program_weeks.titulo, program_days.titulo, lessons.titulo+conteudo
--     (programa canônico, por semana/dia)
--   * exercises.nome+descricao e a variação v1 (instrucoes), por dia/ordem
--   * stretches.nome+descricao, por ordem
--   * products (drenagem, pilates-hormonal e vitrine) — nome/descrição/sales_page
--   * diet_days.refeicoes (plano base, por numero)
-- =====================================================================

do $migration$
declare
  v_program_id uuid;
  v_ex_id      uuid;
  v_weeks jsonb := ${dq(JSON.stringify(weeksDoc), 'weeks')}::jsonb;
  v_ex    jsonb := ${dq(JSON.stringify(exDoc), 'exs')}::jsonb;
  v_st    jsonb := ${dq(JSON.stringify(stDoc), 'sts')}::jsonb;
  v_diet  jsonb := ${dq(JSON.stringify(dietDoc), 'diet')}::jsonb;
  v_week jsonb; v_dia jsonb; v_e jsonb; v_s jsonb; v_d jsonb;
begin
  -- Programa canônico (o que tem as aulas).
  select p.id into v_program_id
    from public.programs p
    join public.products pr on pr.id = p.product_id
   where pr.slug in (${canonList})
   order by p.ativo desc
   limit 1;

  -- 1) Semanas / dias / aulas (por posição).
  if v_program_id is not null then
    for v_week in select * from jsonb_array_elements(v_weeks)
    loop
      update public.program_weeks
         set titulo = v_week->>'titulo'
       where program_id = v_program_id and numero = (v_week->>'numero')::int;

      for v_dia in select * from jsonb_array_elements(v_week->'dias')
      loop
        update public.program_days d
           set titulo = v_dia->>'titulo'
          from public.program_weeks w
         where d.week_id = w.id and w.program_id = v_program_id
           and w.numero = (v_week->>'numero')::int and d.numero = (v_dia->>'numero')::int;

        update public.lessons l
           set titulo = v_dia->'aula'->>'titulo',
               conteudo = v_dia->'aula'->'conteudo'
          from public.program_days d
          join public.program_weeks w on w.id = d.week_id
         where l.day_id = d.id and w.program_id = v_program_id
           and w.numero = (v_week->>'numero')::int and d.numero = (v_dia->>'numero')::int;
      end loop;
    end loop;
  end if;

  -- 2) Exercícios + variação v1 (por dia_do_ciclo / ordem_no_dia).
  for v_e in select * from jsonb_array_elements(v_ex)
  loop
    update public.exercises
       set nome = v_e->>'nome', descricao = v_e->>'descricao'
     where dia_do_ciclo = (v_e->>'dia')::int and ordem_no_dia = (v_e->>'ordem')::int
    returning id into v_ex_id;

    if v_ex_id is not null then
      update public.exercise_variations
         set instrucoes = v_e->>'instr'
       where exercise_id = v_ex_id and nivel = 1;
    end if;
  end loop;

  -- 3) Alongamentos (por ordem).
  for v_s in select * from jsonb_array_elements(v_st)
  loop
    update public.stretches
       set nome = v_s->>'nome', descricao = v_s->>'descricao'
     where ordem = (v_s->>'ordem')::int;
  end loop;

  -- 4) Cardápio base (por numero) — plano incluso (product_id null).
  for v_d in select * from jsonb_array_elements(v_diet)
  loop
    update public.diet_days dd
       set refeicoes = v_d->'refeicoes'
      from public.diet_plans dp
     where dd.diet_plan_id = dp.id and dp.product_id is null
       and dd.numero = (v_d->>'numero')::int;
  end loop;
end
$migration$;

-- 5) Produtos (nome/descrição/sales_page em espanhol).
update public.products
   set nome = ${dq(PROGRAMA.productNome, 'pn')},
       descricao = ${dq(PROGRAMA.productDescricao, 'pd')},
       sales_page = ${dq(JSON.stringify({
         headline: PROGRAMA.salesPage.headline,
         subheadline: PROGRAMA.salesPage.subheadline,
         bullets: PROGRAMA.salesPage.bullets,
         cta_label: PROGRAMA.salesPage.cta_label,
       }), 'sp')}::jsonb
 where slug = 'drenagem-tailandesa';

update public.products
   set descricao = 'Movimientos suaves de Pilates para practicar en casa, a tu ritmo y sin equipo.'
 where slug = 'pilates-hormonal';

update public.products
   set nome = 'Pilates en Silla',
       descricao = 'Ejercicios de bajo impacto usando solo una silla, para hacer en casa.'
 where slug = 'pilates-de-cadeira';

update public.products
   set nome = 'Menú Low Carb',
       descricao = 'Sugerencias de menú con menos carbohidratos, prácticas y caseras.'
 where slug = 'cardapio-low-carb';

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO
-- ---------------------------------------------------------------------
select 'exercicios traduzidos' as check, count(*)::text as valor from public.exercises where descricao is not null
union all select 'alongamentos', count(*)::text from public.stretches
union all select 'aulas', count(*)::text from public.lessons;
`

writeFileSync(OUT, sql, 'utf8')
console.log(`✓ Migração gerada: ${OUT}`)
console.log(`  semanas=${weeksDoc.length}, exercicios=${exDoc.length}, alongamentos=${stDoc.length}`)
