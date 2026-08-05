'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

// Boundary global — captura erros de renderização e reporta ao Sentry.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDFBF8',
          fontFamily: 'system-ui, sans-serif',
          color: '#39322D',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 48 }} aria-hidden>
            🤍
          </div>
          <h1 style={{ fontSize: 22 }}>Algo saiu do lugar</h1>
          <p style={{ color: '#6b625b' }}>
            Tivemos um probleminha por aqui. Tente novamente.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: '#E8896B',
              color: '#fff',
              border: 0,
              borderRadius: 16,
              padding: '14px 24px',
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  )
}
