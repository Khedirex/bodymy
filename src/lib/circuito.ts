import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { CIRCUITO_DIAS, nivelEntradaSemana, clampNivel, partidaPorFaixa, isFaixa } from '@/lib/training'
import type {
  UserTrainingConfig,
  Exercise,
  ExerciseVariation,
  Stretch,
  Circuito,
} from '@/types/db'

// =====================================================================
// Camada de servidor do circuito. Catálogo (exercises/variations/
// stretches) é lido com o admin client (sem policy de leitura no client);
// o estado da aluna é lido com o client autenticado (RLS dono).
//
// Tudo é POR CIRCUITO: cada produto aponta para um circuito
// (products.circuito) e a aluna só enxerga os circuitos que comprou.
// =====================================================================

export interface CircuitoDaAluna extends Circuito {
  produto: { id: string; slug: string; nome: string }
  desde: string // data do entitlement (o primeiro comprado é o principal)
}

// Circuitos que a aluna possui (via entitlement ativo), do mais antigo ao
// mais novo — o primeiro é o "principal" (produto de entrada).
export async function getCircuitosDaAluna(
  supabase: SupabaseClient,
  userId: string,
): Promise<CircuitoDaAluna[]> {
  if (!userId) return []
  const { data: ents } = await supabase
    .from('entitlements')
    .select('product_id, created_at')
    .eq('user_id', userId)
    .eq('status', 'ativo')
  if (!ents || ents.length === 0) return []

  const admin = createAdminClient()
  const { data: prods } = await admin
    .from('products')
    .select('id, slug, nome, circuito')
    .in('id', ents.map((e) => e.product_id as string))
    .not('circuito', 'is', null)
  if (!prods || prods.length === 0) return []

  const { data: circs } = await admin
    .from('circuitos')
    .select('*')
    .in('slug', Array.from(new Set(prods.map((p) => p.circuito as string))))
  const circPorSlug = new Map(((circs ?? []) as Circuito[]).map((c) => [c.slug, c]))
  const desdePorProduto = new Map(ents.map((e) => [e.product_id as string, e.created_at as string]))

  const porCircuito = new Map<string, CircuitoDaAluna>()
  for (const p of prods) {
    const c = circPorSlug.get(p.circuito as string)
    if (!c) continue
    const desde = desdePorProduto.get(p.id as string) ?? ''
    const atual = porCircuito.get(c.slug)
    if (!atual || desde < atual.desde) {
      porCircuito.set(c.slug, {
        ...c,
        produto: { id: p.id as string, slug: p.slug as string, nome: p.nome as string },
        desde,
      })
    }
  }
  return Array.from(porCircuito.values()).sort((a, b) => a.desde.localeCompare(b.desde))
}

// Escolhe o circuito pedido (se a aluna o possui) ou o principal.
export async function resolverCircuito(
  supabase: SupabaseClient,
  userId: string,
  pedido?: string | null,
): Promise<{ atual: CircuitoDaAluna | null; todos: CircuitoDaAluna[] }> {
  const todos = await getCircuitosDaAluna(supabase, userId)
  const atual = (pedido ? todos.find((c) => c.slug === pedido) : null) ?? todos[0] ?? null
  return { atual, todos }
}

export async function getTrainingConfig(
  supabase: SupabaseClient,
  userId: string,
  circuito: string,
): Promise<UserTrainingConfig | null> {
  const { data } = await supabase
    .from('user_training_config')
    .select('*')
    .eq('user_id', userId)
    .eq('circuito', circuito)
    .maybeSingle()
  return (data as UserTrainingConfig) ?? null
}

// Cria a config do circuito a partir da faixa etária (ponto de partida de
// séries/descanso). Sem faixa informada, usa a do perfil (quiz). Retorna
// null se não houver faixa conhecida (→ a UI pergunta: AgeGate).
export async function ensureTrainingConfig(
  supabase: SupabaseClient,
  userId: string,
  circuito: string,
  faixaInformada?: string | null,
): Promise<UserTrainingConfig | null> {
  const existente = await getTrainingConfig(supabase, userId, circuito)
  if (existente) return existente

  let faixa = faixaInformada ?? null
  if (!isFaixa(faixa)) {
    const { data: profile } = await supabase.from('profiles').select('quiz_data').eq('id', userId).maybeSingle()
    faixa = (profile?.quiz_data as { faixa_etaria?: string } | null)?.faixa_etaria ?? null
  }
  if (!isFaixa(faixa)) return null

  const partida = partidaPorFaixa(faixa)
  const { error } = await supabase.from('user_training_config').insert({
    user_id: userId,
    circuito,
    faixa_etaria: faixa,
    series: partida.series,
    descanso_seg: partida.descanso_seg,
    tempo_execucao_seg: partida.tempo_execucao_seg,
  })
  // Corrida (duas abas): se já existe, só relê.
  if (error && error.code !== '23505') throw error
  return getTrainingConfig(supabase, userId, circuito)
}

export async function getCircuito(slug: string): Promise<Circuito | null> {
  const admin = createAdminClient()
  const { data } = await admin.from('circuitos').select('*').eq('slug', slug).maybeSingle()
  return (data as Circuito) ?? null
}

export async function hasCircuitoAccess(
  supabase: SupabaseClient,
  userId: string,
  circuito: string,
): Promise<boolean> {
  const todos = await getCircuitosDaAluna(supabase, userId)
  return todos.some((c) => c.slug === circuito)
}

// Acesso às aulas de leitura de um programa: quem possui um circuito que usa
// esse programa como material complementar (circuitos.programa_slug).
export async function hasProgramaViaCircuito(
  supabase: SupabaseClient,
  userId: string,
  programaSlug: string,
): Promise<boolean> {
  const todos = await getCircuitosDaAluna(supabase, userId)
  return todos.some((c) => c.programa_slug === programaSlug)
}

// Ids dos exercícios de um circuito (para operações em lote por aluna).
export async function getExerciseIdsDoCircuito(circuito: string): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin.from('exercises').select('id').eq('circuito', circuito)
  return (data ?? []).map((r) => r.id as string)
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
// (semana_atual, dia_atual), sempre do circuito da config.
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
      .eq('circuito', config.circuito)
      .eq('dia_do_ciclo', dia)
      .eq('ativo', true)
      .order('ordem_no_dia', { ascending: true }),
    admin.from('stretches').select('*').eq('circuito', config.circuito).order('ordem', { ascending: true }),
  ])
  const exercises = (exs ?? []) as Exercise[]
  const stretches = (stretchRows ?? []) as Stretch[]
  const exIds = exercises.map((e) => e.id)

  // Variações da aluna (por exercício) + todas as variações do catálogo.
  const [{ data: userVars }, { data: allVars }] = await Promise.all([
    exIds.length
      ? supabase
          .from('user_exercise_variations')
          .select('exercise_id, variacao_nivel')
          .eq('user_id', userId)
          .in('exercise_id', exIds)
      : Promise.resolve({ data: [] as { exercise_id: string; variacao_nivel: number }[] }),
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
export async function getSemanasLiberadas(
  supabase: SupabaseClient,
  circuito: string,
): Promise<Set<number>> {
  const { data } = await supabase
    .from('program_weeks_config')
    .select('semana, liberada')
    .eq('circuito', circuito)
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
// - última semana do circuito: volta ao dia 1 (mantém a prática consolidada).
export async function advanceAfterCompletion(
  supabase: SupabaseClient,
  userId: string,
  config: UserTrainingConfig,
  totalSemanas: number,
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
    if (semana < totalSemanas) {
      const liberadas = await getSemanasLiberadas(supabase, config.circuito)
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
    .eq('circuito', config.circuito)

  if (virouSemana) await resetVariacoes(supabase, userId, config.circuito, semana, now)

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
  const liberadas = await getSemanasLiberadas(supabase, config.circuito)
  if (!liberadas.has(config.aguardando_liberacao)) return config

  const novaSemana = config.aguardando_liberacao
  const now = new Date().toISOString()
  await supabase
    .from('user_training_config')
    .update({ semana_atual: novaSemana, dia_atual: 1, aguardando_liberacao: 0, atualizado_em: now })
    .eq('user_id', userId)
    .eq('circuito', config.circuito)
  await resetVariacoes(supabase, userId, config.circuito, novaSemana, now)

  return { ...config, semana_atual: novaSemana, dia_atual: 1, aguardando_liberacao: 0 }
}

// Ao entrar numa semana nova, as variações (só deste circuito) voltam para a
// entrada da semana (vN).
async function resetVariacoes(
  supabase: SupabaseClient,
  userId: string,
  circuito: string,
  semana: number,
  now: string,
) {
  const ids = await getExerciseIdsDoCircuito(circuito)
  if (ids.length === 0) return
  await supabase
    .from('user_exercise_variations')
    .update({ variacao_nivel: nivelEntradaSemana(semana), atualizado_em: now })
    .eq('user_id', userId)
    .in('exercise_id', ids)
}
