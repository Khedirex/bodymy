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

export interface TodayPlan {
  semana: number
  dia: number
  series: number
  descanso_seg: number
  exercicios: PlanExercise[]
  stretches: Stretch[] // bloco de mobilidade (mesma sequência todo dia)
}

// Monta o plano do dia: o bloco de mobilidade (10 alongamentos) + o circuito
// no (semana_atual, dia_atual). A Semana Zero não existe mais.
export async function getTodayPlan(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
): Promise<TodayPlan> {
  const admin = createAdminClient()

  const semana = config.semana_atual
  const dia = config.dia_atual
  const entrada = nivelEntradaSemana(semana)

  const [{ data: exs }, { data: stretchRows }] = await Promise.all([
    admin
      .from('exercises')
      .select('*')
      .eq('dia_do_ciclo', dia)
      .eq('ativo', true)
      .order('ordem_no_dia', { ascending: true }),
    admin.from('stretches').select('*').order('ordem', { ascending: true }),
  ])
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

// Semanas liberadas (a 1 é sempre liberada). As demais o admin libera quando
// os vídeos das variações v2/v3/v4 ficam prontos.
export async function getSemanasLiberadas(supabase: SupabaseClient): Promise<Set<number>> {
  const { data } = await supabase.from('program_weeks_config').select('semana, liberada')
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

// Avança o dia/semana após um dia CONCLUÍDO (todos os 5 = "Fiz").
// - dia < 7: só avança o dia.
// - dia 7 e a próxima semana LIBERADA: entra na próxima semana (dia 1) e
//   reseta as variações para a entrada (vN).
// - dia 7 e a próxima semana BLOQUEADA: NÃO avança — volta ao Dia 1 da mesma
//   semana (continua praticando) e registra aguardando_liberacao.
// - semana 4: volta ao dia 1 (mantém a prática consolidada).
export async function advanceAfterCompletion(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
): Promise<AvancoResultado> {
  const now = new Date().toISOString()
  let semana = config.semana_atual
  let dia = config.dia_atual
  let aguardando = config.aguardando_liberacao
  let virouSemana = false
  let concluiuCiclo = false
  let avancou = true

  if (dia < 7) {
    dia += 1
  } else {
    concluiuCiclo = true
    if (semana < 4) {
      const liberadas = await getSemanasLiberadas(supabase)
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
      dia = 1 // semana 4 concluída → repete a consolidada
      aguardando = 0
    }
  }

  await supabase
    .from('user_training_config')
    .update({ semana_atual: semana, dia_atual: dia, aguardando_liberacao: aguardando, atualizado_em: now })
    .eq('user_id', userId)

  if (virouSemana) {
    await supabase
      .from('user_exercise_variations')
      .update({ variacao_nivel: nivelEntradaSemana(semana), atualizado_em: now })
      .eq('user_id', userId)
  }

  return { avancou, concluiuCiclo, aguardando, semana, dia }
}

// "Avança no próximo acesso": se a aluna concluiu a semana e ficou aguardando
// uma liberação que já aconteceu, entra na nova semana. Não reseta progresso.
export async function syncLiberacao(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
): Promise<UserTrainingConfig> {
  if (config.aguardando_liberacao <= 0) return config
  const liberadas = await getSemanasLiberadas(supabase)
  if (!liberadas.has(config.aguardando_liberacao)) return config

  const novaSemana = config.aguardando_liberacao
  const now = new Date().toISOString()
  await supabase
    .from('user_training_config')
    .update({ semana_atual: novaSemana, dia_atual: 1, aguardando_liberacao: 0, atualizado_em: now })
    .eq('user_id', userId)
  await supabase
    .from('user_exercise_variations')
    .update({ variacao_nivel: nivelEntradaSemana(novaSemana), atualizado_em: now })
    .eq('user_id', userId)

  return { ...config, semana_atual: novaSemana, dia_atual: 1, aguardando_liberacao: 0 }
}
