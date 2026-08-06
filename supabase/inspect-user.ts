/* eslint-disable no-console */
// =====================================================================
// BodyMy — Auditar TODOS os dados de uma usuária no banco.
// Imprime: auth.users, profile, entitlements, check-ins, aulas concluídas
// e entradas de progresso. Útil para conferir persistência e isolamento.
//
// Uso:  npm run inspect:user -- email@x.com
// Requer: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.
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

const email = process.argv.slice(2).find((a) => a.includes('@'))?.trim().toLowerCase()
if (!email) {
  console.error('Uso: npm run inspect:user -- email@exemplo.com')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findAuthUserByEmail(db: SupabaseClient, email: string) {
  for (let page = 1; page <= 50; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const m = data.users.find((u) => u.email?.toLowerCase() === email)
    if (m) return m
    if (data.users.length < 200) break
  }
  return null
}

function linha() {
  console.log('─'.repeat(52))
}

async function main() {
  await assertBodyMyDb(db)
  console.log(`\n🔎 Auditoria de: ${email}`)
  linha()

  const authUser = await findAuthUserByEmail(db, email!)
  if (!authUser) {
    console.log('auth.users .......... NÃO existe. (sem dados a mostrar)')
    return
  }
  const uid = authUser.id
  const confirmado = Boolean((authUser as { email_confirmed_at?: string }).email_confirmed_at)
  console.log(`auth.users id ....... ${uid}`)
  console.log(`e-mail confirmado ... ${confirmado ? 'SIM' : 'NÃO ⚠️'}`)
  console.log(`criado em ........... ${authUser.created_at}`)
  console.log(`último login ........ ${(authUser as { last_sign_in_at?: string }).last_sign_in_at ?? '—'}`)

  // profile
  linha()
  const { data: profile } = await db.from('profiles').select('*').eq('id', uid).maybeSingle()
  if (profile) {
    console.log(`profile ............. nome="${profile.nome ?? '—'}" is_admin=${profile.is_admin} onboarding=${profile.onboarding_completo}`)
    console.log(`quiz_data ........... ${JSON.stringify(profile.quiz_data ?? {})}`)
  } else {
    console.log('profile ............. NÃO existe ⚠️ (órfão em auth.users)')
  }

  // entitlements
  linha()
  const { data: ents } = await db
    .from('entitlements')
    .select('status, origem, kiwify_order_id, created_at, product:products(slug, nome)')
    .eq('user_id', uid)
  console.log(`entitlements ........ ${ents?.length ?? 0}`)
  for (const e of ents ?? []) {
    const p = e.product as unknown as { slug: string; nome: string }
    console.log(`   • ${p?.slug ?? '?'} — ${e.status} (${e.origem}) ${e.kiwify_order_id ?? ''}`)
  }

  // check-ins
  linha()
  const { data: checkins } = await db
    .from('checkins')
    .select('data, tipo')
    .eq('user_id', uid)
    .order('data', { ascending: false })
  console.log(`check-ins ........... ${checkins?.length ?? 0}`)
  const porTipo: Record<string, number> = {}
  for (const c of checkins ?? []) porTipo[c.tipo] = (porTipo[c.tipo] ?? 0) + 1
  if (checkins?.length) console.log(`   por tipo: ${JSON.stringify(porTipo)} | último: ${checkins[0].data}`)

  // aulas concluídas
  linha()
  const { data: comp } = await db
    .from('lesson_completions')
    .select('lesson_id, completed_at')
    .eq('user_id', uid)
  console.log(`aulas concluídas .... ${comp?.length ?? 0}`)

  // progresso
  linha()
  const { data: prog } = await db
    .from('progress_entries')
    .select('data, foto_path, medidas, peso, nota')
    .eq('user_id', uid)
    .order('data', { ascending: false })
  console.log(`progresso ........... ${prog?.length ?? 0} registro(s)`)
  for (const p of prog ?? []) {
    console.log(`   • ${p.data} | foto=${p.foto_path ? 'sim' : 'não'} | medidas=${JSON.stringify(p.medidas ?? {})} | peso=${p.peso ?? '—'}`)
  }

  linha()
  console.log('✓ Fim da auditoria.\n')
}

main().catch((err) => {
  console.error('✗ Erro:', err)
  process.exit(1)
})
