/* eslint-disable no-console */
// =====================================================================
// BodyMy — Gerador da migração de produção do Pilates Somático
//
// Lê a fonte única em supabase/content/pilates-somatico.ts e emite
// supabase/migrations/0006_pilates_somatico.sql — script idempotente,
// comentado e pronto para colar no SQL Editor do Supabase de produção.
//
// Uso:  npx tsx scripts/gen-pilates-migration.ts
// =====================================================================

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  PROGRAMA,
  PILATES_SEMANAS,
  TOTAL_AULAS,
  type Semana,
} from '../supabase/content/pilates-somatico'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'supabase', 'migrations', '0006_pilates_somatico.sql')

if (TOTAL_AULAS !== 28) {
  console.error(`✗ Esperava 28 aulas, encontrei ${TOTAL_AULAS}. Abortando.`)
  process.exit(1)
}

const DIA_NOMES = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

// Estrutura serializada como JSON e embutida no SQL. O plpgsql percorre
// este documento para (re)criar semanas, dias e aulas — assim todo o
// escaping (acentos, aspas, quebras de linha, emoji) fica a cargo do JSON.
type WeekDoc = {
  numero: number
  titulo: string
  dias: {
    numero: number
    titulo: string
    aula: { titulo: string; duracao: number; conteudo: unknown }
  }[]
}

const weeksDoc: WeekDoc[] = PILATES_SEMANAS.map((s: Semana) => ({
  numero: s.numero,
  titulo: s.titulo,
  dias: s.dias.map((d, i) => ({
    numero: i + 1,
    titulo: DIA_NOMES[i] ?? d.titulo,
    aula: {
      titulo: d.aula.titulo,
      duracao: d.aula.duracao,
      conteudo: { intro: d.aula.intro, blocos: d.aula.blocos },
    },
  })),
}))

// sales_page do produto (a partir da fonte única).
const salesPage = {
  headline: PROGRAMA.salesPage.headline,
  subheadline: PROGRAMA.salesPage.subheadline,
  bullets: PROGRAMA.salesPage.bullets,
  cta_label: PROGRAMA.salesPage.cta_label,
}

// Dollar-quoting seguro: escolhe uma tag que não aparece no conteúdo.
function dq(payload: string, base: string): string {
  let tag = base
  let n = 0
  while (payload.includes(`$${tag}$`)) {
    n += 1
    tag = `${base}${n}`
  }
  return `$${tag}$${payload}$${tag}$`
}

const weeksJson = JSON.stringify(weeksDoc)
const salesJson = JSON.stringify(salesPage)

const sql = `-- =====================================================================
-- 0006_pilates_somatico.sql
-- BodyMy — Substitui "Caminhada Japonesa" por "Pilates Somático".
--
-- GERADO automaticamente por scripts/gen-pilates-migration.ts a partir de
-- supabase/content/pilates-somatico.ts. NÃO edite à mão — regenere.
--
-- O QUE FAZ (idempotente — pode rodar mais de uma vez com segurança):
--   1. Localiza o produto base pelo slug ('pilates-somatico' ou, ainda,
--      'caminhada-japonesa') — NÃO altera kiwify_product_id nem
--      kiwify_checkout_url, então os 3 acessos ativos continuam valendo.
--   2. Atualiza nome, slug, descrição e sales_page do produto.
--   3. Desativa (ativo=false) o(s) programa(s) antigo(s) do produto —
--      o conteúdo da Caminhada Japonesa FICA no banco (reversível).
--   4. Cria/atualiza o programa 'pilates-somatico' e (re)insere as
--      ${TOTAL_AULAS} aulas (4 semanas × 7 dias).
--   5. Mostra, ao final, a verificação (produto, programa antigo inativo,
--      programa novo ativo com ${TOTAL_AULAS} aulas).
--
-- NOTA sobre as alunas atuais: o entitlement é por product_id (inalterado),
-- então elas passam a ver o Pilates sem novo acesso. As lesson_completions
-- delas apontam para as aulas ANTIGAS (que permanecem no banco, apenas em
-- programa inativo), então o progresso no novo programa começa em zero, sem
-- erro. Check-ins e streak são independentes de programa e ficam intactos.
-- =====================================================================

do $migration$
declare
  v_product_id uuid;
  v_program_id uuid;
  v_week_id    uuid;
  v_day_id     uuid;
  v_weeks      jsonb := ${dq(weeksJson, 'weeks')}::jsonb;
  v_sales      jsonb := ${dq(salesJson, 'sales')}::jsonb;
  v_week       jsonb;
  v_dia        jsonb;
begin
  -- 1) Localiza o produto base (prioriza o slug novo se ambos existirem).
  select id into v_product_id
    from public.products
   where slug in ('pilates-somatico', 'caminhada-japonesa')
   order by (slug = 'pilates-somatico') desc
   limit 1;

  if v_product_id is null then
    raise exception 'Produto base nao encontrado (slug pilates-somatico ou caminhada-japonesa). Nada foi alterado.';
  end if;

  -- 2) Atualiza o produto. NÃO toca em kiwify_product_id / kiwify_checkout_url.
  update public.products
     set nome      = ${dq(PROGRAMA.productNome, 'nome')},
         slug      = 'pilates-somatico',
         descricao = ${dq(PROGRAMA.productDescricao, 'desc')},
         sales_page = v_sales,
         ativo     = true
   where id = v_product_id;

  -- 3) Desativa programas antigos do produto (mantém o conteúdo no banco).
  update public.programs
     set ativo = false
   where product_id = v_product_id
     and slug <> 'pilates-somatico';

  -- 4) Cria/atualiza o programa novo (upsert por slug único).
  insert into public.programs
      (product_id, slug, nome, descricao, capa_url, duracao_semanas, ordem_exibicao, ativo)
  values
      (v_product_id, 'pilates-somatico',
       ${dq(PROGRAMA.programaNome, 'pnome')},
       ${dq(PROGRAMA.programaDescricao, 'pdesc')},
       null, 4, 0, true)
  on conflict (slug) do update
     set product_id      = excluded.product_id,
         nome            = excluded.nome,
         descricao       = excluded.descricao,
         duracao_semanas = excluded.duracao_semanas,
         ordem_exibicao  = excluded.ordem_exibicao,
         ativo           = true
  returning id into v_program_id;

  -- (re)insere o conteúdo: apaga semanas do programa novo (cascade em
  -- days/lessons) e recria a partir do JSON. Não afeta o programa antigo.
  delete from public.program_weeks where program_id = v_program_id;

  for v_week in select * from jsonb_array_elements(v_weeks)
  loop
    insert into public.program_weeks (program_id, numero, titulo)
    values (v_program_id, (v_week->>'numero')::int, v_week->>'titulo')
    returning id into v_week_id;

    for v_dia in select * from jsonb_array_elements(v_week->'dias')
    loop
      insert into public.program_days (week_id, numero, titulo)
      values (v_week_id, (v_dia->>'numero')::int, v_dia->>'titulo')
      returning id into v_day_id;

      insert into public.lessons (day_id, titulo, tipo, panda_video_id, conteudo, duracao_min, ordem)
      values (
        v_day_id,
        v_dia->'aula'->>'titulo',
        'guia',
        null,
        v_dia->'aula'->'conteudo',
        (v_dia->'aula'->>'duracao')::int,
        0
      );
    end loop;
  end loop;

  raise notice 'OK: produto % atualizado; programa pilates-somatico % com % aulas.',
    v_product_id, v_program_id,
    (select count(*) from public.lessons l
       join public.program_days d on d.id = l.day_id
       join public.program_weeks w on w.id = d.week_id
      where w.program_id = v_program_id);
end
$migration$;

-- =====================================================================
-- VERIFICAÇÃO (rode e confira os resultados)
-- =====================================================================

-- Produto atualizado (kiwify_* devem permanecer os originais):
select slug, nome, ativo, kiwify_product_id, kiwify_checkout_url
  from public.products
 where slug = 'pilates-somatico';

-- Programas do produto: o antigo deve estar ativo=false, o novo ativo=true.
select p.slug, p.nome, p.ativo, p.ordem_exibicao
  from public.programs p
  join public.products pr on pr.id = p.product_id
 where pr.slug = 'pilates-somatico'
 order by p.ativo desc, p.slug;

-- Contagem de aulas do programa novo (esperado: ${TOTAL_AULAS}).
select count(*) as total_aulas
  from public.lessons l
  join public.program_days d on d.id = l.day_id
  join public.program_weeks w on w.id = d.week_id
  join public.programs p on p.id = w.program_id
 where p.slug = 'pilates-somatico';

-- Aulas por semana (esperado: 7 em cada uma das 4 semanas).
select w.numero as semana, w.titulo, count(l.*) as aulas
  from public.program_weeks w
  join public.programs p on p.id = w.program_id
  join public.program_days d on d.week_id = w.id
  join public.lessons l on l.day_id = d.id
 where p.slug = 'pilates-somatico'
 group by w.numero, w.titulo
 order by w.numero;
`

writeFileSync(OUT, sql, 'utf8')
console.log(`✓ Migração gerada: ${OUT}`)
console.log(`  ${TOTAL_AULAS} aulas em ${PILATES_SEMANAS.length} semanas.`)
