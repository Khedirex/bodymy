'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VideoBox } from '@/components/circuito/VideoBox'
import { InstrucoesExercicio } from '@/components/circuito/InstrucoesExercicio'
import {
  INTENSIDADES,
  direcaoPorIntensidade,
  proporAjuste,
  formatarDescanso,
  clampSeries,
  clampDescanso,
  SERIES_MIN,
  SERIES_MAX,
  DESCANSO_MIN,
  DESCANSO_MAX,
  type PropostaAjuste,
} from '@/lib/training'
import type { EixoDificuldade, SessionExerciseStatus } from '@/types/db'

export interface PlanExercicioUI {
  exercise_id: string
  nome: string
  descricao: string | null
  instrucoes: string | null
  nivel: number
  videoId: string | null
  podeFacilitar: boolean
}

interface Props {
  semana: number
  dia: number
  series: number
  descanso_seg: number
  exercicios: PlanExercicioUI[]
  aguardandoDesde?: number // semana concluída aguardando liberação (0 = não)
}

type Fase = 'exercicios' | 'feedback' | 'oferta' | 'ajustando' | 'fim'

const EIXOS: { valor: EixoDificuldade; label: string }[] = [
  { valor: 'descanso', label: 'Tempo de descanso' },
  { valor: 'exercicio', label: 'Dificuldade do exercício' },
  { valor: 'series', label: 'Quantidade de séries' },
]

export function CircuitoSession({ semana, dia, series, descanso_seg, exercicios, aguardandoDesde = 0 }: Props) {
  const router = useRouter()
  const [exs, setExs] = useState(exercicios)
  const [fase, setFase] = useState<Fase>('exercicios')
  const [idx, setIdx] = useState(0)
  const [statuses, setStatuses] = useState<Record<string, SessionExerciseStatus>>({})
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  // Preenchido pela resposta da sessão: concluiu a semana mas a próxima está
  // bloqueada (aguardando o Willian liberar os vídeos).
  const [aguardandoAposSessao, setAguardandoAposSessao] = useState(0)

  // feedback
  const [comentario, setComentario] = useState('')
  const [eixo, setEixo] = useState<EixoDificuldade | null>(null)
  const [intensidade, setIntensidade] = useState<number | null>(null)
  const [proposta, setProposta] = useState<PropostaAjuste | null>(null)
  const [manualSeries, setManualSeries] = useState(series)
  const [manualDescanso, setManualDescanso] = useState(descanso_seg)

  const ex = exs[idx]
  const completou = exs.every((e) => statuses[e.exercise_id] === 'fez')

  // ---- Fase: exercícios ---------------------------------------------
  async function facilitar() {
    try {
      const res = await fetch('/api/circuito/variation', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ exercise_id: ex.exercise_id, direcao: 'facilitar' }),
      })
      const d = await res.json()
      if (res.ok && !d.semLimite) {
        setExs((prev) =>
          prev.map((e, i) =>
            i === idx
              ? { ...e, nivel: d.nivel, videoId: d.variation?.panda_video_id ?? null, podeFacilitar: d.podeFacilitar }
              : e,
          ),
        )
      }
    } catch {
      /* silencioso: manter a variação atual */
    }
  }

  function registrar(status: SessionExerciseStatus) {
    const novo = { ...statuses, [ex.exercise_id]: status }
    setStatuses(novo)
    if (idx < exs.length - 1) {
      setIdx(idx + 1)
    } else {
      finalizarExercicios(novo)
    }
  }

  async function finalizarExercicios(finais: Record<string, SessionExerciseStatus>) {
    setErro(null)
    try {
      const res = await fetch('/api/circuito/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          exercicios: exs.map((e) => ({
            exercise_id: e.exercise_id,
            variacao_nivel: e.nivel,
            status: finais[e.exercise_id] ?? 'pulou',
          })),
        }),
      })
      const d = await res.json()
      if (!res.ok) {
        setErro('Não conseguimos salvar a sessão. Tente novamente.')
        return
      }
      setSessionId(d.session_id)
      if (d.aguardandoLiberacao > 0) setAguardandoAposSessao(d.semanaConcluida ?? d.aguardandoLiberacao - 1)
      setFase('feedback')
    } catch {
      setErro('Sem conexão. Tente novamente.')
    }
  }

  // ---- Fase: feedback -> oferta -------------------------------------
  function continuarFeedback() {
    if (!eixo || !intensidade) return
    const direcao = direcaoPorIntensidade(intensidade)
    const niveis = exs.map((e) => e.nivel)
    const p = proporAjuste({
      series,
      descanso_seg,
      semana,
      eixo,
      direcao,
      variacaoMin: Math.min(...niveis),
      variacaoMax: Math.max(...niveis),
    })
    setProposta(p)
    setFase('oferta')
  }

  async function enviarFeedback(aceito: boolean, manual?: { series: number; descanso_seg: number }) {
    setFase('ajustando')
    try {
      await fetch('/api/circuito/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          comentario,
          eixo_dificuldade: eixo,
          intensidade_percebida: intensidade,
          aceito,
          manual,
        }),
      })
    } catch {
      /* mesmo com falha de rede, seguimos para o fechamento */
    }
    router.refresh()
    // pequena espera para dar "peso" ao ajuste
    setTimeout(() => setFase('fim'), aceito ? 1100 : 250)
  }

  // =====================================================================
  if (fase === 'ajustando') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-coral-200 border-t-coral-500" />
        <p className="text-lg font-bold text-ink-900">Ajustando seu treino…</p>
        <p className="text-sm text-ink-700">Deixando tudo do jeitinho certo para você.</p>
      </div>
    )
  }

  if (fase === 'fim') {
    return (
      <div className="space-y-5 text-center">
        <div className="text-5xl" aria-hidden>{aguardandoAposSessao > 0 ? '🌱' : completou ? '🎉' : '💛'}</div>
        {aguardandoAposSessao > 0 ? (
          <>
            <h1 className="text-2xl font-extrabold text-ink-900">
              Você completou a semana {aguardandoAposSessao}!
            </h1>
            <p className="rounded-2xl bg-sage-100 px-4 py-3 text-ink-800">
              Continue praticando enquanto preparamos os próximos movimentos para você. Cada dia
              que você repete conta — sua constância não para.
            </p>
          </>
        ) : completou ? (
          <>
            <h1 className="text-2xl font-extrabold text-ink-900">Você fez o circuito de hoje!</h1>
            <p className="text-ink-700">Chegar já é a vitória. Seu corpo agradece cada movimento.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-extrabold text-ink-900">Obrigada por aparecer hoje</h1>
            <p className="rounded-2xl bg-cream-100 px-4 py-3 text-ink-800">
              Hoje você não completou o circuito. É importante que faça o circuito completo da
              próxima vez — seu corpo aproveita mais quando a sequência é inteira.
            </p>
          </>
        )}
        <button className="btn-primary w-full" onClick={() => { router.push('/'); router.refresh() }}>
          Voltar ao início
        </button>
      </div>
    )
  }

  if (fase === 'oferta' && proposta) {
    return (
      <OfertaAjuste
        proposta={proposta}
        series={series}
        descanso_seg={descanso_seg}
        manualSeries={manualSeries}
        manualDescanso={manualDescanso}
        setManualSeries={setManualSeries}
        setManualDescanso={setManualDescanso}
        onAceitar={() => enviarFeedback(true)}
        onRecusar={() => enviarFeedback(false)}
        onManual={() => enviarFeedback(true, { series: clampSeries(manualSeries), descanso_seg: clampDescanso(manualDescanso) })}
        onNeutro={() => enviarFeedback(false)}
      />
    )
  }

  if (fase === 'feedback') {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold text-ink-900">Como foi hoje?</h1>
          <p className="mt-1 text-ink-700">Sua resposta ajusta o treino para você. Leva 30 segundos.</p>
        </header>

        <div>
          <label className="mb-1 block font-semibold text-ink-900">
            Quer deixar um recado? <span className="font-normal text-ink-700">(opcional)</span>
          </label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            placeholder="Como você se sentiu, alguma dúvida…"
            className="w-full rounded-2xl border-2 border-cream-200 px-4 py-3 text-ink-800"
          />
        </div>

        <div>
          <p className="mb-2 font-semibold text-ink-900">O que você mais sentiu dificuldade hoje?</p>
          <div className="space-y-2">
            {EIXOS.map((o) => (
              <button
                key={o.valor}
                onClick={() => setEixo(o.valor)}
                className={`w-full rounded-2xl border-2 px-4 py-3 text-left font-semibold transition ${
                  eixo === o.valor ? 'border-coral-400 bg-coral-50 text-coral-700' : 'border-cream-200 bg-white text-ink-800'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 font-semibold text-ink-900">Como foi a intensidade do treino?</p>
          <div className="grid grid-cols-2 gap-2">
            {INTENSIDADES.map((o) => (
              <button
                key={o.valor}
                onClick={() => setIntensidade(o.valor)}
                className={`rounded-2xl border-2 px-3 py-3 text-sm font-semibold transition ${
                  intensidade === o.valor ? 'border-coral-400 bg-coral-50 text-coral-700' : 'border-cream-200 bg-white text-ink-800'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {erro ? <p className="text-sm font-medium text-coral-700">{erro}</p> : null}
        <button className="btn-primary w-full" disabled={!eixo || !intensidade} onClick={continuarFeedback}>
          Continuar
        </button>
      </div>
    )
  }

  // ---- Fase: exercícios (default) -----------------------------------
  return (
    <div className="space-y-5">
      {aguardandoDesde > 0 ? (
        <div className="rounded-2xl bg-sage-100 px-4 py-3 text-sm text-ink-800">
          🌱 Você concluiu a semana {aguardandoDesde}. Continue praticando enquanto preparamos os
          próximos movimentos — cada dia conta para a sua constância.
        </div>
      ) : null}
      <header>
        <span className="chip">Semana {semana} · Dia {dia}</span>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-ink-900">{ex.nome}</h1>
          <span className="text-sm font-semibold text-ink-700">{idx + 1} de {exs.length}</span>
        </div>
      </header>

      {/* barra de progresso dos 5 exercícios */}
      <div className="flex gap-1.5">
        {exs.map((e, i) => (
          <div
            key={e.exercise_id}
            className={`h-1.5 flex-1 rounded-full ${
              statuses[e.exercise_id] ? 'bg-coral-400' : i === idx ? 'bg-coral-200' : 'bg-cream-200'
            }`}
          />
        ))}
      </div>

      <VideoBox videoId={ex.videoId} />

      <div className="card">
        <div className="flex flex-wrap gap-3 text-sm font-semibold text-ink-800">
          <span className="rounded-full bg-sage-100 px-3 py-1 text-sage-600">{series} séries</span>
          <span className="rounded-full bg-cream-200 px-3 py-1">{formatarDescanso(descanso_seg)} de descanso</span>
          <span className="rounded-full bg-cream-200 px-3 py-1">variação v{ex.nivel}</span>
        </div>
        {ex.instrucoes ? (
          <div className="mt-3">
            <InstrucoesExercicio texto={ex.instrucoes} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink-700">
            As instruções em texto deste movimento estão sendo preparadas. Siga pelo vídeo quando
            estiver disponível.
          </p>
        )}
      </div>

      {ex.podeFacilitar ? (
        <button
          onClick={facilitar}
          className="w-full rounded-2xl border-2 border-cream-200 bg-white px-4 py-3 text-sm font-semibold text-ink-800"
        >
          Está difícil? Faça a variação anterior
        </button>
      ) : null}

      {erro ? <p className="text-sm font-medium text-coral-700">{erro}</p> : null}

      <div className="space-y-2">
        <button className="btn-primary w-full text-lg" onClick={() => registrar('fez')}>
          Fiz ✓
        </button>
        <button
          className="w-full rounded-2xl border-2 border-cream-200 bg-white px-4 py-3 font-semibold text-ink-800"
          onClick={() => registrar('nao_conseguiu')}
        >
          Não consegui
        </button>
        <button
          className="w-full px-4 py-2 text-sm font-semibold text-ink-700"
          onClick={() => registrar('pulou')}
        >
          Quero pular
        </button>
      </div>
    </div>
  )
}

// Tela de oferta do ajuste, conforme a proposta.
function OfertaAjuste({
  proposta,
  series,
  descanso_seg,
  manualSeries,
  manualDescanso,
  setManualSeries,
  setManualDescanso,
  onAceitar,
  onRecusar,
  onManual,
  onNeutro,
}: {
  proposta: PropostaAjuste
  series: number
  descanso_seg: number
  manualSeries: number
  manualDescanso: number
  setManualSeries: (n: number) => void
  setManualDescanso: (n: number) => void
  onAceitar: () => void
  onRecusar: () => void
  onManual: () => void
  onNeutro: () => void
}) {
  if (proposta.tipo === 'neutro') {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl" aria-hidden>🎯</div>
        <h1 className="text-2xl font-extrabold text-ink-900">Ponto certo!</h1>
        <p className="text-ink-700">{proposta.mensagem}</p>
        <button className="btn-primary w-full" onClick={onNeutro}>Finalizar</button>
      </div>
    )
  }

  if (proposta.tipo === 'manual') {
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-2xl font-extrabold text-ink-900">Vamos ajustar do seu jeito</h1>
          <p className="mt-2 rounded-2xl bg-gold-300/20 px-4 py-3 text-sm text-ink-800">{proposta.aviso}</p>
        </header>
        <div className="space-y-4">
          <StepperField
            label="Séries"
            valor={manualSeries}
            min={SERIES_MIN}
            max={SERIES_MAX}
            passo={1}
            onChange={setManualSeries}
            formato={(n) => `${n}`}
          />
          <StepperField
            label="Descanso entre séries"
            valor={manualDescanso}
            min={DESCANSO_MIN}
            max={DESCANSO_MAX}
            passo={5}
            onChange={setManualDescanso}
            formato={(n) => formatarDescanso(n)}
          />
        </div>
        <button className="btn-primary w-full" onClick={onManual}>Salvar meu ajuste</button>
        <button className="w-full px-4 py-2 text-sm font-semibold text-ink-700" onClick={onRecusar}>
          Deixar como está
        </button>
      </div>
    )
  }

  // proposta.tipo === 'ajuste'
  const subir = proposta.eixo && ['series', 'descanso', 'exercicio'].includes(proposta.eixo)
  return (
    <div className="space-y-6 text-center">
      <div className="text-5xl" aria-hidden>{subir ? '💪' : '🌿'}</div>
      <h1 className="text-2xl font-extrabold text-ink-900">Quer ajustar?</h1>
      <p className="text-ink-700">{proposta.descricao}</p>
      <div className="space-y-2">
        <button className="btn-primary w-full" onClick={onAceitar}>Sim, ajustar</button>
        <button className="w-full px-4 py-2 text-sm font-semibold text-ink-700" onClick={onRecusar}>
          Não, manter assim
        </button>
      </div>
    </div>
  )
}

function StepperField({
  label,
  valor,
  min,
  max,
  passo,
  onChange,
  formato,
}: {
  label: string
  valor: number
  min: number
  max: number
  passo: number
  onChange: (n: number) => void
  formato: (n: number) => string
}) {
  return (
    <div className="rounded-2xl border-2 border-cream-200 bg-white p-4">
      <p className="mb-2 font-semibold text-ink-900">{label}</p>
      <div className="flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(min, valor - passo))}
          disabled={valor <= min}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-2xl font-bold text-ink-800 disabled:opacity-40"
        >
          −
        </button>
        <span className="text-xl font-extrabold text-ink-900">{formato(valor)}</span>
        <button
          onClick={() => onChange(Math.min(max, valor + passo))}
          disabled={valor >= max}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-cream-200 text-2xl font-bold text-ink-800 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
