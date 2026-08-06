import 'server-only'
import { notFound } from 'next/navigation'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// =====================================================================
// Guard do painel admin. is_admin é verificado SEMPRE no servidor, lendo
// o profile com a service role. Quem não é admin recebe 404 (não 403) —
// não revelamos que a área existe.
//
// IMPORTANTE: is_admin nunca é alterável pela interface (só por SQL
// direto). Não existe função aqui para escrever is_admin.
// =====================================================================

export interface AdminInfo {
  adminId: string
  nome: string | null
  email: string | null
}

// Retorna o admin logado ou null (sem lançar). Usado por rotas de API.
export async function getAdmin(): Promise<AdminInfo | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin, nome, email')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.is_admin) return null
  return { adminId: user.id, nome: profile.nome ?? null, email: profile.email ?? null }
}

// Para PÁGINAS: 404 se não for admin.
export async function requireAdminPage(): Promise<AdminInfo> {
  const info = await getAdmin()
  if (!info) notFound()
  return info
}

// Para ROTAS DE API: devolve { ok:false, res } com 404 se não for admin.
export async function adminApiGuard(): Promise<
  { ok: true; info: AdminInfo } | { ok: false; res: NextResponse }
> {
  const info = await getAdmin()
  if (!info) {
    return { ok: false, res: NextResponse.json({ error: 'not_found' }, { status: 404 }) }
  }
  return { ok: true, info }
}

// Registra uma ação administrativa (auditoria). Nunca deixa a ação
// principal falhar por causa do log.
export async function adminLog(params: {
  adminId: string
  acao: string
  alvoTipo?: string
  alvoId?: string
  detalhes?: Record<string, unknown>
}) {
  try {
    const admin = createAdminClient()
    await admin.from('admin_logs').insert({
      admin_user_id: params.adminId,
      acao: params.acao,
      alvo_tipo: params.alvoTipo ?? null,
      alvo_id: params.alvoId ?? null,
      detalhes: params.detalhes ?? null,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[admin] falha ao gravar admin_log:', err)
  }
}
