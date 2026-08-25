/* eslint-disable no-console */
// =====================================================================
// BodyMy — Conceder acesso manual a uma aluna (compra fora do fluxo Kiwify)
//
// Cria/normaliza o usuário e concede entitlement ATIVO (origem manual) de
// um produto. Idempotente. Cobre os 3 estados (não existe / órfão / completo).
//
// Uso:
//   npm run grant:access -- email@x.com "Nome Completo" [slug-do-produto] --confirm
//
// - slug-do-produto é opcional (padrão: drenagem-tailandesa)
// - --confirm é OBRIGATÓRIO (roda contra PRODUÇÃO). Sem ele, o script só
//   mostra o que faria e não altera nada.
//
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (do .env.local).
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

// --- Parse dos argumentos -------------------------------------------
const rawArgs = process.argv.slice(2)
const confirm = rawArgs.includes('--confirm')
// Senha opcional via --senha=VALOR (extraída antes do resto p/ não colidir
// com o slug). Sem ela, a aluna entra por código (OTP), como de costume.
const senhaFlag = rawArgs.find((a) => a.startsWith('--senha='))
const senha = senhaFlag ? senhaFlag.slice('--senha='.length) : null
const args = rawArgs.filter((a) => a !== '--confirm' && !a.startsWith('--senha='))

const email = args.find((a) => a.includes('@'))?.trim().toLowerCase()
const resto = args.filter((a) => a !== args.find((x) => x.includes('@')))
// slug = argumento todo minúsculo com hífens/letras (nomes são capitalizados
// e têm espaço, então não colidem). Default: drenagem-tailandesa.
const slug = resto.find((a) => /^[a-z0-9][a-z0-9-]*$/.test(a)) ?? 'drenagem-tailandesa'
const nome = resto.filter((a) => a !== slug).join(' ').trim()

if (senha && senha.length < 6) {
  console.error('✗ A senha precisa ter pelo menos 6 caracteres (regra do Supabase).')
  process.exit(1)
}

if (!email || !nome) {
  console.error('Uso: npm run grant:access -- email@x.com "Nome Completo" [slug-do-produto] --confirm')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

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
  console.log('\n=== Conceder acesso manual ===')
  console.log(`  E-mail:  ${email}`)
  console.log(`  Nome:    ${nome}`)
  console.log(`  Produto: ${slug}`)
  console.log(`  Banco:   ${SUPABASE_URL}\n`)

  if (!confirm) {
    console.log('⚠ Nada foi alterado. Isto roda contra PRODUÇÃO.')
    console.log('  Confirme adicionando --confirm ao final do comando para executar de verdade.\n')
    process.exit(0)
  }

  // Guard: garante que é mesmo o banco do BodyMy.
  await assertBodyMyDb(db)

  // Produto precisa existir.
  const { data: product, error: prodErr } = await db
    .from('products')
    .select('id, nome')
    .eq('slug', slug)
    .maybeSingle()
  if (prodErr) throw prodErr
  if (!product) {
    console.error(`✗ Produto "${slug}" não encontrado. Confira o slug (ex.: drenagem-tailandesa).`)
    process.exit(1)
  }

  // 1) Cria ou localiza o usuário (e-mail confirmado garantido).
  let userId: string
  const existente = await findAuthUserByEmail(db, email!)
  if (existente) {
    userId = existente.id
    const { error } = await db.auth.admin.updateUserById(userId, {
      email_confirm: true,
      ...(senha ? { password: senha } : {}),
      user_metadata: { ...(existente.user_metadata ?? {}), nome },
    })
    if (error) throw error
    console.log(`• Usuário já existia (${userId}) — e-mail confirmado${senha ? ' + senha definida' : ''}.`)
  } else {
    const { data: created, error } = await db.auth.admin.createUser({
      email: email!,
      email_confirm: true,
      ...(senha ? { password: senha } : {}),
      user_metadata: { nome },
    })
    if (error) throw error
    userId = created.user.id
    console.log(`• Usuário criado (${userId})${senha ? ' com senha' : ''}.`)
  }

  // 2) Profile (is_admin=false).
  const { error: profErr } = await db.from('profiles').upsert(
    { id: userId, nome, email: email!, is_admin: false, onboarding_completo: false },
    { onConflict: 'id' },
  )
  if (profErr) throw profErr
  console.log(`✓ Profile "${nome}" (is_admin=false)`)

  // 3) Entitlement ativo (origem manual). Idempotente por (user_id, product_id).
  const { error: entErr } = await db.from('entitlements').upsert(
    {
      user_id: userId,
      product_id: product.id,
      origem: 'manual',
      kiwify_order_id: 'grant-access',
      status: 'ativo',
    },
    { onConflict: 'user_id,product_id' },
  )
  if (entErr) throw entErr
  console.log(`✓ Entitlement ativo (manual) de ${product.nome}`)

  // 4) Verificação idêntica à do login (/api/auth/magic-link).
  const { data: profileByEmail } = await db
    .from('profiles')
    .select('id')
    .eq('email', email!)
    .maybeSingle()
  let encontravel = Boolean(profileByEmail)
  if (!encontravel) encontravel = Boolean(await findAuthUserByEmail(db, email!))

  console.log(`\nVERIFICAÇÃO: usuário encontrável pelo login? ${encontravel ? 'SIM' : 'NÃO'}`)
  if (!encontravel) {
    throw new Error(
      'Divergência: usuário não encontrável pela busca do login. Verifique o e-mail no profile.',
    )
  }

  console.log(`→ Pronto! ${nome} já pode entrar em /login com ${email}.`)
  console.log(`  (Para avisá-la com o e-mail de boas-vindas: npm run send:welcome -- ${email})\n`)
}

main().catch((err) => {
  console.error('✗ Erro:', err)
  process.exit(1)
})
