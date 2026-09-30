'use client'

import { PandaPlayer } from '@/components/lesson/PandaPlayer'

// Vídeo guiado de uma aula (10–20 min, com a voz da instrutora). Diferente do
// VideoBox dos exercícios: sem loop, com som e controles completos. Enquanto
// o vídeo não é cadastrado (panda_video_id NULL), mostra um aviso — nunca um
// player quebrado.
export function VideoAula({ videoId }: { videoId: string | null | undefined }) {
  if (videoId) return <PandaPlayer videoId={videoId} />
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-cream-200 bg-cream-100 px-4 text-center">
      <span className="text-3xl" aria-hidden>
        🎬
      </span>
      <p className="text-sm font-semibold text-ink-800">El video de hoy llega pronto</p>
      <p className="text-xs text-ink-700">Mientras tanto, sigue la guía de abajo, paso a paso.</p>
    </div>
  )
}
