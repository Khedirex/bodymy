/* eslint-disable no-console */
// =====================================================================
// BodyMy — Diagnóstico de um e-mail
// Mostra o estado completo de um usuário: existe em auth.users? tem
// profile? tem entitlements? — útil para diagnosticar login rapidamente.
//
// Uso:  npm run whoami -- email@exemplo.com
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
// =====================================================================

import './load-env'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar.')
  process.exit(1)
}

// npm run whoami -- email@x.com  → o e-mail chega em argv.
const emailArg = process.argv.slice(2).find((a) => a.includes('@'))
if (!emailArg) {
  console.error('Uso: npm run whoami -- email@exemplo.com')
  process.exit(1)
}
const email = emailArg.trim().toLowerCase()

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
  console.log(`\n🔎 Diagnóstico de: ${email}\n${'─'.repeat(40)}`)

  // 1) auth.users
  const authUser = await findAuthUserByEmail(db, email)
  if (authUser) {
    const confirmado = Boolean(
      (authUser as { email_confirmed_at?: string }).email_confirmed_at,
    )
    console.log(`auth.users .......... SIM  (id: ${authUser.id})`)
    console.log(`  e-mail confirmado . ${confirmado ? 'SIM' : 'NÃO ⚠️'}`)
  } else {
    console.log('auth.users .......... NÃO')
  }

  // 2) profile
  const { data: profile } = await db
    .from('profiles')
    .select('id, nome, email, is_admin, onboarding_completo')
    .eq('email', email)
    .maybeSingle()
  if (profile) {
    console.log(`profile ............. SIM  (nome: ${profile.nome ?? '—'})`)
    console.log(`  is_admin .......... ${profile.is_admin ? 'SIM' : 'não'}`)
    console.log(`  onboarding_completo ${profile.onboarding_completo ? 'SIM' : 'não'}`)
    if (authUser && profile.id !== authUser.id) {
      console.log(`  ⚠️ id do profile (${profile.id}) != id do auth (${authUser.id})`)
    }
  } else {
    console.log('profile ............. NÃO' + (authUser ? '  ⚠️ (órfão: existe em auth mas sem profile)' : ''))
  }

  // 3) entitlements (do id do auth, se houver)
  const uid = authUser?.id ?? profile?.id
  if (uid) {
    const { data: ents } = await db
      .from('entitlements')
      .select('status, origem, product:products(slug, nome)')
      .eq('user_id', uid)
    if (ents && ents.length) {
      console.log(`entitlements ........ ${ents.length}`)
      for (const e of ents) {
        const p = e.product as unknown as { slug: string; nome: string }
        console.log(`  • ${p?.slug ?? '?'} — ${e.status} (${e.origem})`)
      }
    } else {
      console.log('entitlements ........ 0')
    }
  } else {
    console.log('entitlements ........ (sem usuário para consultar)')
  }

  // 4) Veredito do login (mesma lógica da rota /api/auth/magic-link)
  const encontravel = Boolean(profile) || Boolean(authUser)
  console.log('─'.repeat(40))
  console.log(`LOGIN encontraria este e-mail? ${encontravel ? '✅ SIM' : '❌ NÃO (retornaria "não encontramos uma compra")'}`)
}

main().catch((err) => {
  console.error('✗ Erro:', err)
  process.exit(1)
})
