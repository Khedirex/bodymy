import { useState } from 'react'
import { copy } from '../data/copy.es'
import { audioForNight, getView, nightDate, type SleepLog } from '../protocol/protocol'
import { useStore } from '../state/store'
import { Ancla, Btn, PageTitle } from '../components/ui'

export function Calendario() {
  const { state, now } = useStore()
  const v = getView(state, now())
  const recs = state.nights.filter((n) => n.cycle === state.cycle && n.fellAsleep !== null)
  const [aberta, setAberta] = useState<number | null>(null)

  const logDe = (night: number): SleepLog | undefined => {
    const r = [...recs].reverse().find((n) => n.night === night)
    if (!r) return undefined
    return state.logs.find((l) => l.night === night && l.date === nightDate(new Date(r.completedAt)))
  }

  const bloco = (titulo: string, desde: number, fija: boolean) => (
    <section className="mb-6">
      <h2 className={`mb-3 text-xl font-extrabold ${fija ? 'text-fija' : 'text-ambar'}`}>{titulo}</h2>
      <ol className="grid grid-cols-4 gap-2">
        {Array.from({ length: 7 }, (_, i) => {
          const n = desde + i
          const feita = recs.some((r) => r.night === n)
          const hoy = state.phase !== 'mantenimiento' && n === v.night && !feita
          const cls = feita
            ? fija
              ? 'bg-fija text-fija-ink'
              : 'bg-ambar text-ambar-ink'
            : hoy
              ? 'border-2 border-crema bg-noche-700 text-crema'
              : 'bg-noche-800 text-crema-soft'
          return (
            <li key={n}>
              <button
                disabled={!feita}
                onClick={() => setAberta(n)}
                aria-label={`${copy.hoy.noche(n)}${feita ? ' ✓' : ''}`}
                className={`flex min-h-20 w-full flex-col items-center justify-center rounded-2xl p-1 focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60 ${cls}`}
              >
                <span className="text-2xl font-extrabold">{n}</span>
                <span className="text-base font-bold">{audioForNight(n).toUpperCase()}</span>
                <span className="text-base" aria-hidden="true">
                  {feita ? '✓' : hoy ? copy.calendario.hoy : ' '}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )

  const log = aberta !== null ? logDe(aberta) : undefined

  return (
    <div>
      <PageTitle title={copy.calendario.titulo} />
      <p className="mb-5 text-lg text-crema-soft">{copy.calendario.toca}</p>
      {bloco(copy.bloques.reconfiguracion, 1, false)}
      {bloco(copy.bloques.fijacion, 8, true)}
      <Ancla />

      {aberta !== null ? (
        <div className="fixed inset-0 z-40 flex items-end bg-black/70 p-4" role="dialog" aria-modal="true" onClick={() => setAberta(null)}>
          <div className="w-full rounded-3xl bg-noche-800 p-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-2xl font-extrabold text-crema">{copy.hoy.noche(aberta)}</p>
            {log ? (
              <ul className="mt-3 space-y-1 text-lg text-crema">
                <li>{copy.bitacora.horaAcoste}: <b>{log.bedTime}</b></li>
                <li>{copy.bitacora.minutos}: <b>{log.minutesToSleep === 60 ? '60+' : log.minutesToSleep}</b></li>
                <li>{copy.bitacora.despertares}: <b>{log.awakenings === 3 ? '3+' : log.awakenings}</b></li>
                <li>
                  {copy.bitacora.comoDesperte}: <span className="text-2xl">{copy.bitacora.caras[log.wakeScore - 1]}</span>
                </li>
              </ul>
            ) : (
              <p className="mt-3 text-lg text-crema-soft">{copy.calendario.sinBitacora}</p>
            )}
            <Btn variant="secondary" className="mt-5 w-full" onClick={() => setAberta(null)}>
              {copy.calendario.cerrar}
            </Btn>
          </div>
        </div>
      ) : null}
    </div>
  )
}
