// Acesso centralizado e tipado às variáveis de ambiente.
// Valores public* podem ir ao client; os demais SÓ em servidor.
//
// Sanitização DEFENSIVA em runtime: erros comuns de cópia (sufixos do
// painel do Supabase, wildcards, barras, aspas, espaços) são removidos
// automaticamente aqui — não só no check:env.
// As regras abaixo são espelhadas em scripts/env-rules.mjs (usado pelo
// check:env). Se mudar aqui, atualize lá.

function clean(raw: string | undefined): string {
  return (raw ?? '').trim().replace(/^["']|["']$/g, '')
}

// URL do Supabase: remove sufixo /rest/v1(/) e barra(s) final(is).
export function sanitizeSupabaseUrl(raw: string | undefined): string {
  let s = clean(raw)
  if (!s) return ''
  s = s.replace(/\/rest\/v1\/?$/i, '')
  s = s.replace(/\/+$/, '')
  return s
}

// URL base do app: remove wildcards do painel do Supabase (/**, /*),
// query/hash acidental e barra(s) final(is).
export function sanitizeAppUrl(raw: string | undefined): string {
  let s = clean(raw)
  if (!s) return ''
  s = s.replace(/[?#].*$/, '') // remove query/fragment acidental
  s = s.replace(/\/\*\*$/, '').replace(/\/\*$/, '') // remove /** ou /*
  s = s.replace(/\/+$/, '') // remove barra(s) final(is)
  return s
}

// Valida uma origem http(s) sem path/wildcard. Retorna msg de erro ou null.
export function validateOriginUrl(
  url: string,
  nome: string,
  exemplo: string,
): string | null {
  if (!url) return `${nome} está vazia. Esperado: ${exemplo}`
  if (!/^https?:\/\/[^/\s?#*]+$/i.test(url)) {
    return `${nome} inválida: "${url}". Esperado: ${exemplo} (sem caminho, sem /**, sem barra final).`
  }
  return null
}

// Resolve a URL base para redirects, com detecção de Codespaces.
// Se CODESPACE_NAME existir e a APP_URL estiver ausente/localhost, monta
// https://<codespace>-3000.<domínio de forwarding>.
export function resolveAppUrl(): string {
  const raw = sanitizeAppUrl(process.env.NEXT_PUBLIC_APP_URL)
  const isLocalOrEmpty =
    !raw || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw)

  const codespace = process.env.CODESPACE_NAME
  if (codespace && isLocalOrEmpty) {
    const domain =
      process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev'
    return `https://${codespace}-3000.${domain}`
  }
  return raw || 'http://localhost:3000'
}

// Valida o formato do RESEND_FROM. Aceita vazio (usa remetente de teste)
// ou "Nome <email@dominio>".
export function validateResendFrom(raw: string | undefined): {
  value: string
  valid: boolean
  error?: string
} {
  const v = clean(raw)
  if (!v) return { value: '', valid: true }
  const ok = /^[^<>]+<[^<>@\s]+@[^<>@\s]+\.[^<>@\s]+>$/.test(v)
  if (ok) return { value: v, valid: true }
  return {
    value: v,
    valid: false,
    error:
      `RESEND_FROM inválido: "${v}". Esperado: Nome <email@dominio> ` +
      `(ex.: BodyMy <ola@seudominio.com>), ou vazio para usar o remetente de teste.`,
  }
}

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
  supabaseUrl: sanitizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  appUrl: resolveAppUrl(),
  pandaPlayerHost: process.env.NEXT_PUBLIC_PANDA_PLAYER_HOST ?? '',
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '',
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
  sentryDsnPublic: process.env.NEXT_PUBLIC_SENTRY_DSN ?? '',
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
  devToolsEnabled: process.env.DEV_TOOLS_ENABLED === 'true',
}

// ---------------------------------------------------------------------
// Validação amigável da configuração do Supabase.
// Em vez de quebrar com o erro genérico do supabase-js
// ("Your project's URL and Key are required..."), dizemos exatamente
// qual variável falta e onde preencher.
// ---------------------------------------------------------------------
export function assertSupabaseEnv(): { url: string; anonKey: string } {
  const faltando: string[] = []
  if (!env.supabaseUrl) faltando.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!env.supabaseAnonKey) faltando.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (faltando.length > 0) {
    const msg =
      `[BodyMy] Configuração do Supabase ausente: ${faltando.join(', ')}.\n` +
      `→ Preencha essas variáveis no arquivo .env.local (copie de .env.example) ` +
      `e reinicie o servidor (npm run dev).\n` +
      `Onde encontrar no painel do Supabase: Project Settings → API → ` +
      `"Project URL" (NEXT_PUBLIC_SUPABASE_URL) e "Project API keys → anon public" ` +
      `(NEXT_PUBLIC_SUPABASE_ANON_KEY).`
    // eslint-disable-next-line no-console
    console.error(msg)
    throw new Error(msg)
  }

  // Mesmo após sanear, a URL pode estar num formato inválido → falha clara.
  const erroUrl = validateOriginUrl(
    env.supabaseUrl,
    'NEXT_PUBLIC_SUPABASE_URL',
    'https://SEU-PROJETO.supabase.co',
  )
  if (erroUrl) {
    const msg = `[BodyMy] ${erroUrl}`
    // eslint-disable-next-line no-console
    console.error(msg)
    throw new Error(msg)
  }

  return { url: env.supabaseUrl, anonKey: env.supabaseAnonKey }
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
    // Vazio quando não configurado OU inválido — a camada de e-mail cai no
    // remetente de teste do Resend em vez de tentar enviar e falhar com 422.
    const { value, valid } = validateResendFrom(process.env.RESEND_FROM)
    return valid ? value : ''
  },
  get kiwifyWebhookSecret() {
    return required('KIWIFY_WEBHOOK_SECRET', process.env.KIWIFY_WEBHOOK_SECRET)
  },
  get sentryDsn() {
    return process.env.SENTRY_DSN ?? ''
  },
}
