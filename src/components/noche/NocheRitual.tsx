'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  NOCHE_NIVEIS,
  NOCHE_GUIA_PDF,
  blocoPorSlug,
  repeticoesDaNoche,
  type NocheAudio,
  type NocheBloco,
  type NocheNivel,
} from '@/lib/noche'
import { temaDoModulo } from '@/lib/modulo-tema'
import { ProgressBar } from '@/components/ProgressBar'
import { AudioRemoto } from '@/components/noche/AudioRemoto'
import { CheckIcon } from '@/components/ui/icons'

const TEMA = temaDoModulo('ritual-noche-perfecta')

export interface BlocoApoio {
  bloco: NocheBloco
  audios: NocheAudio[]
}

interface Props {
  nivel: NocheNivel | null
  concluidas: number
  proximaNoche: number | null
  feitoHoje: boolean
  terminado: boolean
  total: number
  audioDeHoje: NocheAudio | null
  apoio: BlocoApoio[]
  resgate: NocheAudio | null
}

// Uma noite por vez, na ordem dos blocos. Os blocos de apoio ficam abaixo,
// fechados: ela abre quando precisar, sem atrapalhar o ritual do dia.
// Texto grande e um botão só — o público é 45-60+.
export function NocheRitual({
  nivel,
  concluidas,
  proximaNoche,
  feitoHoje,
  terminado,
  total,
  audioDeHoje,
  apoio,
  resgate,
}: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [tocou, setTocou] = useState(false)

  // Mantém a tela acesa enquanto ela ouve (fecha os olhos e não toca no
  // celular por 7 minutos).
  useEffect(() => {
    if (!tocou) return
    let lock: WakeLockSentinel | null = null
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: 'screen') => Promise<WakeLockSentinel> }
    }
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
            Son {total} noches, en bloques. Cada noche, un audio: te acuestas, cierras los ojos y
            lo dejas sonar. Quedarte dormida antes de que termine no es un error — es el objetivo.
            Al día siguiente se abre la noche siguiente.
          </p>
        </div>
        <Guia />
      </div>
    )
  }

  const noche = proximaNoche ?? total
  const bloco = blocoPorSlug(audioDeHoje?.bloco ?? null)
  const repeticoes = repeticoesDaNoche(nivel, noche)

  return (
    <div className="space-y-5">
      {terminado ? (
        <div className="rounded-3xl bg-sage-100 p-8 text-center">
          <p className="text-5xl">🌙</p>
          <p className="mt-3 text-2xl font-extrabold text-sage-600">
            ¡Completaste las {total} noches!
          </p>
          <p className="mt-2 text-base text-ink-700">
            Tu sueño tiene una nueva frecuencia. Sigue usando los audios cuando lo necesites.
          </p>
        </div>
      ) : (
        <>
          <header>
            <span className={`chip ${TEMA.chip}`}>
              {bloco ? `${bloco.nome} · ` : ''}Noche {noche} de {total}
            </span>
            <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
              {audioDeHoje?.titulo ?? 'Tu noche'}
            </h1>
            <p className="mt-1 text-base text-ink-700">
              {audioDeHoje?.descricao ?? bloco?.resumo ?? ''}
            </p>
          </header>

          <ProgressBar atual={concluidas} total={total} label="Tu avance" gradiente={TEMA.barra} />

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
            <section className="rounded-3xl bg-white p-5 shadow-card" onPointerDown={() => setTocou(true)}>
              <p className="text-base text-ink-700">
                Acuéstate, cierra los ojos y deja que el audio te lleve.
                {repeticoes === 2 && ' Esta noche se escucha dos veces.'}
              </p>

              {audioDeHoje ? (
                <div className="mt-4">
                  <AudioRemoto audio={audioDeHoje} />
                </div>
              ) : (
                <p className="mt-4 text-base font-semibold text-ink-900">
                  Estamos preparando el audio de esta noche. Vuelve en un rato 🤍
                </p>
              )}

              <button
                onClick={marcarNoche}
                disabled={salvando || !audioDeHoje}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-lg font-bold disabled:opacity-60 ${TEMA.botao}`}
              >
                <CheckIcon width={22} height={22} />
                {salvando ? 'Guardando…' : 'Marcar esta noche'}
              </button>
              {erro && <p className="mt-2 text-sm font-semibold text-brand-600">{erro}</p>}
            </section>
          )}
        </>
      )}

      {resgate && (
        <details className="rounded-3xl bg-white p-5 shadow-card">
          <summary className="cursor-pointer list-none text-lg font-bold text-ink-900">
            🌑 ¿Despertaste de madrugada?
          </summary>
          <p className="mt-2 text-base text-ink-700">
            No cuentes las horas que te quedan. Quédate acostada y escucha esto aquí mismo —
            las veces que lo necesites, sin cambiar tu avance.
          </p>
          <div className="mt-3">
            <AudioRemoto audio={resgate} />
          </div>
        </details>
      )}

      {apoio.map(({ bloco: b, audios }) => (
        <details key={b.slug} className="rounded-3xl bg-white p-5 shadow-card">
          <summary className="cursor-pointer list-none">
            <span className="text-lg font-bold text-ink-900">{b.nome}</span>
            {b.quando && <span className="block text-base text-ink-700">{b.quando}</span>}
          </summary>
          <p className="mt-2 text-base text-ink-700">{b.resumo}</p>
          <ul className="mt-3 space-y-3">
            {audios.map((a) => (
              <li key={a.id} className="border-t border-mist-200 pt-3 first:border-0 first:pt-0">
                <AudioRemoto audio={a} />
              </li>
            ))}
          </ul>
        </details>
      ))}

      <Guia />
    </div>
  )
}

// A guia em PDF: os blocos, como usar e as dúvidas mais comuns.
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
        <span className="block text-sm text-ink-700">Cómo usar el ritual y las dudas más comunes</span>
      </span>
    </a>
  )
}
