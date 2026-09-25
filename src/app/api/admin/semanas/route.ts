import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { getProgramaCircuito } from '@/lib/admin-queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Libera/bloqueia uma semana do programa. A semana 1 é sempre liberada.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const b = (await request.json().catch(() => ({}))) as { semana?: number; liberada?: boolean }
  const semana = Number(b.semana)
  const liberada = b.liberada === true

  const admin = createAdminClient()

  // A semana 1 é sempre liberada; o teto vem da duração do programa, não de
  // uma lista fixa (antes era [2,3,4], herdado do protocolo de 4 semanas).
  const programa = await getProgramaCircuito()
  if (!programa) return NextResponse.json({ error: 'sem_programa' }, { status: 400 })
  if (!Number.isInteger(semana) || semana < 2 || semana > programa.duracao_semanas) {
    return NextResponse.json({ error: 'semana_invalida' }, { status: 400 })
  }

  const { error } = await admin
    .from('program_weeks_config')
    .upsert(
      { program_id: programa.id, semana, liberada, atualizado_em: new Date().toISOString() },
      { onConflict: 'program_id,semana' },
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
