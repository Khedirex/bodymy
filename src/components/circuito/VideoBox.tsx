'use client'

import { PandaPlayer } from '@/components/lesson/PandaPlayer'

// Controles essenciais para um vídeo-demonstração: play/pause, ativar som
// (a aluna começa no mudo) e tela cheia. Some barra de progresso, compartilhar,
// legendas, configurações e picture-in-picture.
const CONTROLES_EXERCICIO = 'play-large,volume,fullscreen'

// Mostra o vídeo do Panda ou um placeholder informativo (nunca um erro)
// quando o vídeo ainda não foi cadastrado pelo admin.
//
// Vídeos de exercício: LOOP (repete enquanto a aluna executa), começam no
// MUDO (necessário para o autoplay funcionar nos navegadores móveis; ela
// ativa o som pelo controle de volume) e, quando `autoPlay`, já iniciam ao
// abrir o exercício. Muted + autoplay também garante execução "inline" no
// mobile, sem abrir em tela cheia sozinho.
export function VideoBox({
  videoId,
  autoPlay = false,
}: {
  videoId: string | null | undefined
  autoPlay?: boolean
}) {
  if (videoId) {
    return (
      <PandaPlayer
        videoId={videoId}
        loop
        muted
        autoPlay={autoPlay}
        controls={CONTROLES_EXERCICIO}
      />
    )
  }
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed border-cream-200 bg-cream-100 px-4 text-center">
      <span className="text-3xl" aria-hidden>
        🎬
      </span>
      <p className="text-sm font-semibold text-ink-800">Video disponible pronto</p>
      <p className="text-xs text-ink-700">
        Sigue la descripción por ahora — el video se desbloqueará pronto.
      </p>
    </div>
  )
}
