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
    // eslint-disable-next-line no-console
    console.error('[global-error]', { message: error.message, digest: error.digest })
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="es">
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
          <h1 style={{ fontSize: 22 }}>Algo salió mal</h1>
          <p style={{ color: '#6b625b' }}>
            Tuvimos un problemita por aquí. Inténtalo de nuevo.
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
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  )
}
