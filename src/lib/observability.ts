import * as Sentry from '@sentry/nextjs'

// Wrapper fino sobre o Sentry. Se o Sentry não estiver inicializado
// (sem DSN), captureException é um no-op seguro — então podemos chamar
// livremente sem quebrar o app em dev.
export function captureException(error: unknown, context?: Record<string, unknown>) {
  // eslint-disable-next-line no-console
  console.error('[erro]', error, context ?? '')
  try {
    Sentry.captureException(error, context ? { extra: context } : undefined)
  } catch {
    // ignora — Sentry pode não estar inicializado
  }
}

export function captureMessage(message: string, context?: Record<string, unknown>) {
  try {
    Sentry.captureMessage(message, context ? { extra: context } : undefined)
  } catch {
    // ignora
  }
}
