import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTrainingConfig, advanceAfterCompletion } from '@/lib/circuito'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'
import type { SessionExerciseStatus } from '@/types/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUS: SessionExerciseStatus[] = ['fez', 'nao_conseguiu', 'pulou']

// Finaliza os exercícios da sessão do circuito. Cria training_session +
// session_exercises. Se TODOS forem 'fez', a sessão é completa: gera
// check-in 'treino' (mantém streak) e avança o dia/semana. O feedback é
// enviado num segundo passo (/api/circuito/feedback).
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 })

  const b = (await request.json().catch(() => ({}))) as {
    exercicios?: { exercise_id: string; variacao_nivel: number; status: SessionExerciseStatus }[]
    alongou?: boolean
  }
  const itens = b.exercicios ?? []
  if (itens.length === 0 || itens.some((e) => !e.exercise_id || !STATUS.includes(e.status))) {
    return NextResponse.json({ error: 'exercicios_invalidos' }, { status: 400 })
  }

  try {
    const config = await getTrainingConfig(supabase, user.id)
    if (!config) return NextResponse.json({ error: 'sem_config' }, { status: 400 })

    const completa = itens.every((e) => e.status === 'fez')
    const hoje = todayISO()

    const { data: session, error: sErr } = await supabase
      .from('training_sessions')
      .insert({
        user_id: user.id,
        data: hoje,
        semana: config.semana_atual,
        dia: config.dia_atual,
        completa,
        series_usadas: config.series,
        descanso_usado: config.descanso_seg,
        alongou: typeof b.alongou === 'boolean' ? b.alongou : null,
      })
      .select('id')
      .single()
    if (sErr) throw sErr

    const rows = itens.map((e, i) => ({
      session_id: session.id,
      exercise_id: e.exercise_id,
      variacao_nivel: e.variacao_nivel,
      status: e.status,
      ordem: i + 1,
    }))
    const { error: seErr } = await supabase.from('session_exercises').insert(rows)
    if (seErr) throw seErr

    let avanco = null
    if (completa) {
      // Check-in 'treino' do dia (idempotente) → mantém streak/constância.
      await supabase
        .from('checkins')
        .upsert(
          { user_id: user.id, data: hoje, tipo: 'treino' },
          { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
        )
      avanco = await advanceAfterCompletion(supabase, user.id, config)
    }

    return NextResponse.json({
      ok: true,
      session_id: session.id,
      completa,
      // Concluiu a semana mas a próxima está bloqueada → mostrar mensagem.
      aguardandoLiberacao: avanco && avanco.aguardando > 0 ? avanco.aguardando : 0,
      concluiuCiclo: Boolean(avanco?.concluiuCiclo),
      semanaConcluida: avanco?.concluiuCiclo ? config.semana_atual : 0,
    })
  } catch (err) {
    captureException(err, { rota: 'circuito_session' })
    return NextResponse.json({ error: 'falha_ao_salvar_sessao' }, { status: 500 })
  }
}
