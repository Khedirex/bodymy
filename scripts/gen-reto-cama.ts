/* eslint-disable no-console */
// =====================================================================
// BodyMy — Gera, a partir da fonte única supabase/content/reto-cama-*.ts:
//   1. supabase/migrations/0025_reto_cama_14_dias.sql  (conteúdo do app)
//   2. guiones/dia-01.md … dia-14.md                    (roteiros da Lucy)
//   3. guiones/README.md                                (índice + durações)
//
// E VALIDA o conteúdo antes de escrever (falha com exit 1):
//   • frases de no máximo 12 palavras (exceto as 4 regras fixas e contagens);
//   • nenhuma palavra em português, voseo ou espanholismo da lista;
//   • texto de apoio com 150–250 palavras;
//   • doses do app batem com a tabela (vezes, segundos, séries).
//
// Uso:  npm run gen:reto-cama
// =====================================================================

import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  DIAS,
  BIENVENIDA,
  MATERIAL,
  REGLAS_SEGURIDAD,
  AVISO_MEDICO,
  AUTOEVALUACION,
  AUTOEVALUACION_APP,
  type Dia,
} from '../supabase/content/reto-cama-14-dias'
import { ejerciciosDelDia, type EjercicioDia, type Linea } from '../supabase/content/reto-cama-ejercicios'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_SQL = join(ROOT, 'supabase', 'migrations', '0025_reto_cama_14_dias.sql')
const OUT_GUIONES = join(ROOT, 'guiones')

// ---------------------------------------------------------------------
// Utilitários
// ---------------------------------------------------------------------
const pad = (n: number) => String(n).padStart(2, '0')
const videoCodigo = (n: number) => `VIDEO_DIA_${pad(n)}_PENDIENTE`
const palabras = (s: string) => s.replace(/[«»"“”¿?¡!.,:;()…—–-]/g, ' ').split(/\s+/).filter(Boolean)
const nPalabras = (s: string) => palabras(s).length

const erros: string[] = []
const REGLAS_FIJAS = new Set<string>(REGLAS_SEGURIDAD)

// Frases de no máximo 12 palavras.
function checarFrases(origem: string, texto: string) {
  if (REGLAS_FIJAS.has(texto)) return
  for (const frase of texto.split(/(?<=[.!?…])\s+|\n/)) {
    const n = nPalabras(frase)
    if (n > 12) erros.push(`[${origem}] frase com ${n} palavras: "${frase}"`)
  }
}

// Português, voseo e espanholismos (lista conservadora, por palavra inteira).
const PROIBIDAS = [
  'você', 'voce', 'não', 'nao', 'muito', 'fazer', 'perna', 'pernas', 'joelho', 'joelhos', 'toalha',
  'lençol', 'travesseiro', 'ombro', 'ombros', 'quadril', 'barriga', 'respire', 'solte', 'obrigada',
  'então', 'também', 'está bem',
  'vos', 'tenés', 'hacé', 'podés', 'sentís', 'querés', 'mirá', 'vosotros', 'vosotras', 'coger',
  'vale.', 'ordenador', 'móvil', 'guay', 'tío', 'tía',
]
function checarIdioma(origem: string, texto: string) {
  const baixo = ` ${texto.toLowerCase()} `
  for (const p of PROIBIDAS) {
    const re = new RegExp(`(^|[^\\p{L}])${p.replace('.', '\\.')}($|[^\\p{L}])`, 'u')
    if (re.test(baixo)) erros.push(`[${origem}] palavra proibida "${p}": "${texto}"`)
  }
  if (/[ãõç]/i.test(texto)) erros.push(`[${origem}] caractere do português (ã/õ/ç): "${texto}"`)
}

function checar(origem: string, texto: string, frases = true) {
  checarIdioma(origem, texto)
  if (frases) checarFrases(origem, texto)
}

// ---------------------------------------------------------------------
// Texto de apoio do app (lessons.conteudo)
// ---------------------------------------------------------------------
type Bloco = { tipo: 'texto' | 'passo' | 'dica' | 'aviso'; titulo?: string; conteudo: string }
interface AulaApp {
  numero: number
  dia_titulo: string
  titulo: string
  tipo: 'video' | 'guia'
  duracao_min: number
  conteudo: { intro: string; blocos: Bloco[] }
}

function autoevalApp(dia: Dia): Bloco | null {
  if (!dia.autoevaluacion) return null
  const preguntas = AUTOEVALUACION_APP.join('\n')
  const cierre =
    dia.autoevaluacion === 'primera'
      ? 'Guarda el papel. El día 14 lo vas a comparar.'
      : 'Compara con tus números del día 7.'
  return {
    tipo: 'texto',
    titulo: 'Autoevaluación',
    conteudo: `Anota un número del 0 al 10 en un papel.\n${preguntas}\n${cierre}`,
  }
}

// Regras do dia que valem para todos os exercícios (evita repetir 5 vezes).
function comoSeHace(dia: Dia): Bloco | null {
  const d = dia.dosis
  if (d.suave) return { tipo: 'texto', titulo: 'Cómo se hace hoy', conteudo: 'Todo suave, sin hacer fuerza.\nMuévete despacio.' }
  if (d.series === 2) {
    return {
      tipo: 'texto',
      titulo: 'Cómo se hace hoy',
      conteudo: `2 series por ejercicio.\nEntre series, descansa ${d.descansoSeg} segundos.`,
    }
  }
  return null
}

function aulaDoDia(dia: Dia, ejercicios: EjercicioDia[], duracaoMin: number): AulaApp {
  const como = comoSeHace(dia)
  const blocos: Bloco[] = [
    { tipo: 'texto', titulo: 'Lo que necesitas', conteudo: MATERIAL.join('\n') },
    ...(como ? [como] : []),
    ...ejercicios.map<Bloco>((e) => ({
      tipo: 'passo',
      titulo: e.nombre, // o app numera os passos sozinho
      conteudo: e.appDosis.join('\n'),
    })),
  ]
  const auto = autoevalApp(dia)
  if (auto) blocos.push(auto)
  blocos.push({ tipo: 'aviso', titulo: 'Reglas de seguridad', conteudo: REGLAS_SEGURIDAD.join('\n') })
  blocos.push({ tipo: 'dica', titulo: 'Mañana', conteudo: dia.manana })

  return {
    numero: dia.numero,
    dia_titulo: `Día ${dia.numero}`,
    titulo: `Día ${dia.numero} — ${dia.foco}`,
    tipo: 'video',
    duracao_min: duracaoMin,
    conteudo: { intro: dia.hoyVasA.join(' '), blocos },
  }
}

function aulaBienvenida(): AulaApp {
  const blocos: Bloco[] = [
    { tipo: 'texto', titulo: 'Para quién es', conteudo: BIENVENIDA.paraQuien.join('\n') },
    { tipo: 'texto', titulo: 'Lo que necesitas', conteudo: [...MATERIAL, 'Nada más.'].join('\n') },
    { tipo: 'aviso', titulo: 'Antes de empezar', conteudo: AVISO_MEDICO.join('\n') },
    { tipo: 'passo', titulo: 'Cómo usar este reto', conteudo: BIENVENIDA.comoUsar.join('\n') },
    { tipo: 'texto', titulo: 'Cómo está armado', conteudo: BIENVENIDA.comoEsta.join('\n') },
    { tipo: 'aviso', titulo: 'Reglas de seguridad', conteudo: REGLAS_SEGURIDAD.join('\n') },
    { tipo: 'dica', titulo: 'Un consejo', conteudo: BIENVENIDA.consejo },
  ]
  return {
    numero: 0,
    dia_titulo: 'Bienvenida',
    titulo: BIENVENIDA.titulo,
    tipo: 'guia',
    duracao_min: BIENVENIDA.duracaoMin,
    conteudo: { intro: BIENVENIDA.intro, blocos },
  }
}

// Texto de apoio para a contagem 150–250. A autoavaliação (dias 7 e 14) é um
// bloco extra pedido à parte e fica fora da conta.
function textoApp(a: AulaApp): string {
  return [
    a.conteudo.intro,
    ...a.conteudo.blocos.filter((b) => b.titulo !== 'Autoevaluación').flatMap((b) => [b.titulo ?? '', b.conteudo]),
  ].join('\n')
}

// ---------------------------------------------------------------------
// Roteiro (guion) da Lucy
// ---------------------------------------------------------------------
const WPS = 2.2 // palavras por segundo, fala pausada (~130 por minuto)

function linhaMd(l: Linea): string {
  if (l.t === 'camara') return `*${l.texto}*`
  if (l.t === 'cuenta') return `> ${l.texto}`
  return l.texto
}

const APERTURA_CAM = '[plano medio: Lucy sentada en la cama, luz natural]'
const SEGURIDAD_CAM = '[plano medio, mirando a cámara]'

function autoevalGuion(dia: Dia): string[] {
  if (!dia.autoevaluacion) return []
  const out = [
    '## 4. Autoevaluación',
    '',
    '*[plano medio: Lucy sentada, con un papel y un lápiz]*',
    '',
    ...[
      'Ahora, la prueba corta.',
      'Siéntate como estés cómoda.',
      'Toma tu papel y tu lápiz.',
      'Te hago cinco preguntas.',
      'Contesta con un número del cero al diez.',
    ].flatMap((l) => [l, '']),
  ]
  AUTOEVALUACION.forEach((p, i) => {
    out.push(`**Pregunta ${i + 1}.** ${p}`, '', '*[pausa de 10 segundos para que anote]*', '')
  })
  if (dia.autoevaluacion === 'primera') {
    out.push(...['Listo. Guarda ese papel.', 'El día catorce lo vamos a comparar.'].flatMap((l) => [l, '']))
  } else {
    out.push(
      ...[
        'Ahora saca tu papel del día siete.',
        'Compara número por número.',
        'Si el dolor, la rigidez o la dificultad bajaron, es avance.',
        'Si el sueño o el ánimo subieron, también es avance.',
        'Si algún número no cambió, está bien.',
        'Cada cuerpo tiene su ritmo.',
      ].flatMap((l) => [l, '']),
    )
  }
  return out
}

function dosisResumen(dia: Dia): string {
  const d = dia.dosis
  if (dia.fase === 1) {
    return d.suave
      ? `${d.veces} veces · solo movimiento suave (2 segundos al ir y 2 al volver)`
      : `${d.veces} veces · aguantar ${d.seg} segundos`
  }
  const base = d.series === 2 ? `2 series de ${d.veces} · descanso de ${d.descansoSeg} segundos` : `${d.veces} veces`
  return `${base} · subir en 2 segundos, bajar en 2${d.sostenerArriba ? ` · última vez: aguantar ${d.sostenerArriba} segundos arriba` : ''}`
}

interface Guion {
  md: string
  habladoSeg: number
  ejecucionSeg: number
  totalMin: number
}

function guionDoDia(dia: Dia, ejercicios: EjercicioDia[]): Guion {
  const falas: string[] = [] // só o que é falado (para a estimativa)
  const md: string[] = []

  const hablar = (...t: string[]) => {
    for (const s of t) {
      falas.push(s)
      checar(`guion día ${dia.numero}`, s)
      md.push(s, '')
    }
  }

  md.push(`# Día ${dia.numero} — ${dia.foco}`, '')
  md.push('| | |', '|---|---|')
  md.push(`| Video | \`${videoCodigo(dia.numero)}\` |`)
  md.push('| Duración estimada | __DURACION__ |')
  md.push(`| Dosis de hoy | ${dosisResumen(dia)} |`)
  md.push(`| Novedad | ${dia.novedad ?? '—'} |`)
  md.push('| Material | Toalla enrollada, almohada, sábana |', '')
  md.push(
    '> **Cómo leer este guion.** Las líneas normales se dicen a cámara.',
    '> Las líneas con barra a la izquierda son el conteo en voz alta.',
    '> Lo que va *[entre corchetes]* son indicaciones de cámara o de acción. No se dicen.',
    '',
  )

  // 1. Apertura
  md.push('## 1. Apertura (30 s)', '', `*${APERTURA_CAM}*`, '')
  hablar(...dia.apertura)
  if (dia.hito) {
    md.push('', '*[primer plano de Lucy: el logro de hoy]*', '')
    hablar(...dia.hito)
  }
  md.push('')

  // 2. Seguridad
  md.push('## 2. Recordatorio de seguridad (20 s)', '', `*${SEGURIDAD_CAM}*`, '')
  hablar('Antes de empezar, cuatro reglas.')
  md.push('')
  REGLAS_SEGURIDAD.forEach((r, i) => {
    falas.push(r)
    md.push(`${i + 1}. ${r}`)
  })
  md.push('')

  // 3. Ejercicios
  md.push('## 3. Los 5 ejercicios', '')
  for (const e of ejercicios) {
    md.push(`### Ejercicio ${e.slot} de 5 — ${e.nombre}`, '')
    md.push(`**Dosis:** ${e.appDosis.join(' ')}`, '')
    for (const s of e.guion) {
      if (s.lineas.length === 0) continue
      md.push(`**${s.titulo}**`, '')
      for (const l of s.lineas) {
        if (l.t === 'dice') {
          falas.push(l.texto)
          checar(`guion día ${dia.numero} / ${e.nombre}`, l.texto)
        } else {
          checar(`guion día ${dia.numero} / ${e.nombre}`, l.texto, false)
        }
        md.push(linhaMd(l), '')
      }
    }
  }

  // 4. Autoevaluación
  const auto = autoevalGuion(dia)
  for (const l of auto) {
    if (l && !l.startsWith('#') && !l.startsWith('*[')) {
      const t = l.replace(/^\*\*Pregunta \d\.\*\* /, '')
      falas.push(t)
      checar(`guion día ${dia.numero} / autoevaluación`, t)
    }
  }
  md.push(...auto)

  // 5. Cierre
  md.push(`## ${auto.length ? 5 : 4}. Cierre (30 s)`, '', '*[plano medio, Lucy acostada de lado mirando a cámara]*', '')
  hablar(...dia.cierre)
  md.push('')

  const habladoSeg = Math.round(falas.reduce((n, f) => n + nPalabras(f), 0) / WPS)
  const transicoes = 5 * 10
  const autoSeg = dia.autoevaluacion ? AUTOEVALUACION.length * 10 : 0
  const ejecucionSeg = ejercicios.reduce((n, e) => n + e.ejecucionSeg, 0) + transicoes + autoSeg
  const totalMin = Math.round((habladoSeg + ejecucionSeg) / 60)
  const texto = md.join('\n').replace('__DURACION__', `${totalMin} min (habla ${Math.round(habladoSeg / 60)} min + ejercicio ${Math.round(ejecucionSeg / 60)} min)`)
  return { md: texto + '\n', habladoSeg, ejecucionSeg, totalMin }
}

// ---------------------------------------------------------------------
// Validação das doses contra a tabela
// ---------------------------------------------------------------------
function checarDoses(dia: Dia, a: AulaApp) {
  const d = dia.dosis
  if (d.series === 2 && !a.conteudo.blocos.some((b) => b.conteudo.includes(`descansa ${d.descansoSeg} segundos`)))
    erros.push(`[día ${dia.numero}] sem o descanso de ${d.descansoSeg} segundos entre séries`)
  const passos = a.conteudo.blocos.filter((b) => b.tipo === 'passo')
  if (passos.length !== 5) erros.push(`[día ${dia.numero}] esperava 5 exercícios, há ${passos.length}`)
  const ordem = ejerciciosDelDia(dia).map((e) => e.nombre)
  passos.forEach((p, i) => {
    if (p.titulo !== ordem[i]) erros.push(`[día ${dia.numero}] exercício fora de ordem: ${p.titulo}`)
    const c = p.conteudo
    const esperaVeces = d.series === 2 ? `2 series de ${d.veces}` : `${d.veces} veces`
    if (!c.includes(esperaVeces)) erros.push(`[día ${dia.numero}] "${p.titulo}" sem "${esperaVeces}"`)
    if (dia.fase === 1 && !d.suave && !c.includes(`${d.seg} segundos`))
      erros.push(`[día ${dia.numero}] "${p.titulo}" sem "${d.seg} segundos"`)
    if (!/segundo/.test(c)) erros.push(`[día ${dia.numero}] "${p.titulo}" sem segundos`)
  })
}

// ---------------------------------------------------------------------
// Execução
// ---------------------------------------------------------------------
if (DIAS.length !== 14) {
  console.error(`✗ Esperava 14 dias, encontrei ${DIAS.length}.`)
  process.exit(1)
}

const aulas: AulaApp[] = [aulaBienvenida()]
const guiones: { dia: Dia; g: Guion }[] = []

for (const dia of DIAS) {
  const ejercicios = ejerciciosDelDia(dia)
  const g = guionDoDia(dia, ejercicios)
  const aula = aulaDoDia(dia, ejercicios, g.totalMin)
  checarDoses(dia, aula)
  aulas.push(aula)
  guiones.push({ dia, g })
}

// Texto do app: idioma, frases e tamanho.
for (const a of aulas) {
  const origem = `app ${a.titulo}`
  checar(origem, a.titulo)
  checar(origem, a.conteudo.intro)
  for (const b of a.conteudo.blocos) {
    if (b.titulo) checar(origem, b.titulo)
    for (const linha of b.conteudo.split('\n')) checar(origem, linha)
  }
  const n = nPalabras(textoApp(a))
  if (a.numero > 0 && (n < 150 || n > 250)) erros.push(`[${origem}] texto de apoio com ${n} palavras (esperado 150–250)`)
}

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s) no conteúdo:\n` + erros.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}

// ---------------------------------------------------------------------
// Saída: roteiros
// ---------------------------------------------------------------------
mkdirSync(OUT_GUIONES, { recursive: true })
for (const { dia, g } of guiones) {
  writeFileSync(join(OUT_GUIONES, `dia-${pad(dia.numero)}.md`), g.md)
}

const indice = [
  '# Guiones — Reto 14 días en la cama',
  '',
  'Guiones para grabar con Lucy Martínez. Un video por día.',
  'Generados desde `supabase/content/reto-cama-14-dias.ts` y `reto-cama-ejercicios.ts`.',
  'No se editan a mano: se cambia la fuente y se corre `npm run gen:reto-cama`.',
  '',
  '| Día | Título | Código del video | Duración estimada |',
  '|---|---|---|---|',
  ...guiones.map(
    ({ dia, g }) =>
      `| ${dia.numero} | [${dia.foco}](dia-${pad(dia.numero)}.md) | \`${videoCodigo(dia.numero)}\` | ${g.totalMin} min |`,
  ),
  '',
  'La duración estimada suma la voz de Lucy (unas 130 palabras por minuto),',
  'el tiempo real de cada ejercicio y los descansos.',
  '',
]
writeFileSync(join(OUT_GUIONES, 'README.md'), indice.join('\n'))

// ---------------------------------------------------------------------
// Saída: migração
// ---------------------------------------------------------------------
function dq(payload: string, base: string): string {
  let tag = base
  let n = 0
  while (payload.includes(`$${tag}$`)) tag = `${base}${++n}`
  return `$${tag}$${payload}$${tag}$`
}

const sql = `-- =====================================================================
-- 0025_reto_cama_14_dias.sql
-- BodyMy — "Protocolo Descompresión Articular — Reto 14 días" passa a ser
-- o reto de 14 dias NA CAMA: 1 vídeo + 1 texto de apoio por dia.
--
-- GERADO por scripts/gen-reto-cama.ts a partir de
-- supabase/content/reto-cama-14-dias.ts e reto-cama-ejercicios.ts.
-- NÃO edite à mão — altere a fonte e regenere (npm run gen:reto-cama).
--
-- O que faz (idempotente):
--   1. programs.formato ('circuito' | 'aula_diaria'). O programa canônico
--      passa a 'aula_diaria': /treino mostra o vídeo + texto do dia em vez
--      do circuito cronometrado. O catálogo do circuito NÃO é apagado.
--   2. Substitui as leituras antigas pelas novas: Bienvenida (dia 0) +
--      Días 1–14. Os program_days/lessons existentes são REAPROVEITADOS em
--      ordem (mesmos ids); os que sobram são removidos.
--   3. Só na PRIMEIRA aplicação: zera panda_video_id das aulas reaproveitadas
--      (eram vídeos do conteúdo antigo) e as conclusões antigas delas.
--      Reaplicar a migração atualiza os textos e PRESERVA os vídeos já
--      cadastrados.
--
-- Não toca em: produtos, entitlements, checkout, Kiwify/Hotmart, auth,
-- outros programas, nem na posição das alunas (semana/dia seguem iguais).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Formato do programa
-- ---------------------------------------------------------------------
alter table public.programs
  add column if not exists formato text not null default 'circuito';

do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.programs'::regclass
       and conname = 'programs_formato_check'
  ) then
    alter table public.programs
      add constraint programs_formato_check check (formato in ('circuito', 'aula_diaria'));
  end if;
end $$;

create table if not exists public.app_migrations (
  chave text primary key,
  aplicada_em timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) Aulas do reto (bienvenida + 14 días)
-- ---------------------------------------------------------------------
do $reto$
declare
  v_aulas      jsonb := ${dq(JSON.stringify(aulas), 'aulas')}::jsonb;
  v_program_id uuid;
  v_week_id    uuid;
  v_day_id     uuid;
  v_lesson_id  uuid;
  v_primeira   boolean;
  v_n          int;
  v_sobras     int;
  r            jsonb;
begin
  -- Programa canônico (o da 0024). Fallback: o do produto canônico com catálogo.
  select id into v_program_id from public.programs where slug = 'descompresion-articular';
  if v_program_id is null then
    select p.id into v_program_id
      from public.programs p
      join public.products pr on pr.id = p.product_id
     where pr.slug in ('drenagem-tailandesa', 'ritual-do-tapetinho')
     order by (select count(*) from public.exercises e where e.program_id = p.id) desc,
              p.ativo desc, p.id
     limit 1;
  end if;
  if v_program_id is null then
    raise exception 'Programa canônico não encontrado. Rode as migrations anteriores antes desta.';
  end if;

  v_primeira := not exists (select 1 from public.app_migrations where chave = '0025_reto_cama');

  update public.programs
     set formato = 'aula_diaria', duracao_semanas = 2
   where id = v_program_id;

  -- Uma única semana de leitura (a 0023 já consolidou tudo na semana 1).
  select id into v_week_id
    from public.program_weeks
   where program_id = v_program_id
   order by numero
   limit 1;
  if v_week_id is null then
    insert into public.program_weeks (program_id, numero, titulo)
    values (v_program_id, 1, 'Reto 14 días en la cama')
    returning id into v_week_id;
  end if;
  update public.program_weeks
     set titulo = 'Reto 14 días en la cama'
   where id = v_week_id and titulo is distinct from 'Reto 14 días en la cama';

  -- Traz todos os dias do programa para essa semana, numa faixa livre
  -- (10000+), na ordem original. Evita colisão com unique (week_id, numero).
  with ordenado as (
    select d.id, row_number() over (order by w.numero, d.numero, d.id) as n
      from public.program_days d
      join public.program_weeks w on w.id = d.week_id
     where w.program_id = v_program_id
  )
  update public.program_days d
     set week_id = v_week_id, numero = 10000 + o.n
    from ordenado o
   where o.id = d.id;

  delete from public.program_weeks
   where program_id = v_program_id and id <> v_week_id;

  -- Reaproveita os dias em ordem: o 1º vira a Bienvenida, o 2º o Día 1…
  for r in select * from jsonb_array_elements(v_aulas)
  loop
    v_n := (r->>'numero')::int;

    select id into v_day_id
      from public.program_days
     where week_id = v_week_id and numero >= 10000
     order by numero
     limit 1;

    if v_day_id is null then
      insert into public.program_days (week_id, numero, titulo)
      values (v_week_id, v_n, r->>'dia_titulo')
      returning id into v_day_id;
    else
      update public.program_days
         set numero = v_n, titulo = r->>'dia_titulo'
       where id = v_day_id;
    end if;

    -- Uma aula por dia: mantém a primeira, remove as demais.
    select id into v_lesson_id
      from public.lessons
     where day_id = v_day_id
     order by ordem, id
     limit 1;

    delete from public.lessons
     where day_id = v_day_id
       and id <> coalesce(v_lesson_id, '00000000-0000-0000-0000-000000000000'::uuid);

    if v_lesson_id is null then
      insert into public.lessons (day_id, titulo, tipo, panda_video_id, conteudo, duracao_min, ordem)
      values (v_day_id, r->>'titulo', r->>'tipo', null, r->'conteudo', (r->>'duracao_min')::int, 0);
    else
      update public.lessons
         set titulo = r->>'titulo',
             tipo = r->>'tipo',
             conteudo = r->'conteudo',
             duracao_min = (r->>'duracao_min')::int,
             ordem = 0,
             -- Vídeo antigo não serve para o conteúdo novo; depois, preserva.
             panda_video_id = case when v_primeira then null else panda_video_id end
       where id = v_lesson_id;

      if v_primeira then
        delete from public.lesson_completions where lesson_id = v_lesson_id;
      end if;
    end if;
  end loop;

  -- Leituras antigas que sobraram (dias 16–28 do material anterior).
  delete from public.program_days
   where week_id = v_week_id and numero >= 10000;
  get diagnostics v_sobras = row_count;

  if v_primeira then
    insert into public.app_migrations (chave) values ('0025_reto_cama');
  end if;

  raise notice 'Reto na cama: % aulas gravadas, % leituras antigas removidas.',
    jsonb_array_length(v_aulas), v_sobras;
end
$reto$;

notify pgrst, 'reload schema';

-- ---------------------------------------------------------------------
-- VERIFICAÇÃO — esperado: formato aula_diaria; 15 aulas (0 a 14), uma por
-- dia, em ordem; vídeos pendentes (NULL) até a Lucy gravar.
-- ---------------------------------------------------------------------
select p.slug, p.nome, p.formato, p.duracao_semanas
  from public.programs p
 where p.slug = 'descompresion-articular';

select d.numero as dia, l.titulo, l.tipo, l.duracao_min,
       coalesce(l.panda_video_id, 'PENDIENTE') as video
  from public.program_days d
  join public.program_weeks w on w.id = d.week_id
  join public.programs p on p.id = w.program_id
  left join public.lessons l on l.day_id = d.id
 where p.slug = 'descompresion-articular'
 order by d.numero;
`

writeFileSync(OUT_SQL, sql)

// ---------------------------------------------------------------------
// Resumo
// ---------------------------------------------------------------------
console.log(`✓ ${OUT_SQL.replace(ROOT + '/', '')}`)
console.log(`✓ guiones/dia-01.md … dia-14.md + README.md`)
console.log('\nDía | min | habla | ejercicio | palabras app')
for (const { dia, g } of guiones) {
  const a = aulas.find((x) => x.numero === dia.numero)!
  console.log(
    `${String(dia.numero).padStart(3)} | ${String(g.totalMin).padStart(3)} | ${String(Math.round(g.habladoSeg / 60)).padStart(5)} | ${String(Math.round(g.ejecucionSeg / 60)).padStart(9)} | ${nPalabras(textoApp(a))}`,
  )
}
