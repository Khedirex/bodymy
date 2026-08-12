import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTrainingConfig } from '@/lib/circuito'
import { SEMANA_ZERO_DIAS } from '@/lib/training'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Semana Zero: conclui um dia de alongamentos, ou pula tudo ("Estou pronta").
// Cada dia concluído gera check-in 'treino' (conta para a constância). Ao
// completar os 3 dias — ou ao pular — semana_zero_completa vira true.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 })

  const b = (await request.json().catch(() => ({}))) as { pronta?: boolean }

  try {
    const config = await getTrainingConfig(supabase, user.id)
    if (!config) return NextResponse.json({ error: 'sem_config' }, { status: 400 })
    if (config.semana_zero_completa) {
      return NextResponse.json({ ok: true, semana_zero_completa: true })
    }

    if (b.pronta) {
      await supabase
        .from('user_training_config')
        .update({ semana_zero_completa: true, atualizado_em: new Date().toISOString() })
        .eq('user_id', user.id)
      return NextResponse.json({ ok: true, semana_zero_completa: true, pulou: true })
    }

    const novosDias = Math.min(SEMANA_ZERO_DIAS, config.semana_zero_dias + 1)
    const completa = novosDias >= SEMANA_ZERO_DIAS
    await supabase
      .from('user_training_config')
      .update({
        semana_zero_dias: novosDias,
        semana_zero_completa: completa,
        atualizado_em: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    // Check-in do dia (mantém streak).
    await supabase
      .from('checkins')
      .upsert(
        { user_id: user.id, data: todayISO(), tipo: 'treino' },
        { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
      )

    return NextResponse.json({ ok: true, semana_zero_dias: novosDias, semana_zero_completa: completa })
  } catch (err) {
    captureException(err, { rota: 'circuito_semana_zero' })
    return NextResponse.json({ error: 'falha' }, { status: 500 })
  }
}
