'use client'

import { env } from '@/lib/env'

// Player do Panda Video via iframe responsivo (16:9).
// O app guarda apenas o panda_video_id; o host do player vem do env.
export function PandaPlayer({ videoId }: { videoId: string }) {
  const host = env.pandaPlayerHost
  if (!host) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-3xl bg-cream-200 text-sm text-ink-700">
        Vídeo indisponível — configure NEXT_PUBLIC_PANDA_PLAYER_HOST.
      </div>
    )
  }
  const src = `https://${host}/embed/?v=${encodeURIComponent(videoId)}`
  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-black" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={src}
        title="Aula em vídeo"
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}
