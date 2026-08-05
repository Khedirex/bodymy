'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from '@/components/ui/icons'
import type { DietDay } from '@/types/db'

const REFEICAO_EMOJI: Record<string, string> = {
  cafe: '☕',
  almoco: '🍽️',
  lanche: '🍎',
  jantar: '🌙',
}
const ORDEM: (keyof DietDay['refeicoes'])[] = ['cafe', 'almoco', 'lanche', 'jantar']

// Cardápio com navegação entre dias.
export function DietMenu({ days, diaInicial }: { days: DietDay[]; diaInicial: number }) {
  const [idx, setIdx] = useState(() => {
    const found = days.findIndex((d) => d.numero === diaInicial)
    return found >= 0 ? found : 0
  })

  if (days.length === 0) {
    return (
      <p className="rounded-2xl bg-cream-100 p-4 text-ink-700">
        O cardápio ainda está sendo preparado. Volte em breve.
      </p>
    )
  }

  const dia = days[idx]

  return (
    <div className="space-y-4">
      {/* Navegação entre dias */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIdx((i) => Math.max(0, i - 1))}
          disabled={idx === 0}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card disabled:opacity-30"
          aria-label="Dia anterior"
        >
          <ChevronLeft width={20} height={20} />
        </button>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">
            Cardápio
          </p>
          <p className="text-lg font-bold text-ink-900">Dia {dia.numero}</p>
        </div>
        <button
          onClick={() => setIdx((i) => Math.min(days.length - 1, i + 1))}
          disabled={idx === days.length - 1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-card disabled:opacity-30"
          aria-label="Próximo dia"
        >
          <ChevronRight width={20} height={20} />
        </button>
      </div>

      {/* Refeições */}
      <div className="space-y-3">
        {ORDEM.map((chave) => {
          const ref = dia.refeicoes[chave]
          if (!ref) return null
          return (
            <div key={chave} className="card">
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl" aria-hidden>
                  {REFEICAO_EMOJI[chave]}
                </span>
                <h3 className="font-bold text-ink-900">{ref.titulo}</h3>
              </div>
              <ul className="space-y-1">
                {ref.itens.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-ink-800">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
