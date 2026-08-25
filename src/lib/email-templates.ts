// Templates de e-mail (HTML). Módulo PURO — sem 'server-only' — para ser
// reutilizado tanto pelas rotas de servidor (src/lib/email.ts) quanto pelos
// scripts de operação (supabase/*.ts). Não importe nada de servidor aqui.

const CORAL = '#E8896B'
const CREAM = '#FDFBF8'
const INK = '#39322D'

function shell(inner: string): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:${CREAM};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK};">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    ${inner}
    <p style="font-size:12px;color:#9b938c;text-align:center;margin-top:20px;">
      BodyMy · hecho con 🤍 para que te muevas a tu ritmo
    </p>
  </div>
</body>
</html>`
}

function botao(magicLink: string, label = 'ACCEDER A MI PROGRAMA'): string {
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
      <h1 style="font-size:22px;margin:14px 0 0;">¡Bienvenida a BodyMy, ${primeiroNome}!</h1>
    </div>
    <div style="background:#fff;border-radius:20px;padding:24px;box-shadow:0 2px 12px rgba(74,66,60,.08);">
      <p style="font-size:16px;line-height:1.5;margin:0 0 12px;">Qué alegría tenerte aquí. 🌷</p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 16px;">
        Tu acceso a <strong>${programaNome}</strong> ya está activo. Todo está pensado para caber en
        tu rutina — a tu tiempo, sin prisa y sin complicaciones.
      </p>
      <p style="font-size:16px;line-height:1.5;margin:0 0 8px;"><strong>Lo que vas a encontrar:</strong></p>
      <ul style="font-size:16px;line-height:1.6;margin:0 0 16px;padding-left:20px;color:${INK};">
        <li>Una guía del día, cortita y fácil de seguir</li>
        <li>Sugerencias de menú para apoyar tu alimentación</li>
        <li>Tu progreso registrado, para que veas cuánto avanzaste</li>
      </ul>
      <p style="font-size:16px;line-height:1.5;margin:0 0 4px;">
        Para entrar por primera vez solo toca el botón de abajo — <strong>sin contraseña</strong>:
      </p>
      ${botao(magicLink)}
      <div style="background:${CREAM};border-radius:14px;padding:14px 16px;margin-top:8px;">
        <p style="font-size:14px;line-height:1.6;margin:0 0 8px;color:#6b625b;">
          📲 <strong>Consejo:</strong> después de entrar, agrega BodyMy a la pantalla de tu celular
          (la app te muestra cómo) para abrirlo con un toque.
        </p>
        <p style="font-size:14px;line-height:1.6;margin:0;color:#6b625b;">
          🔑 <strong>Las próximas veces es aún más fácil:</strong> abre la app, escribe tu correo y
          recibes un <strong>código de 6 dígitos</strong> para escribirlo ahí mismo — sin salir de la app.
          Si quieres, también puedes crear una contraseña.
        </p>
      </div>
      <p style="font-size:14px;line-height:1.5;color:#6b625b;margin:16px 0 0;">
        Cualquier duda, solo responde este correo. Estamos contigo. 💛
      </p>
    </div>
  `)
}

