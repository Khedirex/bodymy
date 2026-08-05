import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { userHasEntitlement, getActiveEntitlementProductIds } from '@/lib/entitlements'
import type {
  Program,
  Lesson,
  Product,
  ProgramWeek,
  ProgramDay,
  DietPlan,
  DietDay,
  ProgressEntry,
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

// --- Acesso a uma aula específica -----------------------------------
export interface LessonContext {
  lesson: Lesson
  program: Program
  productId: string
  weekNumero: number
  dayNumero: number
  completed: boolean
  /** Próxima aula na sequência (para preview na celebração). */
  proxima: { id: string; titulo: string } | null
}

/**
 * Resolve o acesso a uma aula: valida entitlement e devolve a aula com
 * seu contexto. Retorna { hasAccess:false } se o usuário não pode ver.
 * Toda leitura de conteúdo de aula passa por aqui (validação no servidor).
 */
export async function getLessonForUser(
  userId: string,
  lessonId: string,
): Promise<{ hasAccess: boolean; ctx: LessonContext | null }> {
  const admin = createAdminClient()

  const { data: lesson } = await admin
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .maybeSingle()
  if (!lesson) return { hasAccess: false, ctx: null }

  const { data: day } = await admin
    .from('program_days')
    .select('id, numero, week_id')
    .eq('id', (lesson as Lesson).day_id)
    .maybeSingle()
  const { data: week } = day
    ? await admin
        .from('program_weeks')
        .select('id, numero, program_id')
        .eq('id', day.week_id)
        .maybeSingle()
    : { data: null }
  const { data: program } = week
    ? await admin.from('programs').select('*').eq('id', week.program_id).maybeSingle()
    : { data: null }

  if (!day || !week || !program) return { hasAccess: false, ctx: null }

  const supabase = createClient()
  const hasAccess = await userHasEntitlement(
    supabase,
    userId,
    (program as Program).product_id,
  )
  if (!hasAccess) return { hasAccess: false, ctx: null }

  const { data: completion } = await admin
    .from('lesson_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  // Próxima aula: montamos a trilha e pegamos a seguinte por índice global.
  const track = await getProgramTrack(userId, (program as Program).slug)
  let proxima: { id: string; titulo: string } | null = null
  if (track) {
    const flat = track.weeks
      .flatMap((w) => w.days.map((d) => d.node))
      .filter((n): n is LessonNode => n !== null)
    const idx = flat.findIndex((n) => n.lesson.id === lessonId)
    const next = idx >= 0 ? flat[idx + 1] : undefined
    if (next) proxima = { id: next.lesson.id, titulo: next.lesson.titulo }
  }

  return {
    hasAccess: true,
    ctx: {
      lesson: lesson as Lesson,
      program: program as Program,
      productId: (program as Program).product_id,
      weekNumero: week.numero,
      dayNumero: day.numero,
      completed: Boolean(completion),
      proxima,
    },
  }
}

// --- Vitrine ---------------------------------------------------------
export interface StorefrontItem {
  product: Product
  liberado: boolean
}

/** Todos os produtos ativos com o estado liberado/bloqueado do usuário. */
export async function getStorefront(userId: string): Promise<StorefrontItem[]> {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('ativo', true)
    .order('created_at', { ascending: true })

  const owned = await getActiveEntitlementProductIds(supabase, userId)

  return (products ?? []).map((p) => ({
    product: p as Product,
    liberado: owned.has((p as Product).id),
  }))
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

// --- Dieta -----------------------------------------------------------
export interface BaseDiet {
  plan: DietPlan
  days: DietDay[]
}

/** Plano de dieta base (incluso) com todos os dias de cardápio. */
export async function getBaseDiet(): Promise<BaseDiet | null> {
  const supabase = createClient()
  const { data: plan } = await supabase
    .from('diet_plans')
    .select('*')
    .is('product_id', null)
    .eq('ativo', true)
    .order('slug', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (!plan) return null

  const { data: days } = await supabase
    .from('diet_days')
    .select('*')
    .eq('diet_plan_id', (plan as DietPlan).id)
    .order('numero', { ascending: true })

  return { plan: plan as DietPlan, days: (days ?? []) as DietDay[] }
}

// --- Progresso -------------------------------------------------------
export interface ProgressEntryView extends ProgressEntry {
  fotoUrl: string | null
}

/** Entradas de progresso do usuário com URL assinada da foto (privada). */
export async function getProgressEntries(userId: string): Promise<ProgressEntryView[]> {
  const supabase = createClient()
  const { data } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })

  const entries = (data ?? []) as ProgressEntry[]
  if (entries.length === 0) return []

  // URLs assinadas são geradas no servidor (bucket privado).
  const admin = createAdminClient()
  const views: ProgressEntryView[] = []
  for (const e of entries) {
    let fotoUrl: string | null = null
    if (e.foto_path) {
      const { data: signed } = await admin.storage
        .from('progress-photos')
        .createSignedUrl(e.foto_path, 60 * 60) // 1h
      fotoUrl = signed?.signedUrl ?? null
    }
    views.push({ ...e, fotoUrl })
  }
  return views
}
