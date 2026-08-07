/* eslint-disable no-console */
// =====================================================================
// BodyMy — Seed do usuário ADMIN / dono do projeto (comprador de teste)
//
// Cria/normaliza khedirex@gmail.com em QUALQUER estado inicial:
//   (a) não existe em lugar nenhum
//   (b) existe em auth.users sem profile (órfão pós-reset)
//   (c) existe completo
// Resultado final garantido nos três casos:
//   auth user com e-mail confirmado + profile "Willian" (is_admin=true)
//   + entitlement ativo (origem manual) do pilates-somatico.
//
// Ao final, roda a MESMA busca que a rota /api/auth/magic-link usa e
// imprime "VERIFICAÇÃO: usuário encontrável pelo login? SIM/NÃO".
// Se NÃO, falha com erro explicando a divergência.
//
// Uso:  npm run seed:admin
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
// Requer que o produto "pilates-somatico" já exista (rode `npm run seed`).
// =====================================================================

import './load-env'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { assertBodyMyDb } from './guard-db'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar.')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const ADMIN_EMAIL = 'khedirex@gmail.com'.toLowerCase()
const ADMIN_NOME = 'Willian'
const PRODUTO_SLUG = 'pilates-somatico'

// Localiza um usuário de auth por e-mail (supabase-js não filtra por e-mail).
async function findAuthUserByEmail(db: SupabaseClient, email: string) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const match = data.users.find((u) => u.email?.toLowerCase() === email)
    if (match) return match
    if (data.users.length < 200) break
  }
  return null
}

async function main() {
  console.log('→ Seed admin iniciado')
  await assertBodyMyDb(db)

  // 0) Produto Pilates Somático precisa existir.
  const { data: product, error: prodErr } = await db
    .from('products')
    .select('id, nome')
    .eq('slug', PRODUTO_SLUG)
    .maybeSingle()
  if (prodErr) throw prodErr
  if (!product) {
    console.error(`✗ Produto "${PRODUTO_SLUG}" não encontrado. Rode "npm run seed" primeiro.`)
    process.exit(1)
  }

  // 1) Resolve o auth user cobrindo os 3 estados.
  let userId: string
  const existente = await findAuthUserByEmail(db, ADMIN_EMAIL)

  if (existente) {
    // (b) órfão ou (c) completo — garante e-mail confirmado + metadata.
    userId = existente.id
    const { error: upErr } = await db.auth.admin.updateUserById(userId, {
      email_confirm: true,
      user_metadata: { ...(existente.user_metadata ?? {}), nome: ADMIN_NOME },
    })
    if (upErr) throw upErr
    console.log(`• Usuário já existia em auth.users (${userId}) — e-mail confirmado garantido.`)
  } else {
    // (a) não existe — cria com e-mail confirmado.
    const { data: created, error: createErr } = await db.auth.admin.createUser({
      email: ADMIN_EMAIL,
      email_confirm: true,
      user_metadata: { nome: ADMIN_NOME },
    })
    if (createErr) throw createErr
    userId = created.user.id
    console.log(`• Usuário criado em auth.users (${userId}).`)
  }

  // 2) Profile "Willian" com is_admin=true (cria se órfão, atualiza se existe).
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

  // 3) Entitlement ATIVO (origem manual) do Pilates Somático.
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

  // 4) VERIFICAÇÃO — replica exatamente a busca da rota /api/auth/magic-link:
  //    primeiro profiles.by(email); se não achar, confirma em auth.users.
  const { data: profileByEmail, error: verifErr } = await db
    .from('profiles')
    .select('id, nome')
    .eq('email', ADMIN_EMAIL)
    .maybeSingle()
  if (verifErr) throw verifErr

  let encontravel = Boolean(profileByEmail)
  if (!encontravel) {
    encontravel = Boolean(await findAuthUserByEmail(db, ADMIN_EMAIL))
  }

  console.log(`\nVERIFICAÇÃO: usuário encontrável pelo login? ${encontravel ? 'SIM' : 'NÃO'}`)

  if (!encontravel) {
    throw new Error(
      'Divergência: o usuário não é encontrável pela busca do login. ' +
        `Verifique se o e-mail no profile bate exatamente com "${ADMIN_EMAIL}" ` +
        '(sem maiúsculas/espaços) e se o profile foi realmente criado.',
    )
  }

  console.log(`→ Pronto! Faça login em /login com ${ADMIN_EMAIL} 🎉`)
}

main().catch((err) => {
  console.error('✗ Erro no seed admin:', err)
  process.exit(1)
})
