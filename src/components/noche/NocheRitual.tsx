'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  NOCHE_TOTAL_NOCHES,
  NOCHE_NIVEIS,
  NOCHE_AUDIO_RESCATE,
  NOCHE_GUIA_PDF,
  audioDaNoche,
  audioPorId,
  repeticoesDaNoche,
  type NocheNivel,
} from '@/lib/noche'
import { temaDoModulo } from '@/lib/modulo-tema'
import { ProgressBar } from '@/components/ProgressBar'
import { PlayIcon, CheckIcon } from '@/components/ui/icons'

interface Props {
  nivel: NocheNivel | null
  concluidas: number
  proximaNoche: number | null
  feitoHoje: boolean
  terminado: boolean
}

// Uma noite por vez: escolher o nível (só na primeira), ouvir o áudio e
// marcar a noite. Texto grande e um botão só — o público é 45-60+.
// O mesmo tema noturno do card da Home acompanha a aluna aqui dentro.
const TEMA = temaDoModulo('ritual-noche-perfecta')

// O áudio de rescate é promessa do produto ("úsalo cuando despiertes de
// madrugada"), mas só aparecia na noite 5. Agora fica disponível TODA noite,
// fechado por padrão para não competir com o ritual do dia.
function Rescate() {
  const audio = audioPorId(NOCHE_AUDIO_RESCATE)
  return (
    <details className="rounded-3xl bg-white p-5 shadow-card">
      <summary className="cursor-pointer list-none text-lg font-bold text-ink-900">
        🌑 ¿Despertaste de madrugada?
      </summary>
      <p className="mt-2 text-base text-ink-700">
        No cuentes las horas que te quedan. Quédate acostada y escucha el{' '}
        <strong>{audio.nombre}</strong> aquí mismo. Puedes usarlo todas las veces que lo
        necesites — no cambia tu avance.
      </p>
      <audio src={audio.archivo} controls preload="none" className="mt-3 w-full" />
    </details>
  )
}

// A guia em PDF: as 7 noites, como usar e as dúvidas mais comuns.
function Guia() {
  return (
    <a
      href={NOCHE_GUIA_PDF}
      target="_blank"
      rel="noopener"
      className="flex items-center gap-3 rounded-3xl bg-white p-5 shadow-card"
    >
      <span className="text-2xl">📄</span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-ink-900">Tu guía en PDF</span>
        <span className="block text-sm text-ink-700">
          Las {NOCHE_TOTAL_NOCHES} noches, cómo usarlas y las dudas más comunes
        </span>
      </span>
    </a>
  )
}

export function NocheRitual({ nivel, concluidas, proximaNoche, feitoHoje, terminado }: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tocou, setTocou] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Mantém a tela acesa enquanto o áudio toca (ela fecha os olhos, não toca
  // na tela por 7 minutos).
  useEffect(() => {
    if (!tocou) return
    let lock: WakeLockSentinel | null = null
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinel> } }
    nav.wakeLock?.request('screen').then((l) => { lock = l }).catch(() => {})
    return () => { lock?.release().catch(() => {}) }
  }, [tocou])

  async function escolherNivel(v: NocheNivel) {
    setErro(null)
    try {
      const res = await fetch('/api/noche/nivel', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ nivel: v }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setErro('No pudimos guardar. Inténtalo de nuevo.')
    }
  }

  async function marcarNoche() {
    if (!proximaNoche || salvando) return
    setErro(null)
    setSalvando(true)
    try {
      const res = await fetch('/api/noche/completar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ noche: proximaNoche }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
    } catch {
      setErro('No pudimos guardar tu noche. Inténtalo de nuevo.')
    } finally {
      setSalvando(false)
    }
  }

  // Primeiro acesso: o nível define as repetições das primeiras noites.
  if (!nivel) {
    return (
      <div className="space-y-5">
        <header>
          <span className={`chip ${TEMA.chip}`}>Antes de empezar</span>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
            ¿Cómo duermes hoy?
          </h1>
          <p className="mt-1 text-base text-ink-700">
            Con esto ajustamos tus primeras noches. Puedes cambiarlo después.
          </p>
        </header>
        <div className="space-y-3">
          {NOCHE_NIVEIS.map((n) => (
            <button
              key={n.valor}
              onClick={() => escolherNivel(n.valor)}
              className="w-full rounded-3xl bg-white p-5 text-left shadow-card transition active:scale-[0.99]"
            >
              <p className="text-lg font-bold text-ink-900">{n.label}</p>
              <p className="mt-1 text-base text-ink-700">{n.detalhe}</p>
            </button>
          ))}
        </div>
        {erro && <p className="text-sm font-semibold text-brand-600">{erro}</p>}

        <div className="rounded-3xl bg-white p-5 shadow-card">
          <p className="text-base font-bold text-ink-900">Cómo funciona</p>
          <p className="mt-1 text-base text-ink-700">
            Son {NOCHE_TOTAL_NOCHES} noches. Cada noche, un audio de ~7 minutos: te acuestas,
            cierras los ojos y lo dejas sonar. Quedarte dormida antes de que termine no es un
            error — es el objetivo. Al día siguiente se abre la noche siguiente.
          </p>
        </div>
        <Guia />
      </div>
    )
  }

  if (terminado) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl bg-sage-100 p-8 text-center">
          <p className="text-5xl">🌙</p>
          <p className="mt-3 text-2xl font-extrabold text-sage-600">
            ¡Completaste las {NOCHE_TOTAL_NOCHES} noches!
          </p>
          <p className="mt-2 text-base text-ink-700">
            Tu sueño tiene una nueva frecuencia. Sigue usando los audios cuando lo necesites.
          </p>
        </div>
        <Rescate />
        <Guia />
      </div>
    )
  }

  const noche = proximaNoche ?? NOCHE_TOTAL_NOCHES
  const audio = audioDaNoche(noche)
  const repeticoes = repeticoesDaNoche(nivel, noche)

  return (
    <div className="space-y-5">
      <header>
        <span className={`chip ${TEMA.chip}`}>
          Noche {noche} de {NOCHE_TOTAL_NOCHES}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">{audio.nombre}</h1>
        <p className="mt-1 text-base text-ink-700">{audio.funcion}</p>
      </header>

      <ProgressBar atual={concluidas} total={NOCHE_TOTAL_NOCHES} label="Tu avance" gradiente={TEMA.barra} />

      {feitoHoje ? (
        <div className="flex items-center gap-3 rounded-3xl bg-sage-100/60 px-5 py-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
            <CheckIcon width={24} height={24} />
          </span>
          <p className="text-base font-semibold text-ink-900">
            Ya hiciste la noche de hoy. La siguiente se abre mañana 🌙
          </p>
        </div>
      ) : (
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <p className="text-base text-ink-700">
            Acuéstate, cierra los ojos y deja que el audio te lleve.
            {repeticoes === 2 && ' Esta noche se escucha dos veces.'}
          </p>

          <audio
            ref={audioRef}
            src={audio.archivo}
            controls
            preload="none"
            onPlay={() => setTocou(true)}
            className="mt-4 w-full"
          />

          <button
            onClick={marcarNoche}
            disabled={salvando}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold disabled:opacity-60 ${TEMA.botao}`}
          >
            <PlayIcon width={22} height={22} />
            {salvando ? 'Guardando…' : 'Marcar esta noche'}
          </button>
          {erro && <p className="mt-2 text-sm font-semibold text-brand-600">{erro}</p>}
        </section>
      )}

      <Rescate />
      <Guia />
    </div>
  )
}
