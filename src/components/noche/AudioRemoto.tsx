'use client'

import { useState } from 'react'
import { PlayIcon } from '@/components/ui/icons'
import { formatarDuracao, type NocheAudio } from '@/lib/noche'

// Player de um áudio do ritual. A URL é pedida só quando ela toca: o link é
// assinado e curto, então não faz sentido gerar 35 deles a cada carregamento.
export function AudioRemoto({
  audio,
  destaque = false,
  rota = '/api/noche/url',
}: {
  audio: NocheAudio
  /** Aberto já com o player à mostra (o áudio da noite). */
  destaque?: boolean
  rota?: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(false)

  async function abrir() {
    if (url || carregando) return
    setCarregando(true)
    setErro(false)
    try {
      const res = await fetch(rota, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: audio.id }),
      })
      if (!res.ok) throw new Error()
      const { url: assinada } = (await res.json()) as { url: string }
      setUrl(assinada)
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }

  const duracao = formatarDuracao(audio.duracaoSeg)

  if (url) {
    return (
      <div className={destaque ? '' : 'mt-2'}>
        <audio src={url} controls autoPlay={!destaque} preload="none" className="w-full" />
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={abrir}
        disabled={carregando}
        className="flex w-full items-center gap-3 text-left disabled:opacity-60"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ink-900 text-mist-50">
          <PlayIcon width={22} height={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-bold text-ink-900">{audio.titulo}</span>
          <span className="block text-sm text-ink-700">
            {carregando ? 'Abriendo…' : erro ? 'No se pudo abrir — toca otra vez' : (duracao ?? 'Escuchar')}
          </span>
        </span>
      </button>
    </div>
  )
}
