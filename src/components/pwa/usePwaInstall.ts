'use client'

import { useEffect, useState } from 'react'

export type Plataforma = 'ios' | 'android' | 'outro'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Detecta plataforma e captura o evento beforeinstallprompt (Android/Chrome).
export function usePwaInstall() {
  const [plataforma, setPlataforma] = useState<Plataforma>('outro')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [instalado, setInstalado] = useState(false)

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(ua)
    const isAndroid = /android/.test(ua)
    setPlataforma(isIOS ? 'ios' : isAndroid ? 'android' : 'outro')

    // Já instalado (rodando em standalone)?
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    setInstalado(Boolean(standalone))

    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstalado(true)

    window.addEventListener('beforeinstallprompt', onBIP)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function promptInstall() {
    if (!deferred) return false
    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    return choice.outcome === 'accepted'
  }

  return {
    plataforma,
    instalado,
    // Android/Chrome: podemos disparar o prompt nativo.
    podeInstalarNativo: Boolean(deferred),
    promptInstall,
  }
}
