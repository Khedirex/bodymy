import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getTrainingConfig } from '@/lib/circuito'
import { clampNivel, nivelEntradaSemana } from '@/lib/training'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Troca a variação de UM exercício durante a sessão ("Está difícil? Faça a
// variação anterior"). direcao: 'facilitar' (-1) | 'dificultar' (+1),
// limitada a [1, semana_atual]. Persiste em user_exercise_variations.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 })

  const b = (await request.json().catch(() => ({}))) as {
    exercise_id?: string
    direcao?: 'facilitar' | 'dificultar'
  }
  if (!b.exercise_id || (b.direcao !== 'facilitar' && b.direcao !== 'dificultar')) {
    return NextResponse.json({ error: 'parametros_invalidos' }, { status: 400 })
  }

  try {
    const config = await getTrainingConfig(supabase, user.id)
    if (!config) return NextResponse.json({ error: 'sem_config' }, { status: 400 })
    const semana = config.semana_atual
    const entrada = nivelEntradaSemana(semana)

    // Nível atual (escolha da aluna ou entrada da semana).
    const { data: atual } = await supabase
      .from('user_exercise_variations')
      .select('variacao_nivel')
      .eq('user_id', user.id)
      .eq('exercise_id', b.exercise_id)
      .maybeSingle()
    const nivelAtual = clampNivel(Math.min(atual?.variacao_nivel ?? entrada, semana))

    const delta = b.direcao === 'facilitar' ? -1 : 1
    const novo = Math.min(semana, Math.max(1, nivelAtual + delta))
    if (novo === nivelAtual) {
      return NextResponse.json({ ok: true, nivel: novo, semLimite: true })
    }

    const { error } = await supabase.from('user_exercise_variations').upsert(
      { user_id: user.id, exercise_id: b.exercise_id, variacao_nivel: novo, atualizado_em: new Date().toISOString() },
      { onConflict: 'user_id,exercise_id' },
    )
    if (error) throw error

    // Retorna a variação (com panda_video_id) via admin client.
    const admin = createAdminClient()
    const { data: variation } = await admin
      .from('exercise_variations')
      .select('*')
      .eq('exercise_id', b.exercise_id)
      .eq('nivel', novo)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      nivel: novo,
      podeFacilitar: novo > 1,
      podeDificultar: novo < semana,
      variation,
    })
  } catch (err) {
    captureException(err, { rota: 'circuito_variation' })
    return NextResponse.json({ error: 'falha' }, { status: 500 })
  }
}
