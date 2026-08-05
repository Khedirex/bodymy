import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { userHasEntitlement } from '@/lib/entitlements'
import type {
  Program,
  Lesson,
  Product,
  ProgramWeek,
  ProgramDay,
} from '@/types/db'

// =====================================================================
// Camada de dados de servidor.
//
// Regra: metadados de catálogo (products/programs/weeks/days) são lidos
// com o client do usuário (RLS permite). O CONTEÚDO de aulas (lessons)
// não tem policy de leitura para o client — é montado aqui com o admin
// client SOMENTE após validar entitlement.
// =====================================================================

export interface EntitledProgram {
  program: Program
  product: Pick<Product, 'id' | 'slug' | 'nome'>
}

/** Programas ativos que o usuário desbloqueou, ordenados para exibição. */
export async function getEntitledPrograms(userId: string): Promise<EntitledProgram[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('entitlements')
    .select('product:products!inner(id, slug, nome, ativo), status')
    .eq('user_id', userId)
    .eq('status', 'ativo')

  if (error || !data) return []

  const productIds = data
    .map((r) => (r.product as unknown as Product)?.id)
    .filter(Boolean)
  if (productIds.length === 0) return []

  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .in('product_id', productIds)
    .eq('ativo', true)
    .order('ordem_exibicao', { ascending: true })

  if (!programs) return []

  return (programs as Program[]).map((program) => {
    const prod = data.find(
      (r) => (r.product as unknown as Product)?.id === program.product_id,
    )?.product as unknown as Product
    return {
      program,
      product: { id: prod.id, slug: prod.slug, nome: prod.nome },
    }
  })
}

/** O programa principal (primeiro) do usuário, ou null. */
export async function getPrimaryProgram(userId: string): Promise<EntitledProgram | null> {
  const list = await getEntitledPrograms(userId)
  return list[0] ?? null
}

/** Metadados do programa por slug (legível por qualquer autenticado). */
export async function getProgramMeta(
  slug: string,
): Promise<{ program: Program; product: Product } | null> {
  const supabase = createClient()
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .maybeSingle()
  if (!program) return null

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', (program as Program).product_id)
    .maybeSingle()
  if (!product) return null

  return { program: program as Program, product: product as Product }
}

// --- Trilha montada (semanas → dias → aula) -------------------------
export interface LessonNode {
  lesson: Lesson
  completed: boolean
  /** Bloqueada por desbloqueio sequencial (a anterior não foi concluída). */
  locked: boolean
  weekNumero: number
  dayNumero: number
  globalIndex: number
}
export interface DayNode {
  day: Pick<ProgramDay, 'id' | 'numero' | 'titulo'>
  node: LessonNode | null
}
export interface WeekNode {
  week: Pick<ProgramWeek, 'id' | 'numero' | 'titulo'>
  days: DayNode[]
}
export interface ProgramTrack {
  program: Program
  weeks: WeekNode[]
  totalLessons: number
  completedCount: number
  nextLesson: LessonNode | null
}

/**
 * Monta a trilha completa do programa PARA O USUÁRIO, aplicando
 * desbloqueio sequencial. Retorna null se o usuário não tem entitlement.
 */
export async function getProgramTrack(
  userId: string,
  slug: string,
): Promise<ProgramTrack | null> {
  const meta = await getProgramMeta(slug)
  if (!meta) return null

  const supabase = createClient()
  const temAcesso = await userHasEntitlement(supabase, userId, meta.product.id)
  if (!temAcesso) return null

  // Conteúdo lido com admin (lessons não têm policy de leitura no client).
  const admin = createAdminClient()

  const { data: weeks } = await admin
    .from('program_weeks')
    .select('id, numero, titulo')
    .eq('program_id', meta.program.id)
    .order('numero', { ascending: true })

  const weekIds = (weeks ?? []).map((w) => w.id)
  const { data: days } = await admin
    .from('program_days')
    .select('id, week_id, numero, titulo')
    .in('week_id', weekIds.length ? weekIds : ['00000000-0000-0000-0000-000000000000'])
    .order('numero', { ascending: true })

  const dayIds = (days ?? []).map((d) => d.id)
  const { data: lessons } = await admin
    .from('lessons')
    .select('*')
    .in('day_id', dayIds.length ? dayIds : ['00000000-0000-0000-0000-000000000000'])
    .order('ordem', { ascending: true })

  // Completions do usuário.
  const { data: completions } = await admin
    .from('lesson_completions')
    .select('lesson_id')
    .eq('user_id', userId)
  const completedSet = new Set((completions ?? []).map((c) => c.lesson_id as string))

  // Monta em ordem global (semana → dia) para o desbloqueio sequencial.
  const weekNodes: WeekNode[] = []
  let globalIndex = 0
  let nextLesson: LessonNode | null = null
  let completedCount = 0
  let prevCompleted = true // a primeira aula sempre é liberada

  for (const w of weeks ?? []) {
    const dayNodes: DayNode[] = []
    const wDays = (days ?? []).filter((d) => d.week_id === w.id)
    for (const d of wDays) {
      const lesson = (lessons ?? []).find((l) => l.day_id === d.id) as Lesson | undefined
      if (!lesson) {
        dayNodes.push({ day: d, node: null })
        continue
      }
      const completed = completedSet.has(lesson.id)
      if (completed) completedCount += 1
      const locked = !completed && !prevCompleted
      const node: LessonNode = {
        lesson,
        completed,
        locked,
        weekNumero: w.numero,
        dayNumero: d.numero,
        globalIndex,
      }
      if (!completed && !locked && !nextLesson) nextLesson = node
      dayNodes.push({ day: d, node })
      globalIndex += 1
      prevCompleted = completed
    }
    weekNodes.push({ week: w, days: dayNodes })
  }

  return {
    program: meta.program,
    weeks: weekNodes,
    totalLessons: globalIndex,
    completedCount,
    nextLesson,
  }
}

/** Datas (ISO) de check-in do usuário — base do streak e do calendário. */
export async function getCheckinDates(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('checkins')
    .select('data')
    .eq('user_id', userId)
    .order('data', { ascending: true })
  return (data ?? []).map((c) => c.data as string)
}
