import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTrainingConfig } from '@/lib/circuito'
import {
  proporAjuste,
  direcaoPorIntensidade,
  clampSeries,
  clampDescanso,
  clampNivel,
  nivelEntradaSemana,
} from '@/lib/training'
import { captureException } from '@/lib/observability'
import type { EixoDificuldade } from '@/types/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EIXOS: EixoDificuldade[] = ['descanso', 'exercicio', 'series']

// Avaliação final da sessão: comentário + eixo + intensidade (1-6). Aplica o
// ajuste no eixo escolhido (se aceito), ou uma config manual (séries/descanso).
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 })

  const b = (await request.json().catch(() => ({}))) as {
    session_id?: string
    comentario?: string
    eixo_dificuldade?: EixoDificuldade
    intensidade_percebida?: number
    aceito?: boolean
    manual?: { series?: number; descanso_seg?: number }
  }
  if (!b.session_id) return NextResponse.json({ error: 'sessao_obrigatoria' }, { status: 400 })
  const intensidade = Number(b.intensidade_percebida)
  if (!Number.isInteger(intensidade) || intensidade < 1 || intensidade > 6) {
    return NextResponse.json({ error: 'intensidade_invalida' }, { status: 400 })
  }
  const eixo = EIXOS.includes(b.eixo_dificuldade as EixoDificuldade)
    ? (b.eixo_dificuldade as EixoDificuldade)
    : null

  try {
    // Garante que a sessão é da aluna (RLS já protege; confirmamos).
    const { data: sessao } = await supabase
      .from('training_sessions')
      .select('id')
      .eq('id', b.session_id)
      .eq('user_id', user.id)
      .maybeSingle()
    if (!sessao) return NextResponse.json({ error: 'sessao_nao_encontrada' }, { status: 404 })

    const config = await getTrainingConfig(supabase, user.id)
    if (!config) return NextResponse.json({ error: 'sem_config' }, { status: 400 })

    const comentario = (b.comentario ?? '').trim().slice(0, 2000) || null
    const aplicado: Record<string, unknown> = {}
    let aceito = false

    if (b.aceito && b.manual && (b.manual.series != null || b.manual.descanso_seg != null)) {
      // Config personalizada (séries + descanso), respeitando os limites.
      const series = b.manual.series != null ? clampSeries(Number(b.manual.series)) : config.series
      const descanso = b.manual.descanso_seg != null ? clampDescanso(Number(b.manual.descanso_seg)) : config.descanso_seg
      await supabase
        .from('user_training_config')
        .update({ series, descanso_seg: descanso, atualizado_em: new Date().toISOString() })
        .eq('user_id', user.id)
      aplicado.manual = { series, descanso_seg: descanso }
      aceito = true
    } else if (b.aceito && eixo) {
      // Ajuste automático no eixo escolhido.
      const { data: uv } = await supabase
        .from('user_exercise_variations')
        .select('variacao_nivel')
        .eq('user_id', user.id)
      const niveis = (uv ?? []).map((r) => clampNivel(Math.min(r.variacao_nivel as number, config.semana_atual)))
      const entrada = nivelEntradaSemana(config.semana_atual)
      const variacaoMin = niveis.length ? Math.min(...niveis) : entrada
      const variacaoMax = niveis.length ? Math.max(...niveis) : entrada

      const proposta = proporAjuste({
        series: config.series,
        descanso_seg: config.descanso_seg,
        semana: config.semana_atual,
        eixo,
        direcao: direcaoPorIntensidade(intensidade),
        variacaoMin,
        variacaoMax,
      })

      if (proposta.tipo === 'ajuste') {
        if (proposta.series != null || proposta.descanso_seg != null) {
          await supabase
            .from('user_training_config')
            .update({
              series: proposta.series ?? config.series,
              descanso_seg: proposta.descanso_seg ?? config.descanso_seg,
              atualizado_em: new Date().toISOString(),
            })
            .eq('user_id', user.id)
        }
        if (proposta.variacao_delta) {
          // Aplica o delta a todos os exercícios do circuito (dentro do limite).
          await ajustarVariacoes(supabase, user.id, proposta.variacao_delta, config.semana_atual)
        }
        aplicado.eixo = eixo
        aplicado.mudanca = proposta.descricao
        if (proposta.series != null) aplicado.series = proposta.series
        if (proposta.descanso_seg != null) aplicado.descanso_seg = proposta.descanso_seg
        if (proposta.variacao_delta) aplicado.variacao_delta = proposta.variacao_delta
        aceito = true
      }
      // proposta 'manual'/'neutro' não aplicam nada automaticamente aqui.
    }

    const { error } = await supabase.from('session_feedback').upsert(
      {
        session_id: b.session_id,
        user_id: user.id,
        comentario,
        eixo_dificuldade: eixo,
        intensidade_percebida: intensidade,
        ajuste_aceito: aceito,
        ajuste_aplicado: Object.keys(aplicado).length ? aplicado : null,
      },
      { onConflict: 'session_id' },
    )
    if (error) throw error

    return NextResponse.json({ ok: true, aplicado, aceito })
  } catch (err) {
    captureException(err, { rota: 'circuito_feedback' })
    return NextResponse.json({ error: 'falha_ao_salvar_feedback' }, { status: 500 })
  }
}

// Sobe/desce a variação de todos os exercícios em `delta`, com upsert dos
// que ainda não têm linha (partem da entrada da semana).
async function ajustarVariacoes(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  delta: number,
  semana: number,
) {
  const admin = (await import('@/lib/supabase/admin')).createAdminClient()
  const { data: allEx } = await admin.from('exercises').select('id')
  const entrada = nivelEntradaSemana(semana)
  const { data: existentes } = await supabase
    .from('user_exercise_variations')
    .select('exercise_id, variacao_nivel')
    .eq('user_id', userId)
  const mapa = new Map((existentes ?? []).map((r) => [r.exercise_id as string, r.variacao_nivel as number]))

  const rows = (allEx ?? []).map((e) => {
    const atual = clampNivel(Math.min(mapa.get(e.id as string) ?? entrada, semana))
    const novo = Math.min(semana, Math.max(1, atual + delta))
    return { user_id: userId, exercise_id: e.id as string, variacao_nivel: novo, atualizado_em: new Date().toISOString() }
  })
  if (rows.length) {
    await supabase.from('user_exercise_variations').upsert(rows, { onConflict: 'user_id,exercise_id' })
  }
}
