import { useEffect, useRef } from 'react'
import { Player } from '../components/Player'
import { audioById } from '../data/audios'
import {
  addRescue,
  canLoopUntilStopped,
  completeMaintenancePlay,
  completeNight,
  getView,
  isAudioUnlocked,
  RESCUE_AUDIO,
  type AudioId,
} from '../protocol/protocol'
import { useStore } from '../state/store'
import { go } from '../state/router'

// mode: ritual (a noite de hoje) · rescate (VN5, sem avanço) · libre (manutenção)
export function PlayerPage({ params }: { params: URLSearchParams }) {
  const { state, update, now } = useStore()
  const mode = (params.get('mode') ?? 'ritual') as 'ritual' | 'rescate' | 'libre'
  const id = (mode === 'rescate' ? RESCUE_AUDIO : params.get('audio') ?? 'vn1') as AudioId
  const v = getView(state, now())
  const registrado = useRef(false)

  // Ordem travada: o ritual só toca o áudio liberado de hoje.
  const permitido = mode === 'rescate' || isAudioUnlocked(state, id, now())

  useEffect(() => {
    if (!permitido) go('hoy')
    else if (mode === 'rescate' && !registrado.current) {
      registrado.current = true
      update((s) => addRescue(s, now()))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!permitido) return null
  const ritual = mode === 'ritual'

  return (
    <Player
      audio={audioById(id)}
      plays={ritual ? v.plays : 1}
      rescue={mode === 'rescate'}
      allowLoop={canLoopUntilStopped(mode === 'rescate' ? 'rescate' : 'ritual', state.phase)}
      onFinish={(completed) => {
        if (ritual && completed) {
          const night = state.currentNight
          update((s) => completeNight(s, now()))
          go('fin', { night })
        } else if (mode === 'libre' && completed) {
          update((s) => completeMaintenancePlay(s, id, now()))
          go('hoy')
        } else {
          go('hoy')
        }
      }}
    />
  )
}
