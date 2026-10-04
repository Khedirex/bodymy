'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatarDuracao } from '@/lib/oraciones'
import type { BibliotecaConfig, ItemBiblioteca } from '@/lib/bibliotecas'
import { temaDoModulo } from '@/lib/modulo-tema'
import { PlayIcon, LockIcon } from '@/components/ui/icons'
import { FeedbackAudio } from '@/components/audio/FeedbackAudio'

interface Props {
  config: BibliotecaConfig
  itens: ItemBiblioteca[]
  bloqueados: number
}

// Lista de uma biblioteca de áudio. Um player por vez — duas vozes ao mesmo
// tempo na cama seria o oposto do produto. O que ela não comprou aparece com
// cadeado, não escondido: é a vitrine do upsell.
export function BibliotecaLista({ config, itens, bloqueados }: Props) {
  const tema = temaDoModulo(config.slug)
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
      const res = await fetch('/api/biblioteca/url', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      const { url: assinada } = (await res.json()) as { url: string }
      setUrl(assinada)
      setTocando(id)
    } catch {
      setErro('No pudimos abrir este audio. Inténtalo de nuevo.')
    } finally {
      setCarregando(null)
    }
  }

  // Agrupado por bloco quando a biblioteca tem blocos; senão, lista única.
  const grupos = config.blocos?.length
    ? config.blocos
        .map((b) => ({
          titulo: b.nome as string | null,
          quando: b.quando,
          itens: itens.filter((i) => i.bloco === b.slug),
        }))
        .filter((g) => g.itens.length > 0)
    : [{ titulo: null as string | null, quando: undefined as string | undefined, itens }]

  return (
    <div className="space-y-5">
      <header>
        <span className={`chip ${tema.chip}`}>{config.emoji} Tuyo</span>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-900">{config.nome}</h1>
        <p className="mt-1 text-base text-ink-700">{config.resumo}.</p>
      </header>

      {erro && <p className="text-base font-semibold text-brand-600">{erro}</p>}

      {itens.length === 0 ? (
        <div className="rounded-3xl bg-white p-6 text-center shadow-card">
          <p className="text-base font-semibold text-ink-900">Estamos preparando tus audios 🤍</p>
          <p className="mt-1 text-base text-ink-700">
            Aparecerán aquí en cuanto estén listos — no tienes que hacer nada.
          </p>
        </div>
      ) : (
        grupos.map((g) => (
          <section key={g.titulo ?? 'todos'}>
            {g.titulo && (
              <h2 className="section-title mb-2">
                {g.titulo}
                {g.quando && (
                  <span className="block text-base font-normal text-ink-700">{g.quando}</span>
                )}
              </h2>
            )}
            <ul className="space-y-3">
              {g.itens.map((o) => {
                const duracao = formatarDuracao(o.duracaoSeg)
                const ativa = tocando === o.id

                if (!o.liberado) {
                  return (
                    <li key={o.id}>
                      <Link
                        href="/descubra"
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
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tema.avatar}`}
                      >
                        <PlayIcon width={22} height={22} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-base font-bold text-ink-900">
                          {o.titulo}
                        </span>
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
          </section>
        ))
      )}

      {bloqueados > 0 && (
        <p className="text-center text-sm text-ink-700">
          {bloqueados} audio(s) de esta biblioteca pertenecen a otro producto.
        </p>
      )}
    </div>
  )
}
