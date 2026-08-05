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
