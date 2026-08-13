import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import type {
  Product,
  Entitlement,
  ProgressEntry,
  Exercise,
  ExerciseVariation,
  Stretch,
} from '@/types/db'

// =====================================================================
// Consultas do painel admin. TODAS usam a service role (enxergam tudo,
// ignoram RLS). Só devem ser chamadas após o guard de admin.
// =====================================================================

// Escapa o termo de busca para uso no filtro .or() do PostgREST.
function safeSearch(q: string): string {
  return q.replace(/[(),*]/g, ' ').trim().slice(0, 80)
}

export async function getAdminOverview() {
  const admin = createAdminClient()
  const hoje = todayISO()
  const seteDiasAtras = new Date(Date.now() - 7 * 86400000).toISOString()

  const [{ count: totalAlunas }, { count: acessosHoje }, { count: acessosSemana }, ultimos] =
    await Promise.all([
      admin.from('profiles').select('id', { count: 'exact', head: true }),
      admin
        .from('entitlements')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', `${hoje}T00:00:00`),
      admin
        .from('entitlements')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', seteDiasAtras),
      admin
        .from('webhook_events')
        .select('id, provider, event_id, processed, created_at, payload')
        .eq('provider', 'kiwify')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

  return {
    totalAlunas: totalAlunas ?? 0,
    acessosHoje: acessosHoje ?? 0,
    acessosSemana: acessosSemana ?? 0,
    ultimosWebhooks: (ultimos.data ?? []) as Array<{
      id: string
      event_id: string
      processed: boolean
      created_at: string
      payload: Record<string, unknown> | null
    }>,
  }
}

export interface AlunaRow {
  id: string
  nome: string | null
  email: string | null
  created_at: string
  produtosAtivos: string[]
  ultimoLogin: string | null
}

export async function listAlunas(opts: { q?: string; page?: number; perPage?: number }) {
  const admin = createAdminClient()
  const page = Math.max(1, opts.page ?? 1)
  const perPage = opts.perPage ?? 20
  const from = (page - 1) * perPage

  let query = admin
    .from('profiles')
    .select('id, nome, email, created_at', { count: 'exact' })
  const q = opts.q ? safeSearch(opts.q) : ''
  if (q) query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%`)
  query = query.order('created_at', { ascending: false }).range(from, from + perPage - 1)

  const { data, count } = await query
  const rows = (data ?? []) as Array<{ id: string; nome: string | null; email: string | null; created_at: string }>
  const ids = rows.map((r) => r.id)

  // Produtos ativos por aluna.
  const porAluna = new Map<string, string[]>()
  if (ids.length) {
    const { data: ents } = await admin
      .from('entitlements')
      .select('user_id, product:products(nome)')
      .in('user_id', ids)
      .eq('status', 'ativo')
    for (const e of ents ?? []) {
      const nome = (e.product as unknown as { nome?: string })?.nome
      if (!nome) continue
      const arr = porAluna.get(e.user_id as string) ?? []
      arr.push(nome)
      porAluna.set(e.user_id as string, arr)
    }
  }

  // Último login (auth.users) — uma chamada por linha (tabela interna).
  const logins = await Promise.all(
    ids.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id)
      return [id, (data.user as { last_sign_in_at?: string } | null)?.last_sign_in_at ?? null] as const
    }),
  )
  const loginMap = new Map(logins)

  const out: AlunaRow[] = rows.map((r) => ({
    ...r,
    produtosAtivos: porAluna.get(r.id) ?? [],
    ultimoLogin: loginMap.get(r.id) ?? null,
  }))

  return { rows: out, total: count ?? 0, page, perPage }
}

export interface EntitlementView extends Entitlement {
  produtoNome: string
  produtoSlug: string
}

export async function getAlunaFicha(id: string) {
  const admin = createAdminClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', id).maybeSingle()
  if (!profile) return null

  const { data: authRes } = await admin.auth.admin.getUserById(id)
  const authUser = authRes.user as
    | { email?: string; created_at?: string; last_sign_in_at?: string; email_confirmed_at?: string }
    | null

  const { data: entsRaw } = await admin
    .from('entitlements')
    .select('*, product:products(nome, slug)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
  const entitlements: EntitlementView[] = (entsRaw ?? []).map((e) => ({
    ...(e as Entitlement),
    produtoNome: (e.product as unknown as { nome?: string })?.nome ?? '?',
    produtoSlug: (e.product as unknown as { slug?: string })?.slug ?? '',
  }))

  const [{ data: checkins }, { count: aulas }, { data: progresso }, { data: config }, { data: sessoes }, { data: comentarios }, { data: variacoes }, { count: comAlongamento }, { count: semAlongamento }] =
    await Promise.all([
      admin.from('checkins').select('data').eq('user_id', id),
      admin.from('lesson_completions').select('id', { count: 'exact', head: true }).eq('user_id', id),
      admin
        .from('progress_entries')
        .select('data, medidas, peso, nota, foto_path')
        .eq('user_id', id)
        .order('data', { ascending: false })
        .limit(5),
      admin.from('user_training_config').select('*').eq('user_id', id).maybeSingle(),
      admin
        .from('training_sessions')
        .select('data, semana, dia, completa, series_usadas, descanso_usado, alongou')
        .eq('user_id', id)
        .order('data', { ascending: false })
        .limit(15),
      admin
        .from('session_feedback')
        .select('comentario, eixo_dificuldade, intensidade_percebida, created_at')
        .eq('user_id', id)
        .not('comentario', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10),
      admin
        .from('user_exercise_variations')
        .select('variacao_nivel, exercise:exercises(nome, ordem_no_circuito)')
        .eq('user_id', id),
      // Adesão ao alongamento (todas as sessões, não só as 15 exibidas).
      admin.from('training_sessions').select('id', { count: 'exact', head: true }).eq('user_id', id).eq('alongou', true),
      admin.from('training_sessions').select('id', { count: 'exact', head: true }).eq('user_id', id).eq('alongou', false),
    ])

  const variacoesView = ((variacoes ?? []) as Array<{ variacao_nivel: number; exercise: { nome?: string; ordem_no_circuito?: number } | null }>)
    .map((v) => ({
      nome: v.exercise?.nome ?? '?',
      ordem: v.exercise?.ordem_no_circuito ?? 0,
      nivel: v.variacao_nivel,
    }))
    .sort((a, b) => a.ordem - b.ordem)

  const streak = calcularStreak((checkins ?? []).map((c) => c.data as string))

  // Histórico de webhooks desta aluna (por e-mail no payload).
  const email = (profile.email as string) ?? authUser?.email ?? ''
  let webhooks: Array<{ event_id: string; processed: boolean; created_at: string; payload: Record<string, unknown> | null }> = []
  if (email) {
    const { data: wh } = await admin
      .from('webhook_events')
      .select('event_id, processed, created_at, payload')
      .order('created_at', { ascending: false })
      .limit(200)
    webhooks = (wh ?? []).filter((w) => {
      const p = (w.payload ?? {}) as Record<string, unknown>
      const e =
        (p.customer_email as string) ??
        ((p.Customer as { email?: string })?.email) ??
        ''
      return e?.toLowerCase() === email.toLowerCase()
    }).slice(0, 20)
  }

  return {
    profile: profile as { id: string; nome: string | null; email: string | null; onboarding_completo: boolean; created_at: string },
    auth: {
      created_at: authUser?.created_at ?? null,
      last_sign_in_at: authUser?.last_sign_in_at ?? null,
      confirmado: Boolean(authUser?.email_confirmed_at),
    },
    entitlements,
    streak,
    aulasConcluidas: aulas ?? 0,
    totalCheckins: (checkins ?? []).length,
    progresso: (progresso ?? []) as Pick<ProgressEntry, 'data' | 'medidas' | 'peso' | 'nota' | 'foto_path'>[],
    webhooks,
    // Circuito:
    config: (config as {
      faixa_etaria: string | null
      series: number
      descanso_seg: number
      tempo_execucao_seg: number
      semana_atual: number
      dia_atual: number
    } | null) ?? null,
    alongamento: { com: comAlongamento ?? 0, sem: semAlongamento ?? 0 },
    sessoes: (sessoes ?? []) as Array<{ data: string; semana: number; dia: number; completa: boolean; series_usadas: number | null; descanso_usado: number | null; alongou: boolean | null }>,
    comentarios: (comentarios ?? []) as Array<{ comentario: string | null; eixo_dificuldade: string | null; intensidade_percebida: number | null; created_at: string }>,
    variacoes: variacoesView,
  }
}

// Lista de produtos ATIVOS (para o seletor de "conceder acesso").
export async function listProductsSimple(): Promise<Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'>[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('id, nome, slug, tipo')
    .eq('ativo', true)
    .order('nome', { ascending: true })
  return (data ?? []) as Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'>[]
}

// --- Produtos (Parte 3) ---------------------------------------------
export interface ProductAdminRow extends Product {
  compradores: number
}

export async function listProductsAdmin(): Promise<ProductAdminRow[]> {
  const admin = createAdminClient()
  const { data: products } = await admin
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: ents } = await admin
    .from('entitlements')
    .select('product_id')
    .eq('status', 'ativo')
  const counts = new Map<string, number>()
  for (const e of ents ?? []) {
    const pid = e.product_id as string
    counts.set(pid, (counts.get(pid) ?? 0) + 1)
  }

  return (products ?? []).map((p) => ({
    ...(p as Product),
    compradores: counts.get((p as Product).id) ?? 0,
  }))
}

export interface UpsellRow {
  id: string
  upsell_product_id: string
  ordem: number
  ativo: boolean
  produto: Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'> | null
}

export async function getProductAdmin(id: string): Promise<{
  product: Product
  upsells: UpsellRow[]
  todos: Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'>[]
} | null> {
  const admin = createAdminClient()
  const { data: product } = await admin.from('products').select('*').eq('id', id).maybeSingle()
  if (!product) return null

  const { data: ups } = await admin
    .from('product_upsells')
    .select('id, upsell_product_id, ordem, ativo')
    .eq('product_id', id)
    .order('ordem', { ascending: true })

  const upsellIds = (ups ?? []).map((u) => u.upsell_product_id as string)
  const { data: upProds } = upsellIds.length
    ? await admin.from('products').select('id, nome, slug, tipo').in('id', upsellIds)
    : { data: [] as Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'>[] }
  const prodMap = new Map((upProds ?? []).map((p) => [p.id, p as Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'>]))

  const upsells: UpsellRow[] = (ups ?? []).map((u) => ({
    id: u.id as string,
    upsell_product_id: u.upsell_product_id as string,
    ordem: u.ordem as number,
    ativo: u.ativo as boolean,
    produto: prodMap.get(u.upsell_product_id as string) ?? null,
  }))

  const { data: todos } = await admin
    .from('products')
    .select('id, nome, slug, tipo')
    .order('nome', { ascending: true })

  return {
    product: product as Product,
    upsells,
    todos: (todos ?? []) as Pick<Product, 'id' | 'nome' | 'slug' | 'tipo'>[],
  }
}

// --- Circuito: gestão de exercícios/variações/alongamentos -----------
export interface ExerciseWithVariations extends Exercise {
  variacoes: ExerciseVariation[]
}

export async function getCircuitoOverview() {
  const admin = createAdminClient()
  const [{ data: exercises }, { data: variations }, { data: stretches }] = await Promise.all([
    admin.from('exercises').select('*').order('ordem_no_circuito', { ascending: true }),
    admin.from('exercise_variations').select('*').order('nivel', { ascending: true }),
    admin.from('stretches').select('*').order('ordem', { ascending: true }),
  ])

  const varsByExercise = new Map<string, ExerciseVariation[]>()
  for (const v of (variations ?? []) as ExerciseVariation[]) {
    const arr = varsByExercise.get(v.exercise_id) ?? []
    arr.push(v)
    varsByExercise.set(v.exercise_id, arr)
  }

  const exs: ExerciseWithVariations[] = ((exercises ?? []) as Exercise[]).map((e) => ({
    ...e,
    variacoes: (varsByExercise.get(e.id) ?? []).sort((a, b) => a.nivel - b.nivel),
  }))

  // Exercícios agrupados por dia do ciclo (1-7).
  const porDia = new Map<number, ExerciseWithVariations[]>()
  for (const e of exs) {
    const arr = porDia.get(e.dia_do_ciclo) ?? []
    arr.push(e)
    porDia.set(e.dia_do_ciclo, arr)
  }
  const dias = Array.from(porDia.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([dia, itens]) => ({ dia, exercicios: itens.sort((a, b) => a.ordem_no_dia - b.ordem_no_dia) }))

  const st = (stretches ?? []) as Stretch[]
  const videosVariacoes = ((variations ?? []) as ExerciseVariation[]).filter((v) => v.panda_video_id).length
  const videosAlongamentos = st.filter((s) => s.panda_video_id).length

  return {
    dias,
    stretches: st,
    counts: {
      preenchidos: videosVariacoes + videosAlongamentos,
      total: ((variations ?? []).length) + st.length,
    },
  }
}

export async function getExerciseAdmin(id: string): Promise<ExerciseWithVariations | null> {
  const admin = createAdminClient()
  const { data: ex } = await admin.from('exercises').select('*').eq('id', id).maybeSingle()
  if (!ex) return null
  const { data: vars } = await admin
    .from('exercise_variations')
    .select('*')
    .eq('exercise_id', id)
    .order('nivel', { ascending: true })
  return { ...(ex as Exercise), variacoes: (vars ?? []) as ExerciseVariation[] }
}

// --- Circuito: liberação de semanas -----------------------------------
export interface SemanaAdminRow {
  semana: number
  liberada: boolean
  variacao: number // vN dessa semana
  videosPreenchidos: number
  videosTotal: number
  alunasAguardando: number
}

export async function getSemanasAdmin(): Promise<SemanaAdminRow[]> {
  const admin = createAdminClient()
  const [{ data: config }, { data: variations }, { data: aguardando }] = await Promise.all([
    admin.from('program_weeks_config').select('semana, liberada'),
    admin.from('exercise_variations').select('nivel, panda_video_id'),
    admin.from('user_training_config').select('aguardando_liberacao'),
  ])

  const liberadaMap = new Map<number, boolean>()
  for (const c of (config ?? []) as { semana: number; liberada: boolean }[]) liberadaMap.set(c.semana, c.liberada)

  const preenchidosPorNivel = new Map<number, number>()
  for (const v of (variations ?? []) as { nivel: number; panda_video_id: string | null }[]) {
    if (v.panda_video_id) preenchidosPorNivel.set(v.nivel, (preenchidosPorNivel.get(v.nivel) ?? 0) + 1)
  }

  const aguardandoPorSemana = new Map<number, number>()
  for (const a of (aguardando ?? []) as { aguardando_liberacao: number }[]) {
    if (a.aguardando_liberacao > 0) aguardandoPorSemana.set(a.aguardando_liberacao, (aguardandoPorSemana.get(a.aguardando_liberacao) ?? 0) + 1)
  }

  return [1, 2, 3, 4].map((semana) => ({
    semana,
    liberada: semana === 1 ? true : liberadaMap.get(semana) ?? false,
    variacao: semana, // Semana N entra em vN
    videosPreenchidos: preenchidosPorNivel.get(semana) ?? 0,
    videosTotal: 35,
    alunasAguardando: aguardandoPorSemana.get(semana) ?? 0,
  }))
}

// --- Circuito: feedbacks das alunas (Willian lê regularmente) ---------
export interface FeedbackRow {
  id: string
  user_id: string
  aluna: string
  email: string | null
  comentario: string | null
  eixo_dificuldade: string | null
  intensidade_percebida: number | null
  ajuste_aceito: boolean
  data_sessao: string | null
  created_at: string
}

export async function listFeedbacks(opts: {
  q?: string
  soComentario?: boolean
  de?: string // ISO date
  ate?: string
  page?: number
  perPage?: number
}) {
  const admin = createAdminClient()
  const page = Math.max(1, opts.page ?? 1)
  const perPage = opts.perPage ?? 30
  const from = (page - 1) * perPage

  let query = admin
    .from('session_feedback')
    .select('id, user_id, comentario, eixo_dificuldade, intensidade_percebida, ajuste_aceito, created_at, session:training_sessions(data)', { count: 'exact' })
  if (opts.soComentario) query = query.not('comentario', 'is', null)
  if (opts.de) query = query.gte('created_at', `${opts.de}T00:00:00`)
  if (opts.ate) query = query.lte('created_at', `${opts.ate}T23:59:59`)
  query = query.order('created_at', { ascending: false }).range(from, from + perPage - 1)

  const { data, count } = await query
  const rows = (data ?? []) as Array<{
    id: string
    user_id: string
    comentario: string | null
    eixo_dificuldade: string | null
    intensidade_percebida: number | null
    ajuste_aceito: boolean
    created_at: string
    session: { data?: string } | null
  }>

  // Perfis das alunas (nome/email) numa tacada.
  const ids = Array.from(new Set(rows.map((r) => r.user_id)))
  const nomeMap = new Map<string, { nome: string | null; email: string | null }>()
  if (ids.length) {
    const { data: profs } = await admin.from('profiles').select('id, nome, email').in('id', ids)
    for (const p of profs ?? []) nomeMap.set(p.id as string, { nome: (p.nome as string) ?? null, email: (p.email as string) ?? null })
  }

  let out: FeedbackRow[] = rows.map((r) => ({
    id: r.id,
    user_id: r.user_id,
    aluna: nomeMap.get(r.user_id)?.nome ?? '—',
    email: nomeMap.get(r.user_id)?.email ?? null,
    comentario: r.comentario,
    eixo_dificuldade: r.eixo_dificuldade,
    intensidade_percebida: r.intensidade_percebida,
    ajuste_aceito: r.ajuste_aceito,
    data_sessao: r.session?.data ?? null,
    created_at: r.created_at,
  }))

  // Filtro por aluna (nome/email) — aplicado após o join (client-side).
  if (opts.q) {
    const q = opts.q.toLowerCase()
    out = out.filter((r) => r.aluna.toLowerCase().includes(q) || (r.email ?? '').toLowerCase().includes(q))
  }

  return { rows: out, total: count ?? 0, page, perPage }
}
