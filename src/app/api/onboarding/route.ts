import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureException } from '@/lib/observability'
import { isFaixa, partidaPorFaixa } from '@/lib/training'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HORARIOS = ['manha', 'tarde', 'noite'] as const
type Horario = (typeof HORARIOS)[number]

// Salva o onboarding (faixa etária + horário preferido), marca
// onboarding_completo e inicializa a configuração do circuito a partir da
// faixa etária (ponto de partida de séries/descanso).
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'nao_autenticado' }, { status: 401 })

  let body: { horario?: string; faixa_etaria?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ erro: 'json_invalido' }, { status: 400 })
  }

  const faixa = body.faixa_etaria
  if (!isFaixa(faixa)) {
    return NextResponse.json({ erro: 'faixa_invalida' }, { status: 400 })
  }
  // Horário é opcional (mantém compatibilidade; hoje não é mais perguntado).
  const horario = body.horario
  if (horario !== undefined && !HORARIOS.includes(horario as Horario)) {
    return NextResponse.json({ erro: 'horario_invalido' }, { status: 400 })
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('quiz_data')
      .eq('id', user.id)
      .maybeSingle()

    const quizData: Record<string, unknown> = {
      ...(profile?.quiz_data ?? {}),
      faixa_etaria: faixa,
    }
    if (horario) quizData.horario_preferido = horario

    const { error } = await supabase
      .from('profiles')
      .update({ quiz_data: quizData, onboarding_completo: true })
      .eq('id', user.id)
    if (error) throw error

    // Inicializa a config do circuito (não sobrescreve séries/descanso já
    // ajustados — só cria se ainda não existir).
    const { data: existing } = await supabase
      .from('user_training_config')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!existing) {
      const partida = partidaPorFaixa(faixa)
      const { error: cfgErr } = await supabase.from('user_training_config').insert({
        user_id: user.id,
        faixa_etaria: faixa,
        series: partida.series,
        descanso_seg: partida.descanso_seg,
      })
      if (cfgErr) throw cfgErr
    } else {
      // Já existe: apenas registra a faixa (mantém ajustes atuais).
      await supabase
        .from('user_training_config')
        .update({ faixa_etaria: faixa, atualizado_em: new Date().toISOString() })
        .eq('user_id', user.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'onboarding' })
    return NextResponse.json({ erro: 'falha_ao_salvar' }, { status: 500 })
  }
}
