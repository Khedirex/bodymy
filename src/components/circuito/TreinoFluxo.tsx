'use client'

import { useState } from 'react'
import { CircuitoSession, type PlanExercicioUI } from '@/components/circuito/CircuitoSession'
import { BlocoMobilidade } from '@/components/circuito/BlocoMobilidade'
import { PlanoDoDia } from '@/components/circuito/PlanoDoDia'
import { criarSinalizador } from '@/components/circuito/sinais'
import type { Stretch, SessionExerciseStatus } from '@/types/db'

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

type Etapa = 'plano' | 'mobilidade' | 'circuito'

// Fluxo do treino do dia. A entrada é a AGENDA (PlanoDoDia): alongamento como
// primeira barra expansível e os exercícios em ordem, destravando um a um.
// Cada item abre sua tela e devolve o controle para a agenda; o último
// exercício fecha a sessão (grava tudo e segue para o feedback).
//
// O sinalizador de áudio é criado aqui e compartilhado — precisa ser
// desbloqueado por um gesto da aluna (exigência dos navegadores móveis).
export function TreinoFluxo({ stretches, exercicios: exerciciosIniciais, ...circuito }: Props) {
  const [etapa, setEtapa] = useState<Etapa>('plano')
  // A lista vive aqui: a CircuitoSession desmonta a cada volta para a agenda.
  const [exercicios, setExercicios] = useState(exerciciosIniciais)
  const [alongou, setAlongou] = useState(false)
  const [concluidos, setConcluidos] = useState<Record<string, SessionExerciseStatus>>({})
  const [indiceAtivo, setIndiceAtivo] = useState(0)
  const [sinalizador] = useState(() => criarSinalizador())

  function abrirAlongamento() {
    sinalizador.desbloquear()
    setEtapa('mobilidade')
  }

  function abrirExercicio(indice: number) {
    sinalizador.desbloquear()
    setIndiceAtivo(indice)
    setEtapa('circuito')
  }

  if (etapa === 'mobilidade') {
    const voltar = (fez: boolean) => {
      if (fez) setAlongou(true)
      setEtapa('plano')
    }
    return (
      <div className="space-y-4">
        <header>
          <span className="chip">Bloque de movilidad</span>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
            Prepara tu cuerpo
          </h1>
          <p className="mt-1 text-ink-700">
            Secuencia continua — deja que el cronómetro te guíe, no necesitas tocar la pantalla.
          </p>
        </header>
        <BlocoMobilidade
          stretches={stretches}
          sinalizador={sinalizador}
          onConcluir={() => voltar(true)}
          onSair={() => voltar(false)}
        />
      </div>
    )
  }

  if (etapa === 'circuito') {
    return (
      <CircuitoSession
        {...circuito}
        exercicios={exercicios}
        alongou={alongou}
        sinalizador={sinalizador}
        indiceInicial={indiceAtivo}
        statusesIniciais={concluidos}
        umPorVez
        onExercicioConcluido={(exerciseId, status) => {
          setConcluidos((prev) => ({ ...prev, [exerciseId]: status }))
          setEtapa('plano')
        }}
        onExerciciosAlterados={setExercicios}
      />
    )
  }

  return (
    <PlanoDoDia
      semana={circuito.semana}
      dia={circuito.dia}
      stretches={stretches}
      exercicios={exercicios}
      concluidos={concluidos}
      alongou={alongou}
      onAbrirAlongamento={abrirAlongamento}
      onAbrirExercicio={abrirExercicio}
    />
  )
}
