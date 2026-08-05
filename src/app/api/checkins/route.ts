import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCheckinDates } from '@/lib/queries'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'
import type { CheckinTipo } from '@/types/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TIPOS: CheckinTipo[] = ['treino', 'dieta', 'agua']

// Check-in rápido (treino | dieta | agua) para o dia de hoje.
// Idempotente: se já existe, apenas retorna o estado atual.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  let body: { tipo?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'json inválido' }, { status: 400 })
  }

  const tipo = body.tipo as CheckinTipo
  if (!TIPOS.includes(tipo)) {
    return NextResponse.json({ error: 'tipo inválido' }, { status: 400 })
  }

  const hoje = todayISO()
  try {
    const { error } = await supabase
      .from('checkins')
      .upsert(
        { user_id: user.id, data: hoje, tipo },
        { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
      )
    if (error) throw error

    const datas = await getCheckinDates(user.id)
    const streak = calcularStreak(datas, hoje)
    return NextResponse.json({ ok: true, streak, hoje })
  } catch (err) {
    captureException(err, { rota: 'checkin', tipo })
    return NextResponse.json({ error: 'erro ao registrar check-in' }, { status: 500 })
  }
}
