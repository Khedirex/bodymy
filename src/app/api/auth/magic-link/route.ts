import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendMagicLinkEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// =====================================================================
// Envio do magic link de LOGIN, feito no servidor para termos controle
// total do fluxo e distinguir claramente os erros:
//   - usuário não existe (não comprou)        -> 404 { erro: 'nao_encontrado' }
//   - falha ao GERAR o link (Supabase Auth)    -> 502 { erro: 'geracao_link' }
//   - falha ao ENVIAR o e-mail (Resend)        -> 502 { erro: 'envio_email' }
//
// Fallback de dev: com DEV_TOOLS_ENABLED=true, o link é impresso no
// console do servidor para permitir login sem depender do e-mail.
// =====================================================================
export async function POST(request: NextRequest) {
  let body: { email?: string; next?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ erro: 'json_invalido' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase()
  const next = body.next && body.next.startsWith('/') ? body.next : '/'
  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ erro: 'email_invalido' }, { status: 400 })
  }

  let admin: ReturnType<typeof createAdminClient>
  try {
    admin = createAdminClient()
  } catch (err) {
    // Ex: SUPABASE_SERVICE_ROLE_KEY ausente — é falha técnica NOSSA.
    captureException(err, { etapa: 'createAdminClient' })
    return NextResponse.json({ erro: 'config_servidor' }, { status: 500 })
  }

  // 1) O usuário existe? (não criamos conta no login — só quem comprou.)
  // IMPORTANTE: distinguir "consulta OK, sem linha" (não comprou → 404)
  // de "consulta falhou" (erro de banco → falha técnica, nunca 404).
  let nome: string | null = null
  let existe = false
  try {
    const { data: profile, error } = await admin
      .from('profiles')
      .select('id, nome')
      .eq('email', email)
      .maybeSingle()
    if (error) throw error
    if (profile) {
      existe = true
      nome = profile.nome ?? null
    } else {
      // Confirma no auth (caso exista sem profile), paginando.
      existe = await authUserExists(admin, email)
    }
  } catch (err) {
    captureException(err, { etapa: 'lookup_usuario', email })
    return NextResponse.json({ erro: 'consulta_falhou' }, { status: 502 })
  }

  if (!existe) {
    return NextResponse.json({ erro: 'nao_encontrado' }, { status: 404 })
  }

  // 2) Gera o magic link (camada Supabase Auth).
  let magicLink: string | undefined
  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${env.appUrl}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) throw error
    magicLink = data.properties?.action_link
  } catch (err) {
    captureException(err, { etapa: 'generateLink', email })
    return NextResponse.json({ erro: 'geracao_link' }, { status: 502 })
  }

  if (!magicLink) {
    return NextResponse.json({ erro: 'geracao_link' }, { status: 502 })
  }

  // Fallback de desenvolvimento: imprime o link no console do servidor.
  if (env.devToolsEnabled) {
    // eslint-disable-next-line no-console
    console.log(
      `\n[dev] 🔗 Magic link de acesso para ${email}:\n${magicLink}\n` +
        `(copie e cole no navegador para logar sem depender do e-mail)\n`,
    )
  }

  // 3) Envia o e-mail (camada Resend).
  try {
    const result = await sendMagicLinkEmail({ to: email, nome, magicLink })
    if ('skipped' in result && result.skipped) {
      // Sem Resend configurado. Em dev, o link já está no console → ok.
      if (env.devToolsEnabled) {
        return NextResponse.json({ ok: true, canal: 'console_dev' })
      }
      return NextResponse.json({ erro: 'envio_email', motivo: 'resend_nao_configurado' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, canal: 'email' })
  } catch (err) {
    captureException(err, { etapa: 'sendMagicLinkEmail', email })
    // Em dev, ainda dá pra logar pelo console → não bloqueia.
    if (env.devToolsEnabled) {
      return NextResponse.json({ ok: true, canal: 'console_dev', emailFalhou: true })
    }
    return NextResponse.json({ erro: 'envio_email' }, { status: 502 })
  }
}

async function authUserExists(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
): Promise<boolean> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) break
    if (data.users.some((u) => u.email?.toLowerCase() === email)) return true
    if (data.users.length < 200) break
  }
  return false
}
