import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasNocheAccess, getNocheEstado } from '@/lib/noche-server'
import { audioDaNoche, repeticoesDaNoche, NOCHE_TOTAL_NOCHES } from '@/lib/noche'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Marca a noite concluída. O número da noite vem do SERVIDOR, não do client:
// o corpo só confirma qual ela acha que está fazendo.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  if (!(await hasNocheAccess(user.id))) {
    return NextResponse.json({ error: 'sin_acceso' }, { status: 403 })
  }

  try {
    const estado = await getNocheEstado(user.id)
    if (estado.terminado || !estado.proximaNoche) {
      return NextResponse.json({ ok: true, terminado: true })
    }
    // Uma noite por dia: evita marcar o reto inteiro numa sentada.
    if (estado.feitoHoje) {
      return NextResponse.json({ error: 'ya_hiciste_hoy' }, { status: 409 })
    }

    const noche = estado.proximaNoche
    const audio = audioDaNoche(noche)
    const admin = createAdminClient()
    const { error } = await admin.from('noche_registros').upsert(
      {
        user_id: user.id,
        noche,
        audio_id: audio.id,
        repeticao: repeticoesDaNoche(estado.nivel, noche) === 2,
        concluida_em: new Date().toISOString(),
      },
      { onConflict: 'user_id,noche' },
    )
    if (error) throw error

    // Check-in do dia → entra na constância da Home (idempotente).
    await supabase.from('checkins').upsert(
      { user_id: user.id, data: todayISO(), tipo: 'treino' },
      { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
    )

    return NextResponse.json({
      ok: true,
      noche,
      concluidas: estado.concluidas + 1,
      terminado: estado.concluidas + 1 >= NOCHE_TOTAL_NOCHES,
    })
  } catch (err) {
    captureException(err, { rota: 'noche_completar' })
    return NextResponse.json({ error: 'no pudimos guardar tu noche' }, { status: 500 })
  }
}
