// Templates de e-mail (HTML). Módulo PURO — sem 'server-only' — para ser
// reutilizado tanto pelas rotas de servidor (src/lib/email.ts) quanto pelos
// scripts de operação (supabase/*.ts). Não importe nada de servidor aqui.

const CORAL = '#E8896B'
const CREAM = '#FDFBF8'
const INK = '#39322D'

function shell(inner: string): string {
  return `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${CREAM};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    ${inner}
    <p style="font-size:12px;color:#9b938c;text-align:center;margin-top:20px;">
      BodyMy · feito com 🤍 para você se mover no seu ritmo
    </p>
  </div>
</body>
</html>`
}

function botao(magicLink: string, label = 'ACESSAR MEU PROGRAMA'): string {
  return `<div style="text-align:center;margin:26px 0;">
    <a href="${magicLink}" style="display:inline-block;background:${CORAL};color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:16px 28px;border-radius:16px;">
      ${label}
    </a>
  </div>`
}

// E-mail de BOAS-VINDAS (primeiro acesso). Acolhedor, linguagem simples,
// sem jargão fitness. Público: mulheres 35–55.
export function welcomeHtml({
  primeiroNome,
  programaNome,
  magicLink,
}: {
  primeiroNome: string
  programaNome: string
  magicLink: string
}): string {
  return shell(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:16px;background:${CORAL};color:#fff;font-size:26px;">🤍</div>
      <h1 style="font-size:22px;margin:14px 0 0;">Bem-vinda ao BodyMy, ${primeiroNome}!</h1>
    </div>
    <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(74,66,60,.08);">
      <p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Que alegria ter você aqui. 🌷</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">
        Seu acesso ao <strong>${programaNome}</strong> já está liberado. É tudo pensado para caber na
        sua rotina — no seu tempo, sem pressa e sem complicação.
      </p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 8px;"><strong>O que você vai encontrar:</strong></p>
      <ul style="font-size:16px;line-height:1.6;margin:0 0 16px;padding-left:20px;color:${INK};">
        <li>Uma orientação do dia, curtinha e fácil de seguir</li>
        <li>Sugestões de cardápio para apoiar sua alimentação</li>
        <li>Seu progresso registrado, para você ver o quanto avançou</li>
      </ul>
      <p style="font-size:16px;line-height:1.5;margin:0 0 4px;">
        Para entrar é só tocar no botão abaixo — <strong>sem senha</strong>, direto pelo seu celular:
      </p>
      ${botao(magicLink)}
      <div style="background:${CREAM};border-radius:14px;padding:14px 16px;margin-top:8px;">
        <p style="font-size:14px;line-height:1.5;margin:0;color:#6b625b;">
          💡 <strong>Dica:</strong> depois de entrar, adicione o BodyMy à tela do seu celular para
          abrir como um aplicativo, com um toque. O app te mostra como fazer no primeiro acesso.
        </p>
      </div>
      <p style="font-size:14px;line-height:1.5;color:#6b625b;margin:16px 0 0;">
        Qualquer dúvida, é só responder este e-mail. Estamos com você. 💛
      </p>
    </div>
  `)
}

// E-mail de LOGIN (link de acesso para quem já é aluna).
export function magicLinkHtml({
  primeiroNome,
  magicLink,
}: {
  primeiroNome: string
  magicLink: string
}): string {
  return shell(`
    <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(74,66,60,.08);">
      <p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Oi, ${primeiroNome}!</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 20px;">
        Aqui está o seu link de acesso ao BodyMy. É só tocar no botão abaixo — sem senha.
      </p>
      ${botao(magicLink)}
      <p style="font-size:14px;line-height:1.5;color:#6b625b;margin:0;">
        Se você não pediu este acesso, pode ignorar este e-mail. O link expira em breve.
      </p>
    </div>
  `)
}
