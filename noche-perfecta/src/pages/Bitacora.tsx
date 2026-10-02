import { useState } from 'react'
import { copy } from '../data/copy.es'
import { answerFellAsleep, getView, nightDate, saveLog } from '../protocol/protocol'
import { useStore } from '../state/store'
import { BitacoraForm } from '../components/BitacoraForm'
import { Btn, Card, Ilustracion, PageTitle } from '../components/ui'

export function Bitacora({ params }: { params: URLSearchParams }) {
  const { state, update, now } = useStore()
  const v = getView(state, now())
  const [guardada, setGuardada] = useState(false)

  // Qual noite: a pedida, a pendente, a Noche Cero ou (manutenção) a de ontem.
  const pedida = params.get('night')
  const night =
    pedida !== null ? Number(pedida) : v.pendingLogNight ?? (state.phase === 'mantenimiento' ? 15 : state.currentNight === 0 ? 0 : null)
  const rec = [...state.nights].reverse().find((n) => n.night === night && n.cycle === state.cycle)
  const date = rec ? nightDate(new Date(rec.completedAt)) : nightDate(now())

  const historial = [...state.logs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.night - a.night))

  return (
    <div className="space-y-6">
      <Ilustracion name="bitacora" size={110} />
      <PageTitle title={copy.bitacora.titulo} subtitle={copy.bitacora.intro} back="mas" />

      {/* Pergunta da noite que ficou sem resposta (dormiu durante o áudio). */}
      {v.status === 'answer-pending' ? (
        <Card className="border-2 border-ambar">
          <p className="text-xl font-bold text-crema">{copy.hoy.bannerPregunta}</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Btn onClick={() => update((s) => answerFellAsleep(s, true))}>{copy.final.si}</Btn>
            <Btn variant="secondary" onClick={() => update((s) => answerFellAsleep(s, false))}>
              {copy.final.no}
            </Btn>
          </div>
        </Card>
      ) : null}

      {guardada ? (
        <p role="status" className="rounded-2xl bg-noche-800 p-4 text-xl font-bold text-ambar">
          {copy.bitacora.guardada}
        </p>
      ) : night !== null ? (
        <Card>
          <p className="mb-4 text-2xl font-extrabold text-crema">{copy.bitacora.deLaNoche(night)}</p>
          <BitacoraForm
            key={`${night}-${date}`}
            night={night}
            date={date}
            defaultBedTime={state.startHour}
            onSave={(l) => {
              update((s) => saveLog(s, l))
              setGuardada(true)
            }}
          />
        </Card>
      ) : null}

      <section>
        <h2 className="mb-3 text-2xl font-extrabold text-crema">{copy.bitacora.historial}</h2>
        {historial.length === 0 ? (
          <p className="text-lg text-crema-soft">{copy.bitacora.vacio}</p>
        ) : (
          <ul className="space-y-2">
            {historial.map((l) => (
              <li key={`${l.night}-${l.date}`} className="flex items-center gap-3 rounded-2xl bg-noche-800 p-4">
                <span className="text-3xl" aria-hidden="true">
                  {copy.bitacora.caras[l.wakeScore - 1]}
                </span>
                <div>
                  <p className="text-lg font-bold text-crema">
                    {copy.bitacora.deLaNoche(l.night)} · {l.bedTime}
                  </p>
                  <p className="text-base text-crema-soft">
                    {copy.bitacora.resumen(l.minutesToSleep === 60 ? '60+' : String(l.minutesToSleep), l.awakenings === 3 ? '3+' : String(l.awakenings))}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
