import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { captureException } from '@/lib/observability'
import {
  CIRCUITO_PRODUCT_SLUGS,
  CIRCUITO_ACCESS_SLUGS,
  CIRCUITO_DIAS,
  ALONGAMENTOS,
  nivelEntradaSemana,
  clampNivel,
} from '@/lib/training'
import type {
  UserTrainingConfig,
  Exercise,
  ExerciseVariation,
  Stretch,
} from '@/types/db'

// =====================================================================
// Camada de servidor do circuito. Catálogo (exercises/variations/
// stretches) é lido com o admin client (sem policy de leitura no client);
// o estado da aluna é lido com o client autenticado (RLS dono).
//
// Tudo é escopado por PROGRAMA: cada protocolo tem o próprio catálogo, a
// própria liberação de semanas e a própria posição da aluna. Resolva o
// programa com getCircuitoPrograma() e passe adiante.
// =====================================================================

export interface CircuitoPrograma {
  id: string
  slug: string
  nome: string
  semanas: number // duracao_semanas do programa
  totalDias: number // semanas * 7
}

/**
 * Resolve QUAL protocolo a aluna acessa, a partir dos entitlements ativos.
 *
 * 1) Programa do próprio produto que ela comprou (se tiver circuito montado);
 * 2) Senão, se ela tem algum SKU que libera a experiência canônica
 *    (ex.: Pilates Hormonal, que é vendido à parte mas não tem programa
 *    próprio), cai no programa canônico.
 *
 * Retorna null quando não há acesso a nenhum circuito.
 */
export async function getCircuitoPrograma(
  supabase: SupabaseClient,
  userId: string,
): Promise<CircuitoPrograma | null> {
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  if (ativos.size === 0) return null

  const admin = createAdminClient()

  // Programas dos produtos que ela possui, na ordem de exibição.
  const { data: programas } = await admin
    .from('programs')
    .select('id, slug, nome, duracao_semanas, product_id')
    .in('product_id', Array.from(ativos))
    .eq('ativo', true)
    .order('ordem_exibicao', { ascending: true })

  const candidatos = (programas ?? []) as {
    id: string
    slug: string
    nome: string
    duracao_semanas: number
  }[]

  if (candidatos.length > 0) {
    // Só vale se o programa tiver circuito cadastrado.
    const { data: exs } = await admin
      .from('exercises')
      .select('program_id')
      .in('program_id', candidatos.map((p) => p.id))
      .eq('ativo', true)
    const comCircuito = new Set((exs ?? []).map((e) => e.program_id as string))
    const escolhido = candidatos.find((p) => comCircuito.has(p.id))
    if (escolhido) return montar(escolhido)
  }

  // Fallback: SKUs que liberam a experiência canônica sem ter programa próprio.
  const { data: acesso } = await admin
    .from('products')
    .select('id')
    .in('slug', CIRCUITO_ACCESS_SLUGS)
  const idsAcesso = new Set((acesso ?? []).map((r) => r.id as string))
  const temAcessoCanonico = Array.from(ativos).some((id) => idsAcesso.has(id))
  if (!temAcessoCanonico) return null

  const { data: canonico } = await admin
    .from('programs')
    .select('id, slug, nome, duracao_semanas, products!inner(slug)')
    .in('products.slug', CIRCUITO_PRODUCT_SLUGS)
    .eq('ativo', true)
    .limit(1)
    .maybeSingle()

  return canonico ? montar(canonico as unknown as { id: string; slug: string; nome: string; duracao_semanas: number }) : null
}

function montar(p: { id: string; slug: string; nome: string; duracao_semanas: number }): CircuitoPrograma {
  const semanas = Math.max(1, Number(p.duracao_semanas) || 1)
  return { id: p.id, slug: p.slug, nome: p.nome, semanas, totalDias: semanas * CIRCUITO_DIAS }
}

export async function getTrainingConfig(
  supabase: SupabaseClient,
  userId: string,
  programId: string,
): Promise<UserTrainingConfig | null> {
  const { data } = await supabase
    .from('user_training_config')
    .select('*')
    .eq('user_id', userId)
    .eq('program_id', programId)
    .maybeSingle()
  return (data as UserTrainingConfig) ?? null
}

export async function getCircuitoProductId(): Promise<string | null> {
  const admin = createAdminClient()
  // Busca pelo slug novo ou anterior (só um existe por vez) → resiliente à
  // ordem entre deploy e migração de rename.
  const { data } = await admin
    .from('products')
    .select('id')
    .in('slug', CIRCUITO_PRODUCT_SLUGS)
    .limit(1)
    .maybeSingle()
  return (data?.id as string) ?? null
}

// Ids de TODOS os produtos que liberam a mesma experiência (produto canônico
// + SKUs vendidos à parte, ex.: Pilates Hormonal).
export async function getCircuitoAccessProductIds(): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('id')
    .in('slug', CIRCUITO_ACCESS_SLUGS)
  return (data ?? []).map((r) => r.id as string)
}

export async function hasCircuitoAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  return (await getCircuitoPrograma(supabase, userId)) !== null
}

export interface PlanExercise {
  exercise: Exercise
  nivel: number
  variation: ExerciseVariation | null
  podeFacilitar: boolean // existe v(nivel-1) para tocar "variação anterior"
  podeDificultar: boolean // existe v(nivel+1) dentro do limite da semana
}

export interface TodayPlan {
  semana: number
  dia: number
  series: number
  descanso_seg: number
  exercicios: PlanExercise[]
  stretches: Stretch[] // bloco de mobilidade (mesma sequência todo dia)
}

// Monta o plano do dia: o bloco de mobilidade + o circuito no
// (semana_atual, dia_atual), sempre dentro do programa informado.
export async function getTodayPlan(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
  programId: string,
): Promise<TodayPlan> {
  const admin = createAdminClient()

  const semana = config.semana_atual
  const dia = config.dia_atual
  const entrada = nivelEntradaSemana(semana)

  const [{ data: exs, error: exErr }, { data: stretchRows, error: stErr }] = await Promise.all([
    admin
      .from('exercises')
      .select('*')
      .eq('program_id', programId)
      .eq('dia_do_ciclo', dia)
      .eq('ativo', true)
      .order('ordem_no_dia', { ascending: true }),
    admin
      .from('stretches')
      .select('*')
      .eq('program_id', programId)
      .order('ordem', { ascending: true })
      .limit(ALONGAMENTOS),
  ])
  // Erro de consulta vira lista vazia — e a aluna vê uma tela sem nada, sem
  // pista do motivo. Registramos para aparecer nos logs em vez de sumir.
  if (exErr) {
    captureException(new Error(`[circuito.getTodayPlan] exercises: ${exErr.message}`), {
      programId,
      dia,
      code: exErr.code,
    })
  }
  if (stErr) {
    captureException(new Error(`[circuito.getTodayPlan] stretches: ${stErr.message}`), {
      programId,
      code: stErr.code,
    })
  }

  const exercises = (exs ?? []) as Exercise[]
  const stretches = (stretchRows ?? []) as Stretch[]
  const exIds = exercises.map((e) => e.id)

  // Variações da aluna (por exercício) + todas as variações do catálogo.
  const [{ data: userVars }, { data: allVars }] = await Promise.all([
    supabase.from('user_exercise_variations').select('exercise_id, variacao_nivel').eq('user_id', userId),
    exIds.length
      ? admin.from('exercise_variations').select('*').in('exercise_id', exIds)
      : Promise.resolve({ data: [] as ExerciseVariation[] }),
  ])
  const userLevel = new Map<string, number>()
  for (const uv of (userVars ?? []) as { exercise_id: string; variacao_nivel: number }[]) {
    userLevel.set(uv.exercise_id, uv.variacao_nivel)
  }
  const varsByEx = new Map<string, ExerciseVariation[]>()
  for (const v of (allVars ?? []) as ExerciseVariation[]) {
    const arr = varsByEx.get(v.exercise_id) ?? []
    arr.push(v)
    varsByEx.set(v.exercise_id, arr)
  }

  const exercicios: PlanExercise[] = exercises.map((e) => {
    // Nível: escolha da aluna (se houver) ou a entrada da semana; limitado
    // ao intervalo [1, semana].
    const bruto = userLevel.get(e.id) ?? entrada
    const nivel = clampNivel(Math.min(bruto, semana))
    const vars = varsByEx.get(e.id) ?? []
    const variation = vars.find((v) => v.nivel === nivel) ?? null
    return {
      exercise: e,
      nivel,
      variation,
      podeFacilitar: nivel > 1,
      podeDificultar: nivel < semana,
    }
  })

  return {
    semana,
    dia,
    series: config.series,
    descanso_seg: config.descanso_seg,
    exercicios,
    stretches,
  }
}

// Semanas liberadas DO PROGRAMA (a 1 é sempre liberada). As demais o admin
// libera quando os vídeos das variações ficam prontos.
export async function getSemanasLiberadas(
  supabase: SupabaseClient,
  programId: string,
): Promise<Set<number>> {
  const { data } = await supabase
    .from('program_weeks_config')
    .select('semana, liberada')
    .eq('program_id', programId)
  const set = new Set<number>([1])
  for (const r of (data ?? []) as { semana: number; liberada: boolean }[]) {
    if (r.liberada) set.add(r.semana)
  }
  return set
}

export interface AvancoResultado {
  avancou: boolean
  concluiuCiclo: boolean // completou uma semana inteira (dia 7)
  aguardando: number // 0 = não aguarda; senão, semana bloqueada aguardada
  semana: number
  dia: number
}

// Avança o dia/semana após um dia CONCLUÍDO (todos os exercícios registrados).
// - dia < 7: só avança o dia.
// - dia 7 e a próxima semana LIBERADA: entra na próxima semana (dia 1) e
//   reseta as variações para a entrada (vN).
// - dia 7 e a próxima semana BLOQUEADA: NÃO avança — volta ao Dia 1 da mesma
//   semana (continua praticando) e registra aguardando_liberacao.
// - última semana do programa: volta ao dia 1 (mantém a prática consolidada).
export async function advanceAfterCompletion(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
  programa: CircuitoPrograma,
): Promise<AvancoResultado> {
  const now = new Date().toISOString()
  let semana = config.semana_atual
  let dia = config.dia_atual
  let aguardando = config.aguardando_liberacao
  let virouSemana = false
  let concluiuCiclo = false
  let avancou = true

  if (dia < CIRCUITO_DIAS) {
    dia += 1
  } else {
    concluiuCiclo = true
    if (semana < programa.semanas) {
      const liberadas = await getSemanasLiberadas(supabase, programa.id)
      const prox = semana + 1
      if (liberadas.has(prox)) {
        semana = prox
        dia = 1
        virouSemana = true
        aguardando = 0
      } else {
        // Próxima semana bloqueada: repete a semana atual, aguardando liberação.
        dia = 1
        aguardando = prox
        avancou = false
      }
    } else {
      dia = 1 // última semana concluída → repete a consolidada
      aguardando = 0
    }
  }

  await supabase
    .from('user_training_config')
    .update({ semana_atual: semana, dia_atual: dia, aguardando_liberacao: aguardando, atualizado_em: now })
    .eq('user_id', userId)
    .eq('program_id', programa.id)

  if (virouSemana) {
    await resetarVariacoes(supabase, userId, programa.id, nivelEntradaSemana(semana), now)
  }

  return { avancou, concluiuCiclo, aguardando, semana, dia }
}

// Reseta as variações APENAS dos exercícios deste programa — sem isso um
// segundo protocolo teria o próprio nível zerado junto.
async function resetarVariacoes(
  supabase: SupabaseClient,
  userId: string,
  programId: string,
  nivel: number,
  now: string,
) {
  const admin = createAdminClient()
  const { data: exs } = await admin.from('exercises').select('id').eq('program_id', programId)
  const ids = (exs ?? []).map((e) => e.id as string)
  if (ids.length === 0) return
  await supabase
    .from('user_exercise_variations')
    .update({ variacao_nivel: nivel, atualizado_em: now })
    .eq('user_id', userId)
    .in('exercise_id', ids)
}

// "Avança no próximo acesso": se a aluna concluiu a semana e ficou aguardando
// uma liberação que já aconteceu, entra na nova semana. Não reseta progresso.
export async function syncLiberacao(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
  programa: CircuitoPrograma,
): Promise<UserTrainingConfig> {
  if (config.aguardando_liberacao <= 0) return config
  const liberadas = await getSemanasLiberadas(supabase, programa.id)
  if (!liberadas.has(config.aguardando_liberacao)) return config

  const novaSemana = config.aguardando_liberacao
  const now = new Date().toISOString()
  await supabase
    .from('user_training_config')
    .update({ semana_atual: novaSemana, dia_atual: 1, aguardando_liberacao: 0, atualizado_em: now })
    .eq('user_id', userId)
    .eq('program_id', programa.id)
  await resetarVariacoes(supabase, userId, programa.id, nivelEntradaSemana(novaSemana), now)

  return { ...config, semana_atual: novaSemana, dia_atual: 1, aguardando_liberacao: 0 }
}
