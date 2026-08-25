'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { InstallInstructions } from '@/components/pwa/InstallInstructions'
import { analytics } from '@/lib/analytics'
import { FAIXAS } from '@/lib/training'
import type { FaixaEtaria } from '@/types/db'

export function Onboarding({
  nome,
  programaNome,
}: {
  nome: string | null
  programaNome: string
}) {
  const router = useRouter()
  const [passo, setPasso] = useState<1 | 2 | 3>(1)
  const [faixa, setFaixa] = useState<FaixaEtaria | null>(null)
  const [pending, startTransition] = useTransition()
  const primeiroNome = (nome ?? '').split(' ')[0] || 'Bienvenida'

  const [erro, setErro] = useState<string | null>(null)

  function finalizar() {
    if (!faixa) return
    setErro(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ faixa_etaria: faixa }),
        })
        if (!res.ok) {
          setErro('No pudimos guardar ahora. Intenta de nuevo.')
          return
        }
        analytics.onboardingCompleted()
        router.replace('/')
        router.refresh()
      } catch {
        setErro('Sin conexión. Intenta de nuevo.')
      }
    })
  }

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 py-8">
      {/* Progresso */}
      <div className="mb-8 flex gap-1.5">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={`h-1.5 flex-1 rounded-full ${
              n <= passo ? 'bg-coral-400' : 'bg-cream-200'
            }`}
          />
        ))}
      </div>

      {passo === 1 && (
        <section className="flex flex-1 flex-col animate-fade-up">
          <div className="mb-4 text-5xl" aria-hidden>
            🎉
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-ink-900">
            ¡Bienvenida, {primeiroNome}!
          </h1>
          <p className="mt-3 text-lg text-ink-700">
            Tu programa está listo:
          </p>
          <p className="mt-1 text-xl font-bold text-coral-600">{programaNome}</p>
          <p className="mt-4 text-ink-700">
            Vamos a dejar todo a la medida de tu rutina. Toma menos de un minuto.
          </p>
          <div className="mt-auto pt-8">
            <button className="btn-primary w-full" onClick={() => setPasso(2)}>
              Empezar
            </button>
          </div>
        </section>
      )}

      {passo === 2 && (
        <section className="flex flex-1 flex-col animate-fade-up">
          <h2 className="text-2xl font-extrabold text-ink-900">
            ¿Cuál es tu rango de edad?
          </h2>
          <p className="mt-2 text-ink-700">
            Usamos esto solo para empezar en el punto justo para ti — un ritmo seguro y
            cómodo. El entrenamiento se ajusta según lo que sientas.
          </p>
          <div className="mt-6 space-y-3">
            {FAIXAS.map((o) => (
              <button
                key={o.valor}
                onClick={() => setFaixa(o.valor)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition ${
                  faixa === o.valor
                    ? 'border-coral-400 bg-coral-50 text-coral-700'
                    : 'border-cream-200 bg-white text-ink-800'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="mt-auto pt-8">
            <button
              className="btn-primary w-full"
              disabled={!faixa}
              onClick={() => setPasso(3)}
            >
              Continuar
            </button>
          </div>
        </section>
      )}

      {passo === 3 && (
        <section className="flex flex-1 flex-col animate-fade-up">
          <h2 className="text-2xl font-extrabold text-ink-900">
            Deja BodyMy a un toque de distancia
          </h2>
          <p className="mt-2 text-ink-700">
            Agrega BodyMy a la pantalla de tu celular para abrirlo como una app, con un
            toque — sin necesidad del navegador.
          </p>
          <div className="mt-6">
            <InstallInstructions />
          </div>
          <div className="mt-auto pt-8">
            {erro ? (
              <p className="mb-3 rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">
                {erro}
              </p>
            ) : null}
            <button
              className="btn-primary w-full"
              onClick={finalizar}
              disabled={pending}
            >
              {pending ? 'Preparando…' : 'Ir a mi programa'}
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
