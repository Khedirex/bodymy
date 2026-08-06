import 'server-only'
import { Resend } from 'resend'
import { serverEnv } from '@/lib/env'

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

function magicLinkHtml({
  primeiroNome,
  magicLink,
}: {
  primeiroNome: string
  magicLink: string
}) {
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FDFBF8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#39322D;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(74,66,60,.08);">
      <p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Oi, ${primeiroNome}!</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 20px;">
        Aqui está o seu link de acesso ao BodyMy. É só tocar no botão abaixo — sem senha.
      </p>
      <div style="text-align:center;margin:26px 0;">
        <a href="${magicLink}" style="display:inline-block;background:#E8896B;color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:16px 28px;border-radius:16px;">
          ACESSAR MEU PROGRAMA
        </a>
      </div>
      <p style="font-size:14px;line-height:1.5;color:#6b625b;margin:0;">
        Se você não pediu este acesso, pode ignorar este e-mail. O link expira em breve.
      </p>
    </div>
  </div>
</body>
</html>`
}

function welcomeHtml({
  primeiroNome,
  programaNome,
  magicLink,
}: {
  primeiroNome: string
  programaNome: string
  magicLink: string
}) {
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FDFBF8;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#39322D;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:16px;background:#E8896B;color:#fff;font-size:26px;">🤍</div>
      <h1 style="font-size:22px;margin:14px 0 0;">Bem-vinda ao BodyMy!</h1>
    </div>
    <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(74,66,60,.08);">
      <p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Oi, ${primeiroNome}!</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 20px;">
        Sua compra foi confirmada e o seu programa <strong>${programaNome}</strong> já está liberado.
        É só tocar no botão abaixo para acessar — sem senha, direto pelo seu celular.
      </p>
      <div style="text-align:center;margin:26px 0;">
        <a href="${magicLink}" style="display:inline-block;background:#E8896B;color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:16px 28px;border-radius:16px;">
          ACESSAR MEU PROGRAMA
        </a>
      </div>
      <p style="font-size:14px;line-height:1.5;color:#6b625b;margin:0;">
        Dica: depois de entrar, adicione o BodyMy à tela do seu celular para abrir como um aplicativo.
      </p>
    </div>
    <p style="font-size:12px;color:#9b938c;text-align:center;margin-top:20px;">
      Se você não fez esta compra, pode ignorar este e-mail.
    </p>
  </div>
</body>
</html>`
}
