'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from '@/components/ui/icons'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
const DIAS_SEMANA = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

// Calendário mensal com os dias de check-in marcados.
export function Calendar({
  checkinDates,
  hoje,
}: {
  checkinDates: string[]
  hoje: string
}) {
  const marcados = new Set(checkinDates)
  const [ano, mes] = hoje.split('-').map(Number) // mes 1-12
  const [view, setView] = useState({ ano, mes })

  const primeiroDiaSemana = new Date(Date.UTC(view.ano, view.mes - 1, 1)).getUTCDay()
  const diasNoMes = new Date(Date.UTC(view.ano, view.mes, 0)).getUTCDate()

  function iso(dia: number) {
    return `${view.ano}-${String(view.mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
  }

  function mudarMes(delta: number) {
    setView((v) => {
      let m = v.mes + delta
      let a = v.ano
      if (m < 1) {
        m = 12
        a -= 1
      } else if (m > 12) {
        m = 1
        a += 1
      }
      return { ano: a, mes: m }
    })
  }

  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]

  return (
    <div className="card">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => mudarMes(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100"
          aria-label="Mes anterior"
        >
          <ChevronLeft width={18} height={18} />
        </button>
        <p className="font-bold text-ink-900">
          {MESES[view.mes - 1]} {view.ano}
        </p>
        <button
          onClick={() => mudarMes(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight width={18} height={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="py-1 text-xs font-semibold text-ink-700/50">
            {d}
          </div>
        ))}
        {celulas.map((dia, i) => {
          if (dia === null) return <div key={i} />
          const dataIso = iso(dia)
          const ativo = marcados.has(dataIso)
          const ehHoje = dataIso === hoje
          return (
            <div
              key={i}
              className={`flex aspect-square items-center justify-center rounded-full text-sm font-medium ${
                ativo
                  ? 'bg-coral-400 text-white'
                  : ehHoje
                    ? 'border-2 border-coral-200 text-ink-800'
                    : 'text-ink-700'
              }`}
            >
              {dia}
            </div>
          )
        })}
      </div>
    </div>
  )
}
