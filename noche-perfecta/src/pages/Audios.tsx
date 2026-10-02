import { useEffect, useState } from 'react'
import { copy } from '../data/copy.es'
import { AUDIOS } from '../data/audios'
import { getView, isAudioUnlocked } from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'
import { isCached } from '../components/audioEngine'
import { PageTitle } from '../components/ui'

export function Audios() {
  const { state, now } = useStore()
  const v = getView(state, now())
  const [offline, setOffline] = useState<Record<string, boolean>>({})
  const feitos = new Set(state.nights.filter((n) => n.cycle === state.cycle && n.fellAsleep !== null).map((n) => n.audio))
  const mant = state.phase === 'mantenimiento'

  useEffect(() => {
    let vivo = true
    void Promise.all(AUDIOS.map(async (a) => [a.id, await isCached(a.archivo)] as const)).then((r) => {
      if (vivo) setOffline(Object.fromEntries(r))
    })
    return () => {
      vivo = false
    }
  }, [])

  return (
    <div>
      <PageTitle title={copy.audios.titulo} subtitle={copy.audios.subtitulo} />
      <p className="mb-5 text-lg text-crema-soft">{copy.audios.intro}</p>
      <ul className="space-y-3">
        {AUDIOS.map((a) => {
          const libre = isAudioUnlocked(state, a.id, now())
          const hoy = !mant && v.audio === a.id
          const estado = mant ? null : feitos.has(a.id) && !hoy ? copy.audios.hecho : hoy ? copy.audios.hoy : copy.audios.bloqueado
          const conteudo = (
            <>
              <img src={a.icono} alt="" className="h-16 w-16 shrink-0 object-contain" />
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold text-crema">
                  {a.code} · {a.nombre}
                </p>
                <p className="text-base text-crema-soft">{a.funcion}</p>
                <p className="mt-1 text-base text-crema-soft">
                  {copy.audios.min(Math.round(a.duracionSeg / 60))}
                  {offline[a.id] ? <span className="ml-2 text-fija">· {copy.audios.offline}</span> : null}
                </p>
              </div>
              {estado ? (
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-base font-bold ${
                    estado === copy.audios.hoy ? 'bg-ambar text-ambar-ink' : estado === copy.audios.hecho ? 'bg-fija text-fija-ink' : 'bg-noche-700 text-crema-soft'
                  }`}
                >
                  {estado === copy.audios.bloqueado ? '🔒 ' : ''}
                  {estado}
                </span>
              ) : null}
            </>
          )
          return (
            <li key={a.id}>
              {libre ? (
                <button
                  onClick={() => go('player', { mode: mant ? 'libre' : 'ritual', audio: a.id })}
                  className="flex min-h-14 w-full items-center gap-3 rounded-3xl bg-noche-800 p-4 text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-ambar/60"
                >
                  {conteudo}
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-3xl bg-noche-800/70 p-4">{conteudo}</div>
              )}
            </li>
          )
        })}
      </ul>
      {!mant ? <p className="mt-5 text-lg text-crema-soft">{copy.audios.candado}</p> : null}
    </div>
  )
}
