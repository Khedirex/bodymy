import 'server-only'
import { Resend } from 'resend'
import { serverEnv } from '@/lib/env'

// E-mail transacional de boas-vindas com o link mágico de acesso.
export async function sendWelcomeEmail(params: {
  to: string
  nome: string | null
  programaNome: string
  magicLink: string
}) {
  const { to, nome, programaNome, magicLink } = params
  const apiKey = serverEnv.resendApiKey
  if (!apiKey) {
    // Em dev sem Resend, apenas logamos o link para poder testar o fluxo.
    // eslint-disable-next-line no-console
    console.warn(`[email] RESEND_API_KEY ausente. Link de acesso para ${to}:\n${magicLink}`)
    return { skipped: true as const }
  }

  const resend = new Resend(apiKey)
  const primeiroNome = (nome ?? '').split(' ')[0] || 'tudo pronto'

  const { data, error } = await resend.emails.send({
    from: serverEnv.resendFrom,
    to,
    subject: 'Seu acesso ao BodyMy está pronto 🤍',
    html: welcomeHtml({ primeiroNome, programaNome, magicLink }),
  })

  if (error) throw error
  return { id: data?.id }
}

// E-mail de login: link mágico para acessar (usuária já é cliente).
// Retorna { skipped: true } se o Resend não estiver configurado.
export async function sendMagicLinkEmail(params: {
  to: string
  nome: string | null
  magicLink: string
}) {
  const { to, nome, magicLink } = params
  const apiKey = serverEnv.resendApiKey
  if (!apiKey) {
    return { skipped: true as const }
  }

  const resend = new Resend(apiKey)
  const primeiroNome = (nome ?? '').split(' ')[0] || 'tudo pronto'

  const { data, error } = await resend.emails.send({
    from: serverEnv.resendFrom,
    to,
    subject: 'Seu link de acesso ao BodyMy 🤍',
    html: magicLinkHtml({ primeiroNome, magicLink }),
  })
  if (error) throw error
  return { id: data?.id }
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
