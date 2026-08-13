'use client'

import { useState } from 'react'
import { CircuitoSession, type PlanExercicioUI } from '@/components/circuito/CircuitoSession'
import { BlocoMobilidade } from '@/components/circuito/BlocoMobilidade'
import { criarSinalizador } from '@/components/circuito/sinais'
import type { Stretch } from '@/types/db'

interface Props {
  semana: number
  dia: number
  series: number
  descanso_seg: number
  tempoExecSeg: number
  exercicios: PlanExercicioUI[]
  aguardandoDesde?: number
  stretches: Stretch[]
}

type Etapa = 'escolha' | 'aviso' | 'mobilidade' | 'circuito'

// Fluxo do treino do dia: escolha (alongar ou ir direto) → bloco de mobilidade
// (opcional) → circuito. O sinalizador de áudio é criado aqui e compartilhado,
// desbloqueado no primeiro toque (exigência de gesto no mobile).
export function TreinoFluxo({ stretches, ...circuito }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('escolha')
  const [alongou, setAlongou] = useState(false)
  // criarSinalizador() não acessa window na criação (lazy) → seguro no SSR.
  const [sinalizador] = useState(() => criarSinalizador())

  function alongar() {
    sinalizador.desbloquear()
    setAlongou(true)
    setEtapa('mobilidade')
  }
  function irDireto() {
    sinalizador.desbloquear()
    setAlongou(false)
    setEtapa('circuito')
  }

  if (etapa === 'circuito') {
    return <CircuitoSession {...circuito} alongou={alongou} sinalizador={sinalizador} />
  }

  if (etapa === 'mobilidade') {
    return (
      <div className="space-y-4">
        <header>
          <span className="chip">Bloco de mobilidade</span>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">Prepare seu corpo</h1>
          <p className="mt-1 text-ink-700">Sequência contínua — deixe o cronômetro te guiar, não precisa tocar na tela.</p>
        </header>
        <BlocoMobilidade
          stretches={stretches}
          sinalizador={sinalizador}
          onConcluir={() => setEtapa('circuito')}
          onSair={() => setEtapa('circuito')}
        />
      </div>
    )
  }

  // etapa 'escolha' ou 'aviso'
  return (
    <div className="space-y-5">
      <header>
        <span className="chip">Semana {circuito.semana} · Dia {circuito.dia}</span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">Seu treino de hoje</h1>
        <p className="mt-1 text-ink-700">Comece pelo alongamento para preparar o corpo, ou vá direto para os exercícios.</p>
      </header>

      {etapa === 'aviso' ? (
        <div className="card space-y-4 border-2 border-gold-300/60 bg-gold-300/10">
          <p className="font-semibold text-ink-900">
            Alongar antes prepara suas articulações e reduz o risco de lesão. Recomendamos fazer o bloco de
            mobilidade antes de começar.
          </p>
          <div className="space-y-2">
            <button className="btn-primary w-full text-lg" onClick={alongar}>
              Vou alongar
            </button>
            <button
              className="w-full rounded-2xl px-4 py-3 text-sm font-semibold text-ink-700"
              onClick={irDireto}
            >
              Entendi, ir para os exercícios
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button className="btn-primary w-full text-lg" onClick={alongar}>
            🌿 Fazer o alongamento
          </button>
          <button className="btn-secondary w-full" onClick={() => setEtapa('aviso')}>
            Ir direto para os exercícios
          </button>
        </div>
      )}
    </div>
  )
}
