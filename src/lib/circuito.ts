import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { userHasEntitlement } from '@/lib/entitlements'
import { CIRCUITO_PRODUCT_SLUG, nivelEntradaSemana, clampNivel } from '@/lib/training'
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
// =====================================================================

export async function getTrainingConfig(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserTrainingConfig | null> {
  const { data } = await supabase
    .from('user_training_config')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return (data as UserTrainingConfig) ?? null
}

export async function getCircuitoProductId(): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('id')
    .eq('slug', CIRCUITO_PRODUCT_SLUG)
    .maybeSingle()
  return (data?.id as string) ?? null
}

export async function hasCircuitoAccess(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const productId = await getCircuitoProductId()
  if (!productId) return false
  return userHasEntitlement(supabase, userId, productId)
}

export interface PlanExercise {
  exercise: Exercise
  nivel: number
  variation: ExerciseVariation | null
  podeFacilitar: boolean // existe v(nivel-1) para tocar "variação anterior"
  podeDificultar: boolean // existe v(nivel+1) dentro do limite da semana
}

export type TodayPlan =
  | { tipo: 'semana_zero'; diaSemanaZero: number; stretches: Stretch[] }
  | {
      tipo: 'circuito'
      semana: number
      dia: number
      series: number
      descanso_seg: number
      exercicios: PlanExercise[]
    }

// Monta o plano do dia a partir da config. Semana Zero enquanto
// !semana_zero_completa; depois, o circuito no (semana_atual, dia_atual).
export async function getTodayPlan(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
): Promise<TodayPlan> {
  const admin = createAdminClient()

  if (!config.semana_zero_completa) {
    const { data: stretches } = await admin
      .from('stretches')
      .select('*')
      .order('ordem', { ascending: true })
    return {
      tipo: 'semana_zero',
      diaSemanaZero: config.semana_zero_dias + 1,
      stretches: (stretches ?? []) as Stretch[],
    }
  }

  const semana = config.semana_atual
  const dia = config.dia_atual
  const entrada = nivelEntradaSemana(semana)

  const { data: exs } = await admin
    .from('exercises')
    .select('*')
    .eq('dia_do_ciclo', dia)
    .eq('ativo', true)
    .order('ordem_no_dia', { ascending: true })
  const exercises = (exs ?? []) as Exercise[]
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
    tipo: 'circuito',
    semana,
    dia,
    series: config.series,
    descanso_seg: config.descanso_seg,
    exercicios,
  }
}

// Avança o dia/semana após um dia CONCLUÍDO (todos os 5 = "Fiz").
// Ao virar a semana, reseta as variações da aluna para a entrada da nova
// semana (Semana N entra em vN). Na semana 4, o dia volta ao 1 (mantém a
// prática consolidada rodando). Não avança se a sessão não foi completa.
export async function advanceAfterCompletion(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
): Promise<void> {
  let semana = config.semana_atual
  let dia = config.dia_atual
  let virouSemana = false

  if (dia < 7) {
    dia += 1
  } else if (semana < 4) {
    semana += 1
    dia = 1
    virouSemana = true
  } else {
    dia = 1 // semana 4 concluída → repete a semana consolidada
  }

  await supabase
    .from('user_training_config')
    .update({ semana_atual: semana, dia_atual: dia, atualizado_em: new Date().toISOString() })
    .eq('user_id', userId)

  if (virouSemana) {
    // Entrada da nova semana = vN. Reseta as variações já registradas.
    const novaEntrada = nivelEntradaSemana(semana)
    await supabase
      .from('user_exercise_variations')
      .update({ variacao_nivel: novaEntrada, atualizado_em: new Date().toISOString() })
      .eq('user_id', userId)
  }
}
