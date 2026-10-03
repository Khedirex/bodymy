import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Reenvia o e-mail de acesso a partir da página de obrigado. Rota PÚBLICA:
// o e-mail vem da URL que a plataforma devolve depois da compra.
//
// Só envia para quem JÁ tem conta e acesso ativo, e a resposta é sempre a
// mesma — sem isso, a rota viraria um detector de "esta pessoa é cliente".
// O conteúdo vai para a caixa da dona do e-mail, então reenviar não entrega
// nada a quem digitou o endereço de outra pessoa.
export async function POST(request: NextRequest) {
  const { email: bruto } = (await request.json().catch(() => ({}))) as { email?: string }
  const email = (bruto ?? '').trim().toLowerCase()
  const resposta = NextResponse.json({ ok: true })

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return resposta

  try {
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from('profiles')
      .select('id, nome')
      .eq('email', email)
      .maybeSingle()
    if (!profile) return resposta

    const { data: ents } = await admin
      .from('entitlements')
      .select('product:products(nome, slug)')
      .eq('user_id', profile.id)
      .eq('status', 'ativo')
      .limit(1)
    const produto = ents?.[0]?.product as unknown as { nome?: string; slug?: string } | undefined
    if (!produto) return resposta

    const { data: link, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo: `${env.appUrl}/auth/callback?next=/bem-vinda` },
    })
    if (error || !link.properties?.action_link) throw error ?? new Error('link vazio')

    const envio = await sendWelcomeEmail({
      to: email,
      nome: (profile.nome as string) ?? null,
      programaNome: produto.nome ?? 'tu programa',
      magicLink: link.properties.action_link,
      produtoSlug: produto.slug,
    })

    // Carimba o resultado, igual ao fluxo da compra: assim a lista de
    // "compras sin correo de acceso" do painel continua dizendo a verdade.
    await admin
      .from('entitlements')
      .update(
        envio.ok
          ? { acesso_email_em: new Date().toISOString(), acesso_email_erro: null }
          : {
              acesso_email_erro: (envio.skipped
                ? 'resend_nao_configurado'
                : `resend_erro:${envio.status ?? '?'}:${envio.message}`
              ).slice(0, 500),
            },
      )
      .eq('user_id', profile.id)
      .eq('status', 'ativo')
  } catch (err) {
    captureException(err, { rota: 'obrigado_reenviar', email })
  }

  return resposta
}
