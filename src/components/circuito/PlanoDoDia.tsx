'use client'

import { useState } from 'react'
import { ALONGAMENTO_SEG } from '@/lib/training'
import { CheckIcon, LockIcon, PlayIcon, ChevronRight } from '@/components/ui/icons'
import type { Stretch, SessionExerciseStatus } from '@/types/db'
import type { PlanExercicioUI } from '@/components/circuito/CircuitoSession'

interface Props {
  semana: number
  dia: number
  stretches: Stretch[]
  exercicios: PlanExercicioUI[]
  /** Exercícios já concluídos nesta sessão (id → status). */
  concluidos: Record<string, SessionExerciseStatus>
  alongou: boolean
  onAbrirAlongamento: () => void
  /** Abre o exercício da posição informada. */
  onAbrirExercicio: (indice: number) => void
}

// Agenda do dia: o bloco de alongamento é a primeira barra (expansível) e
// abaixo vêm os exercícios em ordem. Só o primeiro não concluído fica
// disponível — os seguintes destravam conforme ela avança.
export function PlanoDoDia({
  semana,
  dia,
  stretches,
  exercicios,
  concluidos,
  alongou,
  onAbrirAlongamento,
  onAbrirExercicio,
}: Props) {
  const [aberto, setAberto] = useState(true)

  // Posição do próximo exercício disponível (o primeiro sem status).
  const proximo = exercicios.findIndex((e) => !concluidos[e.exercise_id])
  const totalFeitos = exercicios.filter((e) => concluidos[e.exercise_id]).length

  return (
    <div className="space-y-4">
      <header>
        <span className="chip">
          Semana {semana} · Día {dia}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
          Tus movimientos de hoy
        </h1>
        <p className="mt-1 text-ink-700">
          {totalFeitos === 0
            ? 'Empieza por el estiramiento y sigue en orden.'
            : `Llevas ${totalFeitos} de ${exercicios.length} ejercicios.`}
        </p>
      </header>

      {/* 1) Barra do alongamento — expansível, sempre a primeira */}
      <section className="overflow-hidden rounded-3xl border border-cream-200 bg-white">
        <button
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg ${
              alongou ? 'bg-sage-100 text-sage-600' : 'bg-coral-50 text-coral-500'
            }`}
          >
            {alongou ? <CheckIcon width={20} height={20} /> : '🌿'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-ink-900">Estiramiento</span>
            <span className="block text-sm text-ink-700">
              {alongou
                ? 'Hecho ✓'
                : `${stretches.length} movimientos · recomendado antes de empezar`}
            </span>
          </span>
          <span className="text-ink-700/40">{aberto ? '−' : '+'}</span>
        </button>

        {aberto && (
          <div className="border-t border-cream-200 px-4 py-3">
            <ol className="mb-3 space-y-1.5">
              {stretches.map((s, i) => (
                <li key={s.id} className="flex items-baseline gap-2 text-sm">
                  <span className="w-5 shrink-0 font-semibold text-ink-700/40">{i + 1}.</span>
                  <span className="flex-1 text-ink-900">{s.nome}</span>
                  <span className="shrink-0 text-xs text-ink-700/60">
                    {(s.duracao_seg ?? ALONGAMENTO_SEG) * (s.lados > 1 ? s.lados : 1)}s
                  </span>
                </li>
              ))}
            </ol>
            <button onClick={onAbrirAlongamento} className="btn-primary w-full">
              <PlayIcon width={18} height={18} />
              {alongou ? 'Hacerlo de nuevo' : 'Empezar estiramiento'}
            </button>
          </div>
        )}
      </section>

      {/* 2) Exercícios em ordem, com trava sequencial */}
      <section className="space-y-2">
        <h2 className="section-title">Ejercicios</h2>
        {exercicios.map((e, i) => {
          const status = concluidos[e.exercise_id]
          const disponivel = i === proximo
          const bloqueado = !status && !disponivel

          if (status) {
            return (
              <div
                key={e.exercise_id}
                className="flex items-center gap-3 rounded-2xl bg-sage-100/60 px-4 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                  <CheckIcon width={18} height={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink-900">{e.nome}</span>
                  <span className="block text-xs text-ink-700">
                    {status === 'fez' ? 'Hecho' : status === 'nao_conseguiu' ? 'No pudiste' : 'Saltado'}
                  </span>
                </span>
              </div>
            )
          }

          if (disponivel) {
            return (
              <button
                key={e.exercise_id}
                onClick={() => onAbrirExercicio(i)}
                className="card flex w-full items-center gap-3 border-2 border-coral-400 text-left transition active:scale-[0.99]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-coral-500 text-white">
                  <PlayIcon width={20} height={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-ink-900">{e.nome}</span>
                  <span className="block text-sm text-ink-700">
                    Ejercicio {i + 1} de {exercicios.length} · empezar ahora
                  </span>
                </span>
                <ChevronRight className="shrink-0 text-coral-500" width={20} height={20} />
              </button>
            )
          }

          return (
            <div
              key={e.exercise_id}
              aria-disabled
              className="flex items-center gap-3 rounded-2xl bg-cream-100 px-4 py-3 opacity-70"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-700/40">
                <LockIcon width={18} height={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink-700/60">{e.nome}</span>
                <span className="block text-xs text-ink-700/50">
                  Se abre al terminar el anterior
                </span>
              </span>
            </div>
          )
        })}
      </section>
    </div>
  )
}
