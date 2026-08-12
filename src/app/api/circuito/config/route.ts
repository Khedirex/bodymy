import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureException } from '@/lib/observability'
import { isFaixa, partidaPorFaixa } from '@/lib/training'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cria a config do circuito a partir da faixa etária. Usado pelo "age gate":
// alunas que já tinham conta (antes do circuito) informam a idade uma vez.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'nao_autenticado' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { faixa_etaria?: string }
  if (!isFaixa(body.faixa_etaria)) {
    return NextResponse.json({ erro: 'faixa_invalida' }, { status: 400 })
  }

  try {
    const { data: existing } = await supabase
      .from('user_training_config')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      await supabase
        .from('user_training_config')
        .update({ faixa_etaria: body.faixa_etaria, atualizado_em: new Date().toISOString() })
        .eq('user_id', user.id)
      return NextResponse.json({ ok: true })
    }

    const partida = partidaPorFaixa(body.faixa_etaria)
    const { error } = await supabase.from('user_training_config').insert({
      user_id: user.id,
      faixa_etaria: body.faixa_etaria,
      series: partida.series,
      descanso_seg: partida.descanso_seg,
    })
    if (error) throw error

    // Também registra a faixa no perfil (para o admin).
    const { data: profile } = await supabase.from('profiles').select('quiz_data').eq('id', user.id).maybeSingle()
    await supabase
      .from('profiles')
      .update({ quiz_data: { ...(profile?.quiz_data ?? {}), faixa_etaria: body.faixa_etaria } })
      .eq('id', user.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'circuito_config' })
    return NextResponse.json({ erro: 'falha_ao_salvar' }, { status: 500 })
  }
}
