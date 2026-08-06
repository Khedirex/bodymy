import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import type { Product, Entitlement, ProgressEntry } from '@/types/db'

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

  const [{ data: checkins }, { count: aulas }, { data: progresso }] = await Promise.all([
    admin.from('checkins').select('data').eq('user_id', id),
    admin.from('lesson_completions').select('id', { count: 'exact', head: true }).eq('user_id', id),
    admin
      .from('progress_entries')
      .select('data, medidas, peso, nota, foto_path')
      .eq('user_id', id)
      .order('data', { ascending: false })
      .limit(5),
  ])

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
