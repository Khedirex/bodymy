'use client'

import { useState } from 'react'
import { ALONGAMENTO_SEG } from '@/lib/training'
import { CheckIcon, LockIcon, PlayIcon } from '@/components/ui/icons'
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

// Agenda do dia, desenhada para leitura fácil (público 60+):
// texto grande, alvos de toque altos, pouca borda e um passo evidente por vez.
// O alongamento é a primeira linha e vem MINIMIZADO — expande só se ela quiser
// ver a lista. Os exercícios destravam um a um.
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
  const [aberto, setAberto] = useState(false)

  const proximo = exercicios.findIndex((e) => !concluidos[e.exercise_id])
  const feitos = exercicios.filter((e) => concluidos[e.exercise_id]).length

  // Duração total do bloco (bilaterais contam os dois lados).
  const segundos = stretches.reduce(
    (t, s) => t + (s.duracao_seg ?? ALONGAMENTO_SEG) * (s.lados > 1 ? s.lados : 1),
    0,
  )
  const minutos = Math.max(1, Math.round(segundos / 60))

  return (
    <div className="space-y-5">
      <header>
        <span className="chip">
          Semana {semana} · Día {dia}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
          Tus movimientos de hoy
        </h1>
        <p className="mt-1 text-base text-ink-700">
          {exercicios.length === 0
            ? 'En un momento aparece aquí tu plan.'
            : feitos === 0
              ? 'Haz un paso a la vez. El siguiente se abre al terminar.'
              : `Llevas ${feitos} de ${exercicios.length} ejercicios.`}
        </p>
      </header>

      {/* Alongamento — primeira linha, minimizada. Some se não houver
          alongamentos cadastrados (melhor nada do que uma barra que abre vazia). */}
      {stretches.length > 0 && (
      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <button
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          className="flex min-h-[76px] w-full items-center gap-4 px-5 py-4 text-left"
        >
          <span
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl ${
              alongou ? 'bg-sage-100 text-sage-600' : 'bg-coral-50'
            }`}
          >
            {alongou ? <CheckIcon width={26} height={26} /> : '🌿'}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold text-ink-900">Estiramiento</span>
            <span className="block text-base text-ink-700">
              {alongou ? 'Hecho' : `${stretches.length} movimientos · ${minutos} min`}
            </span>
          </span>
          <span aria-hidden className="text-2xl font-light text-ink-700/40">
            {aberto ? '−' : '+'}
          </span>
        </button>

        {aberto && (
          <div className="px-5 pb-5">
            <ol className="mb-4 space-y-2.5 border-t border-cream-200 pt-4">
              {stretches.map((s, i) => (
                <li key={s.id} className="flex items-baseline gap-3 text-base">
                  <span className="w-6 shrink-0 font-bold text-ink-700/40">{i + 1}</span>
                  <span className="flex-1 text-ink-900">{s.nome}</span>
                </li>
              ))}
            </ol>
            <button onClick={onAbrirAlongamento} className="btn-primary w-full py-4 text-lg">
              <PlayIcon width={22} height={22} />
              {alongou ? 'Hacerlo otra vez' : 'Empezar'}
            </button>
          </div>
        )}
      </section>
      )}

      {/* Exercícios */}
      <section className="space-y-3">
        {exercicios.length === 0 && (
          <div className="rounded-3xl bg-white p-6 text-center shadow-card">
            <p className="text-5xl">🗓️</p>
            <p className="mt-3 text-xl font-extrabold text-ink-900">
              Tus ejercicios de hoy aún se están preparando
            </p>
            <p className="mt-2 text-base text-ink-700">
              Vuelve en un momento. Si sigue así mañana, escríbenos y lo resolvemos.
            </p>
          </div>
        )}
        {exercicios.map((e, i) => {
          const status = concluidos[e.exercise_id]

          if (status) {
            return (
              <div
                key={e.exercise_id}
                className="flex min-h-[72px] items-center gap-4 rounded-3xl bg-sage-100/50 px-5 py-4"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
                  <CheckIcon width={26} height={26} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-ink-900">Ejercicio {i + 1}</span>
                  <span className="block text-base text-ink-700">
                    {status === 'fez' ? 'Hecho' : status === 'nao_conseguiu' ? 'No pudiste' : 'Saltado'}
                  </span>
                </span>
              </div>
            )
          }

          if (i === proximo) {
            return (
              <div key={e.exercise_id} className="rounded-3xl bg-white p-5 shadow-card">
                <p className="text-base font-semibold text-coral-600">Ahora · Ejercicio {i + 1}</p>
                <p className="mt-1 text-xl font-extrabold leading-tight text-ink-900">{e.nome}</p>
                <button
                  onClick={() => onAbrirExercicio(i)}
                  className="btn-primary mt-4 w-full py-4 text-lg"
                >
                  <PlayIcon width={22} height={22} /> Empezar
                </button>
              </div>
            )
          }

          return (
            <div
              key={e.exercise_id}
              aria-disabled
              className="flex min-h-[72px] items-center gap-4 rounded-3xl bg-cream-100 px-5 py-4"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cream-200 text-ink-700/40">
                <LockIcon width={24} height={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-ink-700/60">Ejercicio {i + 1}</span>
                <span className="block text-base text-ink-700/50">Se abre después</span>
              </span>
            </div>
          )
        })}
      </section>
    </div>
  )
}
