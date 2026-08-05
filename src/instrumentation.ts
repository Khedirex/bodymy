import * as Sentry from '@sentry/nextjs'

// Inicializa o Sentry no servidor/edge. No-op se SENTRY_DSN não estiver
// configurado — o app roda normalmente sem monitoramento em dev.
export async function register() {
  const dsn = process.env.SENTRY_DSN
  if (!dsn) return

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    })
  }
}
