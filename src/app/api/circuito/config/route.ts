import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureException } from '@/lib/observability'
import { isFaixa } from '@/lib/training'
import { resolverCircuito, ensureTrainingConfig } from '@/lib/circuito'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cria a config do circuito (do protocolo pedido) a partir da faixa etária.
// Usado pelo "age gate": quem ainda não informou a idade responde uma vez.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'nao_autenticado' }, { status: 401 })

  const body = (await request.json().catch(() => ({}))) as { faixa_etaria?: string; circuito?: string }
  if (!isFaixa(body.faixa_etaria)) {
    return NextResponse.json({ erro: 'faixa_invalida' }, { status: 400 })
  }

  try {
    const { atual } = await resolverCircuito(supabase, user.id, body.circuito)
    if (!atual || (body.circuito && atual.slug !== body.circuito)) {
      return NextResponse.json({ erro: 'sem_acesso' }, { status: 403 })
    }

    const existente = await ensureTrainingConfig(supabase, user.id, atual.slug, body.faixa_etaria)
    if (existente && existente.faixa_etaria !== body.faixa_etaria) {
      await supabase
        .from('user_training_config')
        .update({ faixa_etaria: body.faixa_etaria, atualizado_em: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('circuito', atual.slug)
    }

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
