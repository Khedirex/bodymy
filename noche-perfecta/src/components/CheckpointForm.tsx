import { useState } from 'react'
import { copy } from '../data/copy.es'
import type { CheckpointAnswers } from '../protocol/protocol'
import { Btn, Escala } from './ui'

type Key = 'tardanza' | 'despertares' | 'energia'
const KEYS: Key[] = ['tardanza', 'despertares', 'energia']

// As 3 perguntas 1–5. Com `compare`, mostra antes/ahora lado a lado.
export function CheckpointForm({
  withCambio,
  compare,
  submitLabel,
  onSave,
}: {
  withCambio: boolean
  compare: { label: string; a: CheckpointAnswers }[]
  submitLabel: string
  onSave: (a: CheckpointAnswers) => void
}) {
  const [v, setV] = useState<Record<Key, number | null>>({ tardanza: null, despertares: null, energia: null })
  const [cambio, setCambio] = useState('')
  const ok = KEYS.every((k) => v[k] !== null)

  return (
    <div className="space-y-6">
      {KEYS.map((k) => (
        <fieldset key={k} className="rounded-3xl bg-noche-800 p-4">
          <legend className="sr-only">{copy.checkpoint.preguntas[k].q}</legend>
          <p className="text-xl font-bold text-crema">{copy.checkpoint.preguntas[k].q}</p>
          <p className="mb-3 text-base text-crema-soft">{copy.checkpoint.preguntas[k].escala}</p>
          {compare.map((c) => (
            <div key={c.label} className="mb-2 flex items-center gap-3">
              <span className="w-24 shrink-0 text-base text-crema-soft">{c.label}</span>
              <Comparacion value={c.a[k]} />
            </div>
          ))}
          {compare.length ? <p className="mb-2 mt-3 text-base font-bold text-ambar">{copy.checkpoint.ahora}</p> : null}
          <Escala value={v[k]} onChange={(n) => setV((p) => ({ ...p, [k]: n }))} name={copy.checkpoint.preguntas[k].q} />
        </fieldset>
      ))}
      {withCambio ? (
        <div>
          <label htmlFor="cambio" className="mb-2 block text-xl font-bold text-crema">
            {copy.checkpoint.cambio}
          </label>
          <textarea
            id="cambio"
            rows={3}
            value={cambio}
            onChange={(e) => setCambio(e.target.value)}
            className="w-full rounded-2xl border-2 border-noche-600 bg-noche-900 p-4 text-lg text-crema focus:border-ambar focus:outline-none"
          />
        </div>
      ) : null}
      <Btn
        className="w-full"
        disabled={!ok}
        onClick={() =>
          onSave({
            tardanza: v.tardanza!,
            despertares: v.despertares!,
            energia: v.energia!,
            ...(withCambio ? { cambio: cambio.trim() } : {}),
          })
        }
      >
        {submitLabel}
      </Btn>
    </div>
  )
}

/** Barra horizontal 1–5 (comparação visual antes / ahora). */
export function Comparacion({ value, highlight = false }: { value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-1 items-center gap-2" aria-label={`${value} / 5`}>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-noche-700">
        <div className={`h-full rounded-full ${highlight ? 'bg-ambar' : 'bg-crema-soft'}`} style={{ width: `${value * 20}%` }} />
      </div>
      <span className="w-6 text-right text-lg font-bold text-crema">{value}</span>
    </div>
  )
}
