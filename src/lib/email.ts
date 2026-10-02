import 'server-only'
import { Resend } from 'resend'
import { serverEnv } from '@/lib/env'
import { welcomeHtml, type GuiaEmail } from '@/lib/email-templates'
import { env } from '@/lib/env'
import { CISNE_PRODUCT_SLUG, CISNE_GUIA_PDF } from '@/lib/cisne'
import { NOCHE_PRODUCT_SLUG, NOCHE_GUIA_PDF, NOCHE_TOTAL_NOCHES } from '@/lib/noche'

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

  // Em produção o remetente de teste é um envio MORTO: o Resend responde 403
  // para qualquer destinatário que não seja o dono da conta. Tentar mesmo
  // assim foi o que transformou um RESEND_FROM mal formatado em meses de
  // compra sem e-mail. Agora a configuração errada grita em vez de falhar
  // parecendo um erro do Resend.
  if (testMode && process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.error(
      `[email:${contexto}] RESEND_FROM AUSENTE OU INVÁLIDO em produção — e-mail NÃO enviado para ${to}. ` +
        `Defina RESEND_FROM com um e-mail de domínio verificado (ex.: "BodyMy <no-reply@bodymy.online>") ` +
        `e REDEPLOY: variável nova só vale em deploy novo.`,
    )
    return {
      ok: false,
      skipped: false,
      status: 500,
      name: 'config_error',
      message: 'RESEND_FROM ausente ou inválido em produção (remetente de teste não entrega a clientes)',
    }
  }

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

// Conteúdo do e-mail POR PRODUTO: o que ela encontra no app e o guia em PDF.
//
// Sem isto, quem comprava o Ritual Noche Perfecta recebia os bullets padrão —
// que falam em "sugerencias de menú" — e nenhum PDF. Produto de sono vendido
// com texto de dieta: a aluna abria o e-mail e não reconhecia a compra dela.
function guiaDoProduto(produtoSlug: string | undefined): GuiaEmail | undefined {
  if (produtoSlug === CISNE_PRODUCT_SLUG) {
    return {
      emoji: '🦢',
      pdfUrl: `${env.appUrl}${CISNE_GUIA_PDF}`,
      itens: [
        'Cada día, tus <strong>4 movimientos</strong> en orden — 10 minutos, acostada en tu cama',
        'Dibujo, paso a paso, lo correcto, qué evitar y la opción <strong>“Más fácil”</strong>',
        'Al entrar, tócalo en <strong>Inicio → “Hoy”</strong> (o en la pestaña “Tu plan”)',
      ],
    }
  }

  if (produtoSlug === NOCHE_PRODUCT_SLUG) {
    return {
      emoji: '🌙',
      pdfUrl: `${env.appUrl}${NOCHE_GUIA_PDF}`,
      itens: [
        `<strong>${NOCHE_TOTAL_NOCHES} noches</strong>, una Vibración Nocturna de ~7 minutos cada noche`,
        'Te acuestas, cierras los ojos y el audio hace el resto — cada noche abre la siguiente',
        'Tu <strong>audio de rescate</strong> para cuando despiertes de madrugada, disponible siempre',
      ],
    }
  }

  return undefined
}

// E-mail transacional de boas-vindas com o link mágico de acesso.
export async function sendWelcomeEmail(params: {
  to: string
  nome: string | null
  programaNome: string
  magicLink: string
  produtoSlug?: string
}): Promise<EnvioResultado> {
  const { to, nome, programaNome, magicLink, produtoSlug } = params
  const primeiroNome = (nome ?? '').split(' ')[0] || ''
  const guia = guiaDoProduto(produtoSlug)
  return enviar({
    contexto: 'boas-vindas',
    to,
    subject: guia
      ? `Tu acceso a ${programaNome} ya está listo ${guia.emoji ?? '🤍'}`
      : 'Tu acceso a BodyMy ya está listo 🤍',
    html: welcomeHtml({ primeiroNome, programaNome, magicLink, guia }),
  })
}

