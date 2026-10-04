'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatarDuracao, ORACIONES_UPSELL_SLUG, type OracionItem } from '@/lib/oraciones'
import { temaDoModulo } from '@/lib/modulo-tema'
import { PlayIcon, LockIcon } from '@/components/ui/icons'
import { FeedbackAudio } from '@/components/audio/FeedbackAudio'

const TEMA = temaDoModulo('oracion-milagrosa')

interface Props {
  itens: OracionItem[]
  liberados: number
  bloqueados: number
}

// Lista de oraciones. Um player por vez: ela toca uma, e tocar outra troca —
// duas vozes ao mesmo tempo na cama seria o oposto do produto.
//
// O que ela ainda não comprou aparece com cadeado, não escondido: é a
// vitrine do upsell, e ela vê exatamente o que falta.
export function OracionesLista({ itens, liberados, bloqueados }: Props) {
  const [tocando, setTocando] = useState<string | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [carregando, setCarregando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [terminou, setTerminou] = useState<string | null>(null)

  async function tocar(id: string) {
    if (tocando === id) {
      setTocando(null)
      setUrl(null)
      return
    }
    setErro(null)
    setTerminou(null)
    setCarregando(id)
    try {
      const res = await fetch('/api/oraciones/url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      const { url: assinada } = (await res.json()) as { url: string }
      setUrl(assinada)
      setTocando(id)
    } catch {
      setErro('No pudimos abrir esta oración. Inténtalo de nuevo.')
    } finally {
      setCarregando(null)
    }
  }

  return (
    <div className="space-y-5">
      <header>
        <span className={`chip ${TEMA.chip}`}>
          {liberados} {liberados === 1 ? 'oración tuya' : 'oraciones tuyas'}
        </span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">
          Oración Milagrosa
        </h1>
        <p className="mt-1 text-base text-ink-700">
          Para escuchar en la cama, con los ojos cerrados. Elige la que te haga falta hoy.
        </p>
      </header>

      {erro && <p className="text-base font-semibold text-brand-600">{erro}</p>}

      <ul className="space-y-3">
        {itens.map((o) => {
          const duracao = formatarDuracao(o.duracaoSeg)
          const ativa = tocando === o.id

          if (!o.liberado) {
            return (
              <li key={o.id}>
                <Link
                  href={`/oferta/${ORACIONES_UPSELL_SLUG}`}
                  className="flex items-center gap-3 rounded-3xl bg-white/70 p-4 shadow-card"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mist-200 text-ink-700/50">
                    <LockIcon width={20} height={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base font-bold text-ink-700/70">
                      {o.titulo}
                    </span>
                    <span className="block text-sm text-ink-700/60">Desbloquear</span>
                  </span>
                </Link>
              </li>
            )
          }

          return (
            <li key={o.id} className="rounded-3xl bg-white p-4 shadow-card">
              <button
                onClick={() => tocar(o.id)}
                className="flex w-full items-center gap-3 text-left"
                aria-expanded={ativa}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${TEMA.avatar}`}
                >
                  <PlayIcon width={22} height={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-bold text-ink-900">{o.titulo}</span>
                  <span className="block text-sm text-ink-700">
                    {carregando === o.id ? 'Abriendo…' : (duracao ?? 'Escuchar')}
                  </span>
                </span>
              </button>

              {ativa && url && (
                <>
                  <audio
                    src={url}
                    controls
                    autoPlay
                    preload="none"
                    onEnded={() => setTerminou(o.id)}
                    className="mt-3 w-full"
                  />
                  {terminou === o.id && <FeedbackAudio audioId={o.id} />}
                </>
              )}
            </li>
          )
        })}
      </ul>

      {bloqueados > 0 && (
        <section className="rounded-3xl bg-white p-5 shadow-card">
          <p className="text-lg font-extrabold text-ink-900">
            Te faltan {bloqueados} oraciones
          </p>
          <p className="mt-1 text-base text-ink-700">
            La colección completa se desbloquea de una vez, para siempre.
          </p>
          <Link
            href={`/oferta/${ORACIONES_UPSELL_SLUG}`}
            className={`mt-3 flex w-full items-center justify-center rounded-full py-4 text-lg font-bold ${TEMA.botao}`}
          >
            Ver la colección completa
          </Link>
        </section>
      )}
    </div>
  )
}
