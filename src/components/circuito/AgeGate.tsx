'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FAIXAS } from '@/lib/training'
import type { FaixaEtaria } from '@/types/db'

// Coleta a faixa etária de alunas que já tinham conta antes do circuito.
// Define o ponto de partida (séries/descanso). Aparece uma única vez.
export function AgeGate() {
  const router = useRouter()
  const [faixa, setFaixa] = useState<FaixaEtaria | null>(null)
  const [pending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function salvar() {
    if (!faixa) return
    setErro(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/circuito/config', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ faixa_etaria: faixa }),
        })
        if (!res.ok) {
          setErro('No pudimos guardar ahora. Inténtalo de nuevo.')
          return
        }
        router.refresh()
      } catch {
        setErro('Sin conexión. Inténtalo de nuevo.')
      }
    })
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Tu entrenamiento, a tu manera</h1>
        <p className="mt-2 text-ink-700">
          Antes de empezar, cuéntame tu rango de edad. Lo usamos solo para empezar en un ritmo
          seguro y cómodo — después el entrenamiento se ajusta a lo que sientas.
        </p>
      </header>
      <div className="space-y-3">
        {FAIXAS.map((o) => (
          <button
            key={o.valor}
            onClick={() => setFaixa(o.valor)}
            className={`flex w-full items-center rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition ${
              faixa === o.valor
                ? 'border-coral-400 bg-coral-50 text-coral-700'
                : 'border-cream-200 bg-white text-ink-800'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {erro ? (
        <p className="rounded-2xl bg-coral-50 px-4 py-3 text-sm font-medium text-coral-700">{erro}</p>
      ) : null}
      <button className="btn-primary w-full" disabled={!faixa || pending} onClick={salvar}>
        {pending ? 'Preparando…' : 'Empezar'}
      </button>
    </div>
  )
}
