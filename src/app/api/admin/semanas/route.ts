import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Libera/bloqueia uma semana (2..semanas) de um protocolo. A semana 1 é
// sempre liberada.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const b = (await request.json().catch(() => ({}))) as { circuito?: string; semana?: number; liberada?: boolean }
  const admin = createAdminClient()
  const { data: circuito } = await admin
    .from('circuitos')
    .select('slug, semanas')
    .eq('slug', String(b.circuito ?? ''))
    .maybeSingle()
  if (!circuito) return NextResponse.json({ error: 'circuito_invalido' }, { status: 400 })

  const semana = Number(b.semana)
  if (!Number.isInteger(semana) || semana < 2 || semana > (circuito.semanas as number)) {
    return NextResponse.json({ error: 'semana_invalida' }, { status: 400 })
  }
  const liberada = b.liberada === true

  const { error } = await admin
    .from('program_weeks_config')
    .upsert(
      { circuito: circuito.slug, semana, liberada, atualizado_em: new Date().toISOString() },
      { onConflict: 'circuito,semana' },
    )
  if (error) return NextResponse.json({ error: `erro:${error.message}` }, { status: 500 })

  await adminLog({
    adminId: guard.info.adminId,
    acao: liberada ? 'liberar_semana' : 'bloquear_semana',
    alvoTipo: 'program_week',
    alvoId: `${circuito.slug}:${semana}`,
    detalhes: { circuito: circuito.slug, semana, liberada },
  })
  return NextResponse.json({ ok: true, mensagem: liberada ? `Semana ${semana} liberada.` : `Semana ${semana} bloqueada.` })
}
