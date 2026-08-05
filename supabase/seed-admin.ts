/* eslint-disable no-console */
// =====================================================================
// BodyMy — Seed do usuário ADMIN / dono do projeto (comprador de teste)
//
// Cria khedirex@gmail.com como usuário real: perfil "Willian", e-mail
// confirmado, is_admin=true e entitlement ATIVO (origem manual) do
// produto Caminhada Japonesa.
//
// Uso:  npm run seed:admin
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
// Requer também que o produto "caminhada-japonesa" já exista
// (rode `npm run seed` antes, se ainda não rodou).
// =====================================================================

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar.')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = 'khedirex@gmail.com'
const ADMIN_NOME = 'Willian'
const PRODUTO_SLUG = 'caminhada-japonesa'

async function findUserIdByEmail(email: string): Promise<string | null> {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
    if (error) break
    const match = data.users.find((u) => u.email?.toLowerCase() === email)
    if (match) return match.id
    if (data.users.length < 200) break
  }
  return null
}

async function main() {
  console.log('→ Seed admin iniciado')

  // 1) Produto Caminhada Japonesa precisa existir.
  const { data: product, error: prodErr } = await db
    .from('products')
    .select('id, nome')
    .eq('slug', PRODUTO_SLUG)
    .maybeSingle()
  if (prodErr) throw prodErr
  if (!product) {
    console.error(
      `✗ Produto "${PRODUTO_SLUG}" não encontrado. Rode "npm run seed" primeiro.`,
    )
    process.exit(1)
  }

  // 2) Cria (ou localiza) o usuário de auth com e-mail confirmado.
  let userId: string | null = null
  const { data: created, error: createErr } = await db.auth.admin.createUser({
    email: ADMIN_EMAIL,
    email_confirm: true,
    user_metadata: { nome: ADMIN_NOME },
  })
  if (createErr) {
    userId = await findUserIdByEmail(ADMIN_EMAIL)
    if (!userId) throw createErr
    console.log('• Usuário admin já existia — atualizando.')
  } else {
    userId = created.user.id
    console.log('• Usuário admin criado.')
  }

  // 3) Profile: nome, e-mail, is_admin=true.
  const { error: profErr } = await db.from('profiles').upsert(
    {
      id: userId,
      nome: ADMIN_NOME,
      email: ADMIN_EMAIL,
      is_admin: true,
      onboarding_completo: false,
    },
    { onConflict: 'id' },
  )
  if (profErr) throw profErr
  console.log('✓ Profile "Willian" com is_admin=true')

  // 4) Entitlement ATIVO (origem manual) do Caminhada Japonesa.
  const { error: entErr } = await db.from('entitlements').upsert(
    {
      user_id: userId,
      product_id: product.id,
      origem: 'manual',
      kiwify_order_id: 'seed-admin',
      status: 'ativo',
    },
    { onConflict: 'user_id,product_id' },
  )
  if (entErr) throw entErr
  console.log(`✓ Entitlement ativo (manual) de ${product.nome}`)

  console.log(`→ Pronto! Faça login em /login com ${ADMIN_EMAIL} 🎉`)
}

main().catch((err) => {
  console.error('✗ Erro no seed admin:', err)
  process.exit(1)
})
