import { useCallback, useEffect, useRef, useState } from 'react'
import { copy } from '../data/copy.es'
import type { AudioMeta } from '../data/audios'
import { countsAsComplete } from '../protocol/protocol'
import { ensureCached, getAudio, isLoaded, load, ramp } from './audioEngine'

const FADE_IN_MS = 3000
const FADE_OUT_MS = 5000

interface Props {
  audio: AudioMeta
  plays: 1 | 2 // Severa noches 1–4 = 2 (sem pausa entre as duas)
  allowLoop: boolean // "Repetir hasta que yo lo pare" (rescate / mantenimiento)
  rescue: boolean
  onFinish: (completed: boolean) => void // completed = terminou ou saiu com > 80 %
}

// Player de tela cheia, pensado para usar deitada, no escuro, sem olhar:
// um botão enorme, progresso e tempo restante grandes, e "Salir".
export function Player({ audio, plays, allowLoop, rescue, onFinish }: Props) {
  const a = getAudio()
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(audio.duracionSeg)
  const [pass, setPass] = useState(1) // 1ª ou 2ª vez
  const [loop, setLoop] = useState(false)
  const [dark, setDark] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const listened = useRef(0) // segundos efetivamente ouvidos (somando as passadas)
  const lastT = useRef(0)
  const fading = useRef(false)
  const started = useRef(false)
  const finished = useRef(false)
  const passRef = useRef(1)
  const loopRef = useRef(loop)
  loopRef.current = loop

  const finish = useCallback(
    (completed: boolean) => {
      if (finished.current) return
      finished.current = true
      a.pause()
      onFinish(completed)
    },
    [a, onFinish],
  )

  // Carrega o arquivo (se a Hoy já pré-carregou, reaproveita).
  const [pronto, setPronto] = useState(() => isLoaded(audio.archivo))
  useEffect(() => {
    let vivo = true
    void load(audio.archivo).then(() => {
      if (!vivo) return
      a.currentTime = 0
      try {
        a.volume = 1
      } catch {
        /* iOS */
      }
      setPronto(true)
    })
    return () => {
      vivo = false
      a.pause()
    }
  }, [a, audio.archivo])

  // Eventos do elemento.
  useEffect(() => {
    const onTime = () => {
      const t = a.currentTime
      const d = isFinite(a.duration) && a.duration > 0 ? a.duration : audio.duracionSeg
      if (t > lastT.current && t - lastT.current < 2) listened.current += t - lastT.current
      lastT.current = t
      setTime(t)
      setDuration(d)
      // Fade-out só no fim da ÚLTIMA passada (e nunca no modo repetir).
      const ultima = passRef.current >= plays && !loopRef.current
      if (ultima && !fading.current && d - t <= FADE_OUT_MS / 1000) {
        fading.current = true
        ramp(a, a.volume, 0, Math.max(0, (d - t) * 1000))
      }
    }
    const onEnded = () => {
      lastT.current = 0
      if (passRef.current < plays) {
        passRef.current += 1
        setPass(passRef.current)
        a.currentTime = 0
        void a.play()
        return
      }
      if (loopRef.current) {
        a.currentTime = 0
        void a.play()
        return
      }
      setPlaying(false)
      finish(true)
    }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => setAviso(copy.player.errorCarga)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('ended', onEnded)
    a.addEventListener('play', onPlay)
    a.addEventListener('pause', onPause)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('timeupdate', onTime)
      a.removeEventListener('ended', onEnded)
      a.removeEventListener('play', onPlay)
      a.removeEventListener('pause', onPause)
      a.removeEventListener('error', onError)
    }
  }, [a, audio.duracionSeg, plays, finish])

  // Media Session: controle na tela de bloqueio e áudio com a tela apagada.
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${audio.code} · ${audio.nombre}`,
      artist: copy.marca,
      artwork: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    })
    navigator.mediaSession.setActionHandler('play', () => void toggle(true))
    navigator.mediaSession.setActionHandler('pause', () => a.pause())
    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio])

  useEffect(() => {
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'
  }, [playing])

  async function toggle(forcePlay = false) {
    if (playing && !forcePlay) {
      a.pause()
      return
    }
    setAviso(null)
    if (!pronto) await load(audio.archivo)
    try {
      if (!started.current) {
        try {
          a.volume = 0
        } catch {
          /* iOS */
        }
      }
      await a.play() // só por toque: respeita a política de autoplay
      if (!started.current) {
        started.current = true
        ramp(a, 0, 1, FADE_IN_MS)
        void ensureCached(audio.archivo)
      }
    } catch (e) {
      const nome = (e as DOMException)?.name
      setAviso(nome === 'NotAllowedError' ? copy.player.bloqueado : copy.player.errorCarga)
    }
  }

  function sair() {
    const total = duration * plays
    finish(!rescue && countsAsComplete(total > 0 ? listened.current / total : 0))
  }

  const restante = Math.max(0, duration - time)
  const mm = Math.floor(restante / 60)
  const ss = String(Math.floor(restante % 60)).padStart(2, '0')
  const pct = duration > 0 ? (time / duration) * 100 : 0

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-noche-950 text-crema" role="dialog" aria-label={audio.nombre}>
      <div className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="text-base text-crema-soft">{rescue ? copy.player.rescate : audio.code}</span>
        <button onClick={sair} className="min-h-14 rounded-2xl px-5 text-xl font-bold text-crema">
          {copy.player.salir}
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div>
          <h1 className="text-3xl font-extrabold">{audio.nombre}</h1>
          {plays === 2 && pass === 2 ? (
            <p className="mt-2 text-xl font-bold text-ambar">{copy.player.segundaVez}</p>
          ) : null}
        </div>

        <button
          onClick={() => void toggle()}
          aria-label={playing ? copy.player.pausa : copy.player.play}
          className="flex h-36 w-36 items-center justify-center rounded-full bg-ambar text-ambar-ink shadow-[0_0_60px_rgba(245,200,106,0.25)] focus:outline-none focus-visible:ring-4 focus-visible:ring-crema"
        >
          {playing ? (
            <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          )}
        </button>

        <div className="w-full max-w-sm">
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-noche-700"
            role="progressbar"
            aria-label={copy.player.progresoAria}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
          >
            <div className="h-full rounded-full bg-ambar" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-3 text-4xl font-extrabold tabular-nums" aria-live="off">
            {mm}:{ss} <span className="text-lg font-semibold text-crema-soft">{copy.player.restante}</span>
          </p>
        </div>

        {aviso ? (
          <p role="alert" className="rounded-2xl bg-noche-800 px-4 py-3 text-lg text-ambar">
            {aviso}
          </p>
        ) : null}

        {rescue ? (
          <ol className="space-y-1 text-lg text-crema-soft">
            {copy.player.rescatePasos.map((p, i) => (
              <li key={p}>
                {i + 1}. {p}
              </li>
            ))}
          </ol>
        ) : null}
      </div>

      <div className="space-y-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {allowLoop ? (
          <div className="grid grid-cols-2 gap-2" role="radiogroup">
            {[false, true].map((v) => (
              <button
                key={String(v)}
                role="radio"
                aria-checked={loop === v}
                onClick={() => setLoop(v)}
                className={`min-h-14 rounded-2xl px-3 text-base font-bold ${
                  loop === v ? 'bg-noche-600 text-crema' : 'bg-noche-900 text-crema-soft'
                }`}
              >
                {v ? copy.player.repetir : copy.player.detenerAlTerminar}
              </button>
            ))}
          </div>
        ) : null}
        <button onClick={() => setDark(true)} className="min-h-14 w-full rounded-2xl bg-noche-900 text-lg font-bold text-crema-soft">
          {copy.player.apagar}
        </button>
      </div>

      {dark ? (
        <button
          className="fixed inset-0 z-[60] bg-black"
          onClick={() => setDark(false)}
          aria-label={copy.player.apagadoAyuda}
        />
      ) : null}
    </div>
  )
}
