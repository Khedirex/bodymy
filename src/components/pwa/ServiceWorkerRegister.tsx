'use client'

import { useEffect } from 'react'

// Registra o service worker (apenas em produção, para não atrapalhar o dev).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return
    }
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Falha de registro não deve quebrar o app.
      })
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return null
}
