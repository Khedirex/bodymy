// Acesso centralizado e tipado às variáveis de ambiente.
// Valores public* podem ir ao client; os demais SÓ em servidor.

function required(name: string, value: string | undefined): string {
  if (!value) {
    // Em build/prod queremos falhar cedo. Em dev deixamos passar com aviso
    // para permitir rodar telas sem todas as integrações configuradas.
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Variável de ambiente obrigatória ausente: ${name}`)
    }
    // eslint-disable-next-line no-console
    console.warn(`[env] ${name} não definida — usando valor vazio (dev).`)
    return ''
  }
  return value
}

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  pandaPlayerHost: process.env.NEXT_PUBLIC_PANDA_PLAYER_HOST ?? '',
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  sentryDsnPublic: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
  devToolsEnabled: process.env.DEV_TOOLS_ENABLED === 'true',
}

// Somente servidor — nunca importe estes em componentes client.
export const serverEnv = {
  get serviceRoleKey() {
    return required('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY)
  },
  get resendApiKey() {
    return required('RESEND_API_KEY', process.env.RESEND_API_KEY)
  },
  get resendFrom() {
    return process.env.RESEND_FROM ?? 'BodyMy <ola@bodymy.app>'
  },
  get kiwifyWebhookSecret() {
    return required('KIWIFY_WEBHOOK_SECRET', process.env.KIWIFY_WEBHOOK_SECRET)
  },
  get sentryDsn() {
    return process.env.SENTRY_DSN ?? ''
  },
}
