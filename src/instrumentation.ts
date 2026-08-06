import * as Sentry from '@sentry/nextjs'
import { resolveAppUrl, validateResendFrom } from '@/lib/env'

// Roda uma vez no startup do servidor. Loga diagnósticos de ambiente e
// inicializa o Sentry (se configurado).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Qual URL base os magic links / redirects vão usar.
    // eslint-disable-next-line no-console
    console.log(`[BodyMy] URL base para redirects: ${resolveAppUrl()}`)

    // Aviso claro se RESEND_FROM estiver num formato inválido.
    const rf = validateResendFrom(process.env.RESEND_FROM)
    if (!rf.valid) {
      // eslint-disable-next-line no-console
      console.warn(
        `[BodyMy] ${rf.error}\n` +
          `        → usando o remetente de teste do Resend (onboarding@resend.dev).`,
      )
    }
  }

  const dsn = process.env.SENTRY_DSN
  if (!dsn) return
  // Só inicializa o Sentry no runtime Node (Server Components/rotas). NÃO
  // no Edge — para evitar qualquer incompatibilidade que possa afetar o
  // middleware (que roda no Edge). O middleware não usa Sentry mesmo.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    })
  }
}
