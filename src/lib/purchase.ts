import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'
import { env } from '@/lib/env'
import { captureException } from '@/lib/observability'
import type { NormalizedKiwifyEvent } from '@/lib/kiwify'

export interface ProcessResult {
  status: 'ok' | 'ignorado' | 'produto_nao_encontrado'
  detail?: string
}

// =====================================================================
// Processa um evento de compra normalizado. É o coração do fluxo
// compra → conta → acesso. Usado tanto pelo webhook Kiwify quanto pela
// rota de simulação em dev. Deve ser idempotente no nível de dados
// (upserts + unique constraints).
// =====================================================================
export async function processPurchaseEvent(
  event: NormalizedKiwifyEvent,
): Promise<ProcessResult> {
  const admin = createAdminClient()

  // Localiza o produto pelo id da Kiwify.
  if (!event.kiwifyProductId) {
    return { status: 'ignorado', detail: 'sem product_id' }
  }
  const { data: product, error: prodErr } = await admin
    .from('products')
    .select('id, nome')
    .eq('kiwify_product_id', event.kiwifyProductId)
    .maybeSingle()

  if (prodErr) throw prodErr
  if (!product) {
    return { status: 'produto_nao_encontrado', detail: event.kiwifyProductId }
  }

  if (event.type === 'reembolso' || event.type === 'chargeback') {
    await revokeEntitlement(admin, event.email, product.id)
    return { status: 'ok', detail: `entitlement revogado (${event.type})` }
  }

  if (event.type !== 'compra_aprovada') {
    return { status: 'ignorado', detail: event.type }
  }

  if (!event.email) {
    return { status: 'ignorado', detail: 'sem email do cliente' }
  }

  // Encontra ou cria o usuário + profile.
  const userId = await findOrCreateUser(admin, event.email, event.nome)

  // Cria/reativa o entitlement (upsert por unique (user_id, product_id)).
  const { error: entErr } = await admin.from('entitlements').upsert(
    {
      user_id: userId,
      product_id: product.id,
      origem: 'kiwify',
      kiwify_order_id: event.orderId,
      status: 'ativo',
    },
    { onConflict: 'user_id,product_id' },
  )
  if (entErr) throw entErr

  // Gera magic link de acesso e envia o e-mail de boas-vindas.
  try {
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: event.email,
      options: {
        redirectTo: `${env.appUrl}/auth/callback?next=/bem-vinda`,
      },
    })
    if (linkErr) throw linkErr
    const magicLink = linkData.properties?.action_link
    if (magicLink) {
      await sendWelcomeEmail({
        to: event.email,
        nome: event.nome,
        programaNome: product.nome,
        magicLink,
      })
    }
  } catch (err) {
    // Não falhamos o processamento por causa do e-mail — o acesso já foi
    // concedido. Registramos para reenvio manual se necessário.
    captureException(err, { etapa: 'email_boas_vindas', email: event.email })
  }

  return { status: 'ok', detail: `acesso concedido a ${event.email}` }
}

async function findOrCreateUser(
  admin: SupabaseClient,
  email: string,
  nome: string | null,
): Promise<string> {
  // 1) Já temos um profile com este e-mail?
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (existingProfile) return existingProfile.id as string

  // 2) Tenta criar o usuário de auth (e-mail já confirmado).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: nome ? { nome } : {},
  })

  let userId: string
  if (createErr) {
    // Usuário de auth já existe mas sem profile — localiza paginando.
    const found = await findAuthUserByEmail(admin, email)
    if (!found) throw createErr
    userId = found
  } else {
    userId = created.user.id
  }

  // Garante o profile.
  const { error: profErr } = await admin.from('profiles').upsert(
    {
      id: userId,
      nome,
      email,
      onboarding_completo: false,
    },
    { onConflict: 'id' },
  )
  if (profErr) throw profErr

  return userId
}

async function findAuthUserByEmail(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  // supabase-js não oferece filtro por e-mail; paginamos com limite razoável.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) break
    const match = data.users.find((u) => u.email?.toLowerCase() === email)
    if (match) return match.id
    if (data.users.length < 200) break
  }
  return null
}

async function revokeEntitlement(
  admin: SupabaseClient,
  email: string | null,
  productId: string,
) {
  if (!email) return
  const { data: profile } = await admin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (!profile) return

  await admin
    .from('entitlements')
    .update({ status: 'revogado' })
    .eq('user_id', profile.id)
    .eq('product_id', productId)
}
