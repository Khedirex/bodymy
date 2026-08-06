import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Reenvia o e-mail de boas-vindas (com link de acesso) para a aluna.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const { alunaId } = (await request.json().catch(() => ({}))) as { alunaId?: string }
  if (!alunaId) return NextResponse.json({ error: 'faltam_parametros' }, { status: 400 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('nome, email')
    .eq('id', alunaId)
    .maybeSingle()
  const email = profile?.email as string | undefined
  if (!email) return NextResponse.json({ error: 'aluna_sem_email' }, { status: 400 })

  // Nome do programa liberado (para o corpo do e-mail).
  let programaNome = 'seu programa'
  const { data: ents } = await admin
    .from('entitlements')
    .select('product:products(id, nome)')
    .eq('user_id', alunaId)
    .eq('status', 'ativo')
  const prodId = (ents?.[0]?.product as unknown as { id?: string })?.id
  if (prodId) {
    const { data: prog } = await admin
      .from('programs')
      .select('nome')
      .eq('product_id', prodId)
      .maybeSingle()
    programaNome =
      (prog?.nome as string) ??
      ((ents?.[0]?.product as unknown as { nome?: string })?.nome ?? programaNome)
  }

  // Gera o magic link.
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${env.appUrl}/auth/callback?next=/bem-vinda` },
  })
  if (linkErr || !linkData.properties?.action_link) {
    return NextResponse.json({ error: 'erro_ao_gerar_link' }, { status: 500 })
  }

  const envio = await sendWelcomeEmail({
    to: email,
    nome: (profile?.nome as string) ?? null,
    programaNome,
    magicLink: linkData.properties.action_link,
  })

  await adminLog({
    adminId: guard.info.adminId,
    acao: 'reenviar_email_acesso',
    alvoTipo: 'aluna',
    alvoId: alunaId,
    detalhes: { email, enviado: envio.ok },
  })

  if (!envio.ok) {
    const motivo = envio.skipped ? 'resend_nao_configurado' : envio.message
    return NextResponse.json({ error: `email_nao_enviado:${motivo}` }, { status: 502 })
  }
  return NextResponse.json({ ok: true, mensagem: 'E-mail de acesso reenviado.' })
}
