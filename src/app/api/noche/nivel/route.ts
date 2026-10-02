import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasNocheAccess } from '@/lib/noche-server'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NIVEIS = ['leve', 'moderada', 'severa']

// Nível de sono informado no primeiro acesso ao ritual.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  if (!(await hasNocheAccess(user.id))) {
    return NextResponse.json({ error: 'sin_acceso' }, { status: 403 })
  }

  const body = (await request.json().catch(() => ({}))) as { nivel?: string }
  if (!body.nivel || !NIVEIS.includes(body.nivel)) {
    return NextResponse.json({ error: 'nivel_invalido' }, { status: 400 })
  }

  try {
    // Escrita via admin: as tabelas só têm policy de leitura do dono.
    const admin = createAdminClient()
    const { error } = await admin.from('noche_estado').upsert(
      { user_id: user.id, nivel: body.nivel, atualizado_em: new Date().toISOString() },
      { onConflict: 'user_id' },
    )
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'noche_nivel' })
    return NextResponse.json({ error: 'no pudimos guardar' }, { status: 500 })
  }
}
