'use client'

import { env } from '@/lib/env'

// Player do Panda Video via iframe responsivo (16:9).
// O app guarda apenas o panda_video_id; o host do player vem do env.
//
// Parâmetros de URL do Panda (player baseado em Plyr):
//   v         → id do vídeo (obrigatório)
//   autoplay  → 'true' | 'false'
//   muted     → 'true' | 'false'
//   controls  → lista (vírgula) dos controles EXIBIDOS: play-large, play,
//               progress, current-time, volume, captions, settings, pip,
//               fullscreen. (Deixar só 'play-large' remove todo o resto.)
//   loop      → NÃO documentado pelo Panda. Enviamos como tentativa, mas
//               pode ser ignorado — ver nota no componente VideoBox.
interface Props {
  videoId: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  /** Controles exibidos (allow-list, separados por vírgula). */
  controls?: string
}

// Aceita tanto o ID puro quanto (por engano) a URL de embed colada inteira.
export function normalizePandaId(raw: string): string {
  const v = (raw ?? '').trim()
  const m = v.match(/[?&]v=([^&\s]+)/)
  if (m) return decodeURIComponent(m[1])
  return v
}

export function PandaPlayer({ videoId, autoPlay = false, muted = false, loop = false, controls }: Props) {
  const host = env.pandaPlayerHost
  if (!host) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-3xl bg-cream-200 text-sm text-ink-700">
        Vídeo indisponível — configure NEXT_PUBLIC_PANDA_PLAYER_HOST.
      </div>
    )
  }

  const id = normalizePandaId(videoId)
  // Montado à mão para manter as vírgulas de `controls` literais (não %2C).
  const parts = [`v=${encodeURIComponent(id)}`]
  if (autoPlay) parts.push('autoplay=true')
  if (muted) parts.push('muted=true')
  if (loop) parts.push('loop=true')
  if (controls) parts.push(`controls=${controls}`)
  const src = `https://${host}/embed/?${parts.join('&')}`

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-black" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={src}
        title="Vídeo do exercício"
        loading="lazy"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}
