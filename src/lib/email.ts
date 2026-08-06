import 'server-only'
import { Resend } from 'resend'
import { serverEnv } from '@/lib/env'
import { welcomeHtml, magicLinkHtml } from '@/lib/email-templates'

// Remetente de TESTE do Resend: funciona SEM verificar domínio, mas só
// entrega para o e-mail dono da conta Resend. Usado como fallback em dev
// quando RESEND_FROM não está configurado. Docs: https://resend.com/docs
const TEST_FROM = 'BodyMy <onboarding@resend.dev>'

export type EnvioResultado =
  | { ok: true; id: string | undefined; from: string }
  | { ok: false; skipped: true }
  | { ok: false; skipped: false; status?: number; name?: string; message: string }

// Decide o remetente. RESEND_FROM se configurado; senão o de teste.
function resolveFrom(): { from: string; testMode: boolean } {
  const configured = serverEnv.resendFrom
  if (configured) return { from: configured, testMode: false }
  return { from: TEST_FROM, testMode: true }
}

// Envio central com LOGS EXPLÍCITOS. Nunca engole a falha em silêncio.
async function enviar(params: {
  contexto: string
  to: string
  subject: string
  html: string
}): Promise<EnvioResultado> {
  const { contexto, to, subject, html } = params
  const apiKey = serverEnv.resendApiKey

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      `[email:${contexto}] RESEND_API_KEY VAZIA — e-mail NÃO enviado para ${to}. ` +
        `Preencha RESEND_API_KEY no .env.local (e reinicie).`,
    )
    return { ok: false, skipped: true }
  }

  const { from, testMode } = resolveFrom()
  // eslint-disable-next-line no-console
  console.log(
    `[email:${contexto}] enviando via Resend → from="${from}"${testMode ? ' (MODO TESTE: só entrega ao dono da conta Resend)' : ''}, to="${to}"`,
  )

  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send({ from, to, subject, html })

  if (error) {
    const e = error as { statusCode?: number; name?: string; message?: string }
    // eslint-disable-next-line no-console
    console.error(`[email:${contexto}] Resend FALHOU:`, {
      status: e.statusCode,
      name: e.name,
      message: e.message,
      raw: error,
    })
    const dica = dicaResend(e.statusCode, e.message)
    if (dica) {
      // eslint-disable-next-line no-console
      console.error(`[email:${contexto}] 💡 ${dica}`)
    }
    return {
      ok: false,
      skipped: false,
      status: e.statusCode,
      name: e.name,
      message: e.message ?? 'erro desconhecido do Resend',
    }
  }

  // eslint-disable-next-line no-console
  console.log(`[email:${contexto}] enviado ✓ id=${data?.id}`)
  return { ok: true, id: data?.id, from }
}

// Traduz os erros mais comuns do Resend numa instrução clara em pt-BR.
export function dicaResend(status: number | undefined, message: string | undefined): string | null {
  const m = (message ?? '').toLowerCase()
  // 403: modo de teste — só entrega ao e-mail dono da conta Resend.
  if (
    status === 403 ||
    m.includes('testing emails') ||
    m.includes('your own email') ||
    m.includes('only send')
  ) {
    return (
      'Modo de teste do Resend: o remetente onboarding@resend.dev só entrega para o ' +
      'E-MAIL DONO da conta Resend. Opções: (1) faça o teste enviando para o e-mail com ' +
      'que você criou a conta no Resend; ou (2) verifique um domínio (Resend → Domains), ' +
      'configure o DNS na Hostinger (SPF/DKIM/DMARC) e defina RESEND_FROM="Nome <email@seudominio>".'
    )
  }
  // 422: domínio inválido / não verificado no RESEND_FROM.
  if (status === 422 || m.includes('domain is invalid') || m.includes('not verified')) {
    return (
      'O domínio do RESEND_FROM não está verificado no Resend. Deixe RESEND_FROM vazio ' +
      '(usa onboarding@resend.dev) ou verifique um domínio (Resend → Domains) e use um ' +
      'e-mail desse domínio em RESEND_FROM.'
    )
  }
  if (status === 401 || m.includes('api key')) {
    return 'RESEND_API_KEY inválida. Copie a chave correta em Resend → API Keys.'
  }
  return null
}

// E-mail transacional de boas-vindas com o link mágico de acesso.
export async function sendWelcomeEmail(params: {
  to: string
  nome: string | null
  programaNome: string
  magicLink: string
}): Promise<EnvioResultado> {
  const { to, nome, programaNome, magicLink } = params
  const primeiroNome = (nome ?? '').split(' ')[0] || 'tudo pronto'
  return enviar({
    contexto: 'boas-vindas',
    to,
    subject: 'Seu acesso ao BodyMy está pronto 🤍',
    html: welcomeHtml({ primeiroNome, programaNome, magicLink }),
  })
}

// E-mail de login: link mágico para acessar (usuária já é cliente).
export async function sendMagicLinkEmail(params: {
  to: string
  nome: string | null
  magicLink: string
}): Promise<EnvioResultado> {
  const { to, nome, magicLink } = params
  const primeiroNome = (nome ?? '').split(' ')[0] || 'tudo pronto'
  return enviar({
    contexto: 'login',
    to,
    subject: 'Seu link de acesso ao BodyMy 🤍',
    html: magicLinkHtml({ primeiroNome, magicLink }),
  })
}
