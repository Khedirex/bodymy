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
          background: '#FAFAFB',
          fontFamily: 'system-ui, sans-serif',
          color: '#37343F',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 48 }} aria-hidden>
            🤍
          </div>
          <h1 style={{ fontSize: 22 }}>Algo salió mal</h1>
          <p style={{ color: '#625F6B' }}>
            Tuvimos un problemita por aquí. Inténtalo de nuevo.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 16,
              background: '#7550AD',
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
