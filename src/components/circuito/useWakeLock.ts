'use client'

import { useEffect, useRef } from 'react'

// Mantém a tela ligada durante a sessão (Screen Wake Lock API). O lock é
// perdido quando a aba fica oculta — reobtemos ao voltar. Liberado ao sair.
export function useWakeLock(ativo: boolean) {
  const ref = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!ativo) return
    let cancelado = false

    async function pedir() {
      try {
        if (!('wakeLock' in navigator) || ref.current) return
        const s = await navigator.wakeLock.request('screen')
        if (cancelado) {
          void s.release()
          return
        }
        ref.current = s
        s.addEventListener('release', () => {
          ref.current = null
        })
      } catch {
        /* sem suporte / negado — segue sem wake lock */
      }
    }

    function onVis() {
      if (document.visibilityState === 'visible') void pedir()
    }

    void pedir()
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelado = true
      document.removeEventListener('visibilitychange', onVis)
      try {
        void ref.current?.release()
      } catch {
        /* ignora */
      }
      ref.current = null
    }
  }, [ativo])
}
