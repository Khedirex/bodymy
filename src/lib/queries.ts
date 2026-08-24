import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { userHasEntitlement, getActiveEntitlementProductIds } from '@/lib/entitlements'
import { hasCircuitoAccess } from '@/lib/circuito'
import { CIRCUITO_PRODUCT_SLUGS } from '@/lib/training'
import { captureException } from '@/lib/observability'

// Loga um erro de leitura do Supabase com contexto rico (aparece nos
// logs de Function da Vercel e no Sentry). Nunca engolir em silêncio.
function logDbError(fn: string, error: { message?: string; code?: string; details?: string; hint?: string } | null, ctx?: Record<string, unknown>) {
  if (!error) return
  captureException(new Error(`[queries.${fn}] ${error.message ?? 'erro de leitura'}`), {
    code: error.code,
    details: error.details,
    hint: error.hint,
    ...ctx,
  })
}
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

  if (error) logDbError('getEntitledPrograms', error, { userId })
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
  opts?: { skipEntitlement?: boolean },
): Promise<ProgramTrack | null> {
  const meta = await getProgramMeta(slug)
  if (!meta) return null

  // skipEntitlement: quem chama já validou o acesso (ex.: /entenda usa
  // hasCircuitoAccess, que aceita qualquer SKU que libera a experiência).
  if (!opts?.skipEntitlement) {
    const supabase = createClient()
    const temAcesso = await userHasEntitlement(supabase, userId, meta.product.id)
    if (!temAcesso) return null
  }

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
  // Aulas do programa canônico são liberadas por qualquer SKU da experiência
  // (ex.: Pilates Hormonal). Outros programas exigem o próprio entitlement.
  const canonico = CIRCUITO_PRODUCT_SLUGS.includes((program as Program).slug)
  const hasAccess = canonico
    ? await hasCircuitoAccess(supabase, userId)
    : await userHasEntitlement(supabase, userId, (program as Program).product_id)
  if (!hasAccess) return { hasAccess: false, ctx: null }

  const { data: completion } = await admin
    .from('lesson_completions')
    .select('id')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle()

  // Próxima aula: montamos a trilha e pegamos a seguinte por índice global.
  // Acesso já validado acima → pula a checagem por-produto.
  const track = await getProgramTrack(userId, (program as Program).slug, { skipEntitlement: true })
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

/** Produto por slug + se o usuário já tem acesso. */
export async function getProductWithAccess(
  userId: string,
  slug: string,
): Promise<{ product: Product; liberado: boolean; programSlug: string | null } | null> {
  const supabase = createClient()
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('ativo', true)
    .maybeSingle()
  if (!product) return null

  const liberado = await userHasEntitlement(supabase, userId, (product as Product).id)

  // Se o produto é um programa, descobrimos o slug do programa para o link.
  const { data: program } = await supabase
    .from('programs')
    .select('slug')
    .eq('product_id', (product as Product).id)
    .maybeSingle()

  return {
    product: product as Product,
    liberado,
    programSlug: (program?.slug as string) ?? null,
  }
}

// --- Vitrine (esteira de upsell) ------------------------------------
export interface StorefrontItem {
  product: Product
  liberado: boolean
}

/**
 * VITRINE = esteira de backend. Lista apenas os produtos que são upsell
 * (ativo) dos produtos que a aluna JÁ possui. União sem duplicatas quando
 * ela tem mais de um produto. Um upsell já comprado aparece como liberado.
 *
 * (A RLS de `products` já limita a leitura ao "mundo" dela; aqui montamos
 *  a lista ordenada por `ordem` e marcamos liberado/bloqueado.)
 */
export async function getEsteira(userId: string): Promise<StorefrontItem[]> {
  const supabase = createClient()

  const owned = await getActiveEntitlementProductIds(supabase, userId)
  if (owned.size === 0) return []

  // Upsells (ativos) dos produtos que ela possui, ordenados.
  const { data: ups, error: upsErr } = await supabase
    .from('product_upsells')
    .select('upsell_product_id, ordem')
    .in('product_id', Array.from(owned))
    .eq('ativo', true)
    .order('ordem', { ascending: true })
  if (upsErr) {
    logDbError('getEsteira.upsells', upsErr, { userId })
    return []
  }

  // Dedup preservando a menor ordem de cada produto.
  const ordemPorProduto = new Map<string, number>()
  for (const r of ups ?? []) {
    const pid = r.upsell_product_id as string
    const ord = (r.ordem as number) ?? 0
    if (!ordemPorProduto.has(pid) || ord < (ordemPorProduto.get(pid) as number)) {
      ordemPorProduto.set(pid, ord)
    }
  }
  const upsellIds = Array.from(ordemPorProduto.keys())
  if (upsellIds.length === 0) return []

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', upsellIds)
    .eq('ativo', true)
  if (error) {
    logDbError('getEsteira.products', error, { userId })
    throw new Error('Não foi possível carregar a vitrine agora.')
  }

  return (products ?? [])
    .map((p) => ({ product: p as Product, liberado: owned.has((p as Product).id) }))
    .sort(
      (a, b) =>
        (ordemPorProduto.get(a.product.id) ?? 0) - (ordemPorProduto.get(b.product.id) ?? 0),
    )
}

/** Produtos que a aluna JÁ possui (para "Seus acessos" no perfil). */
export async function getMyAccesses(userId: string): Promise<Product[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('entitlements')
    .select('product:products(*), status')
    .eq('user_id', userId)
    .eq('status', 'ativo')
  if (error) {
    logDbError('getMyAccesses', error, { userId })
    return []
  }
  return (data ?? [])
    .map((r) => r.product as unknown as Product)
    .filter(Boolean)
}

/** Datas (ISO) de check-in do usuário — base do streak e do calendário. */
export async function getCheckinDates(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('checkins')
    .select('data')
    .eq('user_id', userId)
    .order('data', { ascending: true })
  if (error) logDbError('getCheckinDates', error, { userId })
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
  const { data: plan, error } = await supabase
    .from('diet_plans')
    .select('*')
    .is('product_id', null)
    .eq('ativo', true)
    .order('slug', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) logDbError('getBaseDiet', error)
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
  const { data, error } = await supabase
    .from('progress_entries')
    .select('*')
    .eq('user_id', userId)
    .order('data', { ascending: false })
  if (error) logDbError('getProgressEntries', error, { userId })

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
