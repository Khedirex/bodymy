import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTrainingConfig, advanceAfterCompletion, getCircuitoPrograma, diaDoDesafio } from '@/lib/circuito'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Conclui o dia no formato 'aula_diaria' (vídeo + texto de apoio). Faz o
// mesmo que o fim de uma sessão completa do circuito: grava a
// training_session, gera o check-in 'treino' (streak/constância) e avança
// o dia. Um dia do reto por dia do calendário — o reto é progressivo.
export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 })

  try {
    const programa = await getCircuitoPrograma(supabase, user.id)
    if (!programa) return NextResponse.json({ error: 'sem_acesso' }, { status: 403 })
    if (programa.formato !== 'aula_diaria') {
      return NextResponse.json({ error: 'formato_invalido' }, { status: 400 })
    }

    const config = await getTrainingConfig(supabase, user.id, programa.id)
    if (!config) return NextResponse.json({ error: 'sem_config' }, { status: 400 })

    const hoje = todayISO()
    const { data: feitoHoje } = await supabase
      .from('training_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('program_id', programa.id)
      .eq('data', hoje)
      .eq('completa', true)
      .limit(1)
      .maybeSingle()
    if (feitoHoje) return NextResponse.json({ error: 'ja_feito_hoje' }, { status: 409 })

    const diaFeito = diaDoDesafio(config)

    const { error: sErr } = await supabase.from('training_sessions').insert({
      user_id: user.id,
      program_id: programa.id,
      data: hoje,
      semana: config.semana_atual,
      dia: config.dia_atual,
      completa: true,
    })
    if (sErr) throw sErr

    await supabase
      .from('checkins')
      .upsert(
        { user_id: user.id, data: hoje, tipo: 'treino' },
        { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
      )

    const avanco = await advanceAfterCompletion(supabase, user.id, config, programa)

    return NextResponse.json({
      ok: true,
      diaFeito,
      proximoDia: diaDoDesafio({ semana_atual: avanco.semana, dia_atual: avanco.dia }),
      terminouReto: diaFeito >= programa.totalDias,
    })
  } catch (err) {
    captureException(err, { rota: 'circuito_aula' })
    return NextResponse.json({ error: 'falha_ao_salvar' }, { status: 500 })
  }
}
