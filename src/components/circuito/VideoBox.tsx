'use client'

import { PandaPlayer } from '@/components/lesson/PandaPlayer'

// Mostra o vídeo do Panda ou um placeholder informativo (nunca um erro)
// quando o vídeo ainda não foi cadastrado pelo admin.
export function VideoBox({ videoId }: { videoId: string | null | undefined }) {
  if (videoId) return <PandaPlayer videoId={videoId} />
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-cream-200 bg-cream-100 px-4 text-center">
      <span className="text-3xl" aria-hidden>
        🎬
      </span>
      <p className="text-sm font-semibold text-ink-800">Vídeo chegando em breve</p>
      <p className="text-xs text-ink-700">
        Siga pela descrição por enquanto — o vídeo será liberado logo.
      </p>
    </div>
  )
}
