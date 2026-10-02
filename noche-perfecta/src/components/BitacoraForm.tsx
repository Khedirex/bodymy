import { useState } from 'react'
import { copy } from '../data/copy.es'
import type { SleepLog } from '../protocol/protocol'
import { Btn, Escala, Opciones } from './ui'

// Os 4 campos da Bitácora de 30 segundos.
export function BitacoraForm({
  night,
  date,
  defaultBedTime,
  onSave,
}: {
  night: number
  date: string
  defaultBedTime: string
  onSave: (l: SleepLog) => void
}) {
  const [bedTime, setBedTime] = useState(defaultBedTime)
  const [min, setMin] = useState<SleepLog['minutesToSleep'] | null>(null)
  const [desp, setDesp] = useState<SleepLog['awakenings'] | null>(null)
  const [score, setScore] = useState<number | null>(null)
  const ok = bedTime && min !== null && desp !== null && score !== null

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        if (!ok) return
        onSave({ night, date, bedTime, minutesToSleep: min!, awakenings: desp!, wakeScore: score as SleepLog['wakeScore'] })
      }}
    >
      <div>
        <label htmlFor="bed" className="mb-2 block text-xl font-bold text-crema">
          {copy.bitacora.horaAcoste}
        </label>
        <input
          id="bed"
          type="time"
          value={bedTime}
          onChange={(e) => setBedTime(e.target.value)}
          className="min-h-14 w-full rounded-2xl border-2 border-noche-600 bg-noche-900 px-4 text-2xl text-crema [color-scheme:dark] focus:border-ambar focus:outline-none"
        />
      </div>
      <fieldset>
        <legend className="mb-2 text-xl font-bold text-crema">{copy.bitacora.minutos}</legend>
        <Opciones value={min} onChange={(v) => setMin(v as SleepLog['minutesToSleep'])} options={copy.bitacora.minutosOpciones} name={copy.bitacora.minutos} />
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xl font-bold text-crema">{copy.bitacora.despertares}</legend>
        <Opciones value={desp} onChange={(v) => setDesp(v as SleepLog['awakenings'])} options={copy.bitacora.despertaresOpciones} name={copy.bitacora.despertares} />
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-xl font-bold text-crema">{copy.bitacora.comoDesperte}</legend>
        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label={copy.bitacora.comoDesperte}>
          {copy.bitacora.caras.map((c, i) => (
            <button
              type="button"
              key={c}
              role="radio"
              aria-checked={score === i + 1}
              aria-label={copy.bitacora.carasAria[i]}
              onClick={() => setScore(i + 1)}
              className={`min-h-16 rounded-2xl text-3xl focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60 ${
                score === i + 1 ? 'bg-ambar' : 'bg-noche-700'
              }`}
            >
              <span aria-hidden="true">{c}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <Btn type="submit" disabled={!ok} className="w-full">
        {copy.bitacora.guardar}
      </Btn>
    </form>
  )
}

export { Escala }
