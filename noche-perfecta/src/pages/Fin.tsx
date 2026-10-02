import { copy } from '../data/copy.es'
import { answerFellAsleep } from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'
import { Btn, Ilustracion } from '../components/ui'
import { pedirNotificaciones, notificacionesDisponibles } from './notificaciones'

// Al terminar el audio: "¿Te dormiste?" → "Noche X completada".
export function Fin({ params }: { params: URLSearchParams }) {
  const { state, update } = useStore()
  const night = Number(params.get('night') ?? state.currentNight)
  const rec = [...state.nights].reverse().find((n) => n.night === night && n.cycle === state.cycle)
  const pendiente = rec?.fellAsleep === null

  if (pendiente) {
    return (
      <div className="flex min-h-[70vh] flex-col justify-center gap-6 text-center">
        <Ilustracion name="si-te-cuesta" size={130} />
        <h1 className="text-3xl font-extrabold text-crema">{copy.final.pregunta}</h1>
        <Btn className="min-h-20 w-full text-2xl" onClick={() => update((s) => answerFellAsleep(s, true))}>
          {copy.final.si}
        </Btn>
        <Btn variant="secondary" className="min-h-20 w-full text-2xl" onClick={() => update((s) => answerFellAsleep(s, false))}>
          {copy.final.no}
        </Btn>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col justify-center gap-5 text-center">
      <Ilustracion name="cierre" size={150} />
      <h1 className="text-3xl font-extrabold text-crema">{copy.final.completada(night)}</h1>
      {state.repeatNext ? (
        <div className="rounded-3xl bg-noche-800 p-5 text-left">
          <p className="text-xl font-bold text-ambar">{copy.final.repetiraTitulo}</p>
          <p className="mt-2 text-lg text-crema">{copy.final.repetiraTexto}</p>
        </div>
      ) : null}
      <p className="text-xl text-crema-soft">{copy.final.recordatorio}</p>
      {notificacionesDisponibles() && !state.notifications ? (
        <Btn
          variant="secondary"
          className="w-full"
          onClick={async () => {
            const ok = await pedirNotificaciones()
            if (ok) update((s) => ({ ...s, notifications: true }))
          }}
        >
          {copy.final.notificaciones}
        </Btn>
      ) : null}
      <Btn className="w-full" onClick={() => go('hoy')}>
        {copy.final.ir}
      </Btn>
    </div>
  )
}
