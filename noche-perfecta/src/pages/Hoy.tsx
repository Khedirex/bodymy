import { useEffect } from 'react'
import { copy } from '../data/copy.es'
import { audioById } from '../data/audios'
import {
  acceptRelapse,
  answerFellAsleep,
  dismissRelapse,
  getView,
  isInsideWindow,
} from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'
import { preload } from '../components/audioEngine'
import { Progress14 } from '../components/Progress'
import { Btn, Card, Ilustracion, Ancla } from '../components/ui'

export function Hoy() {
  const { state, update, now } = useStore()
  const v = getView(state, now())
  const audio = v.audio ? audioById(v.audio) : null
  const completed = new Set(state.nights.filter((n) => n.cycle === state.cycle).map((n) => n.night))

  // Pré-carrega o áudio da noite ao abrir a Hoy.
  useEffect(() => {
    if (audio && (v.status === 'ready' || v.status === 'maintenance')) preload(audio.archivo)
  }, [audio, v.status])

  const fijacion = v.phase === 'fijacion'

  return (
    <div className="space-y-5">
      {/* Avisos pendentes */}
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

      {v.pendingLogNight !== null && v.status !== 'answer-pending' ? (
        <Card className="flex items-center gap-4">
          <Ilustracion name="bitacora" size={64} className="!mx-0 shrink-0" />
          <div className="flex-1">
            <p className="text-lg text-crema">{copy.hoy.bannerBitacora(v.pendingLogNight)}</p>
            <Btn variant="secondary" className="mt-3 w-full" onClick={() => go('bitacora')}>
              {copy.hoy.bannerBitacoraBoton}
            </Btn>
          </div>
        </Card>
      ) : null}

      {v.pendingCheckpoint ? (
        <Card className="flex items-center gap-4">
          <Ilustracion name="checkpoint" size={64} className="!mx-0 shrink-0" />
          <div className="flex-1">
            <p className="text-lg text-crema">{copy.hoy.bannerCheckpoint(v.pendingCheckpoint)}</p>
            <Btn variant="secondary" className="mt-3 w-full" onClick={() => go('checkpoint', { n: v.pendingCheckpoint! })}>
              {copy.hoy.bannerCheckpointBoton}
            </Btn>
          </div>
        </Card>
      ) : null}

      {v.proposeRelapse ? (
        <Card className="border-2 border-ambar">
          <p className="text-2xl font-bold text-crema">{copy.hoy.recaidaTitulo}</p>
          <p className="mt-2 text-lg text-crema-soft">{copy.hoy.recaidaTexto}</p>
          <div className="mt-4 grid gap-3">
            <Btn onClick={() => update(acceptRelapse)}>{copy.hoy.recaidaSi}</Btn>
            <Btn variant="ghost" onClick={() => update(dismissRelapse)}>
              {copy.hoy.recaidaNo}
            </Btn>
          </div>
        </Card>
      ) : null}

      {/* Cartão principal */}
      {v.status === 'preset' ? (
        <Card className="text-center">
          <Ilustracion name="noche-cero" size={150} />
          <h1 className="mt-3 text-3xl font-extrabold text-crema">{copy.hoy.nocheCero}</h1>
          <p className="mt-2 text-xl text-crema-soft">{copy.hoy.nocheCeroPreset}</p>
          <Btn className="mt-5 w-full" onClick={() => go('noche-cero')}>
            {copy.hoy.nocheCeroPresetBoton}
          </Btn>
        </Card>
      ) : null}

      {v.status === 'first-log' ? (
        <Card className="text-center">
          <Ilustracion name="bitacora" size={130} />
          <h1 className="mt-3 text-3xl font-extrabold text-crema">{copy.hoy.nocheCero}</h1>
          <p className="mt-2 text-xl text-crema-soft">{copy.hoy.nocheCeroLog}</p>
          <Btn className="mt-5 w-full" onClick={() => go('bitacora', { night: 0 })}>
            {copy.hoy.nocheCeroLogBoton}
          </Btn>
        </Card>
      ) : null}

      {(v.status === 'ready' || v.status === 'answer-pending') && audio ? (
        <section
          className={`rounded-3xl p-6 ${fijacion ? 'bg-gradient-to-b from-[#0f3a46] to-noche-800' : 'bg-gradient-to-b from-noche-700 to-noche-800'}`}
          aria-labelledby="noche-titulo"
        >
          <p className={`text-lg font-bold ${fijacion ? 'text-fija' : 'text-ambar'}`}>
            {fijacion ? copy.bloques.fijacion : copy.bloques.reconfiguracion}
          </p>
          <h1 id="noche-titulo" className="text-4xl font-extrabold text-crema">
            {copy.hoy.noche(v.night)}
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <img src={audio.icono} alt="" className="h-20 w-20 object-contain" />
            <div>
              <p className="text-2xl font-bold text-crema">
                {audio.code} · {audio.nombre}
              </p>
              <p className="text-lg text-crema-soft">{audio.funcion}</p>
            </div>
          </div>

          {v.missedNight ? <p className="mt-4 rounded-2xl bg-noche-900 p-3 text-lg text-crema">{copy.hoy.retomas}</p> : null}
          {v.isRepeat ? <p className="mt-4 rounded-2xl bg-noche-900 p-3 text-lg text-crema">{copy.hoy.repite}</p> : null}
          {v.plays === 2 ? <p className="mt-4 text-lg font-bold text-ambar">{copy.hoy.dosVeces}</p> : null}

          <button
            disabled={v.status !== 'ready'}
            onClick={() => go('player', { mode: 'ritual', audio: audio.id })}
            aria-label={copy.hoy.playAria(audio.nombre)}
            className="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-ambar text-ambar-ink shadow-[0_0_50px_rgba(245,200,106,0.25)] focus:outline-none focus-visible:ring-4 focus-visible:ring-crema disabled:opacity-40"
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </button>
          <p className="mt-2 text-center text-xl font-bold text-crema">{copy.hoy.play}</p>

          {!isInsideWindow(state.startHour, now()) ? (
            <p className="mt-4 text-center text-base text-crema-soft">{copy.hoy.fueraVentana(state.startHour)}</p>
          ) : null}
          <p className="mt-4 text-center text-lg text-crema-soft">{copy.hoy.presetRecordatorio}</p>
          {state.closingPhrase ? (
            <p className="mt-3 text-center text-xl italic text-crema">«{state.closingPhrase}»</p>
          ) : null}
        </section>
      ) : null}

      {v.status === 'done-today' ? (
        <Card className="text-center">
          <Ilustracion name="cierre" size={140} />
          <p className="mt-3 text-2xl font-bold text-crema">{copy.hoy.listaHoy}</p>
          <p className="mt-2 text-xl text-ambar">{copy.hoy.manana(v.night)}</p>
        </Card>
      ) : null}

      {v.status === 'maintenance' && audio ? (
        <Card>
          <Ilustracion name="mantenimiento" size={130} />
          <h1 className="mt-3 text-3xl font-extrabold text-crema">{copy.hoy.mantenimientoTitulo}</h1>
          <p className="mt-2 text-lg text-crema-soft">{copy.hoy.mantenimientoTexto}</p>
          <p className="mt-4 text-lg font-bold text-ambar">{copy.hoy.mantenimientoHoy}</p>
          <p className="text-2xl font-bold text-crema">
            {audio.code} · {audio.nombre}
          </p>
          <Btn className="mt-4 w-full" onClick={() => go('player', { mode: 'libre', audio: audio.id })}>
            {copy.hoy.play}
          </Btn>
        </Card>
      ) : null}

      {v.status !== 'preset' && v.status !== 'first-log' && v.status !== 'maintenance' ? (
        <Card>
          <p className="mb-3 text-lg font-bold text-crema">{copy.hoy.progreso}</p>
          <Progress14 completed={completed} current={v.night} />
        </Card>
      ) : null}

      <Ancla />

      {/* Modo Rescate: sempre visível */}
      <Btn variant="secondary" className="w-full" onClick={() => go('player', { mode: 'rescate', audio: 'vn5' })}>
        🌙 {copy.hoy.rescate}
      </Btn>
    </div>
  )
}
