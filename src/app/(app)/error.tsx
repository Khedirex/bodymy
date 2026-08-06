'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ErrorState } from '@/components/ui/states'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Vai para o Sentry (se configurado) E para o console — que aparece
    // nos logs de Function da Vercel mesmo SEM Sentry DSN. Assim a causa
    // raiz fica visível em produção em vez de sumir.
    // eslint-disable-next-line no-console
    console.error('[app/error] render falhou:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="space-y-4 py-6">
      <ErrorState />
      <button onClick={reset} className="btn-primary w-full">
        Tentar novamente
      </button>
    </div>
  )
}
