import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Libera/bloqueia uma semana (2, 3 ou 4). A semana 1 é sempre liberada.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const b = (await request.json().catch(() => ({}))) as { semana?: number; liberada?: boolean }
  const semana = Number(b.semana)
  if (![2, 3, 4].includes(semana)) {
    return NextResponse.json({ error: 'semana_invalida' }, { status: 400 })
  }
  const liberada = b.liberada === true

  const admin = createAdminClient()
  const { error } = await admin
    .from('program_weeks_config')
    .upsert(
      { semana, liberada, atualizado_em: new Date().toISOString() },
      { onConflict: 'semana' },
    )
  if (error) return NextResponse.json({ error: `erro:${error.message}` }, { status: 500 })

  await adminLog({
    adminId: guard.info.adminId,
    acao: liberada ? 'liberar_semana' : 'bloquear_semana',
    alvoTipo: 'program_week',
    alvoId: String(semana),
    detalhes: { semana, liberada },
  })
  return NextResponse.json({ ok: true, mensagem: liberada ? `Semana ${semana} liberada.` : `Semana ${semana} bloqueada.` })
}
