/* eslint-disable no-console */
// =====================================================================
// BodyMy — Enviar o e-mail de BOAS-VINDAS (com link de acesso) para uma
// aluna já cadastrada. Mesmo template do webhook da Kiwify.
//
// Uso:
//   npm run send:welcome -- email@x.com --confirm
//
// - --confirm é OBRIGATÓRIO (envia e-mail real contra PRODUÇÃO).
// - O usuário precisa já existir (rode grant:access antes).
//
// Requer: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
//   Para entregar a QUALQUER endereço, RESEND_FROM deve ser de um domínio
//   verificado (ex.: "BodyMy <acesso@bodymy.com.br>").
// =====================================================================

import './load-env'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { assertBodyMyDb } from './guard-db'
import { welcomeHtml } from '../src/lib/email-templates'
import { sanitizeAppUrl, validateResendFrom } from '../scripts/env-rules.mjs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY
const TEST_FROM = 'BodyMy <onboarding@resend.dev>'

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar.')
  process.exit(1)
}

const rawArgs = process.argv.slice(2)
const confirm = rawArgs.includes('--confirm')
const email = rawArgs.find((a) => a.includes('@'))?.trim().toLowerCase()
if (!email) {
  console.error('Uso: npm run send:welcome -- email@x.com --confirm')
  process.exit(1)
}

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.error('✗ RESEND_API_KEY vazia. Preencha no .env.local e rode de novo.')
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
  const appUrl = sanitizeAppUrl(process.env.NEXT_PUBLIC_APP_URL) || 'http://localhost:3000'
  const rf = validateResendFrom(process.env.RESEND_FROM)
  const from = rf.valid && rf.value ? rf.value : TEST_FROM
  const testMode = from === TEST_FROM

  console.log('\n=== Enviar e-mail de boas-vindas ===')
  console.log(`  Para:      ${email}`)
  console.log(`  Remetente: ${from}${testMode ? '  (MODO TESTE — só entrega ao dono da conta Resend!)' : ''}`)
  console.log(`  App URL:   ${appUrl}`)
  console.log(`  Banco:     ${SUPABASE_URL}\n`)

  if (!rf.valid) console.warn(`⚠ ${rf.error}\n`)
  if (testMode) {
    console.warn(
      '⚠ RESEND_FROM não é de domínio verificado — a aluna provavelmente NÃO vai receber.\n' +
        '  Configure RESEND_FROM="BodyMy <acesso@bodymy.com.br>" para envio real.\n',
    )
  }

  if (!confirm) {
    console.log('⚠ Nada foi enviado. Adicione --confirm para disparar de verdade.\n')
    process.exit(0)
  }

  await assertBodyMyDb(db)

  // Usuário precisa existir.
  const user = await findAuthUserByEmail(db, email!)
  if (!user) {
    console.error(`✗ Usuário ${email} não encontrado. Rode "npm run grant:access" antes.`)
    process.exit(1)
  }

  // Nome (do profile) e nome do programa liberado (para o corpo do e-mail).
  const { data: profile } = await db
    .from('profiles')
    .select('nome')
    .eq('id', user.id)
    .maybeSingle()
  const nome = (profile?.nome as string) ?? (user.user_metadata?.nome as string) ?? null
  const primeiroNome = (nome ?? '').split(' ')[0] || 'tudo pronto'

  let programaNome = 'seu programa'
  const { data: ents } = await db
    .from('entitlements')
    .select('product:products(id, nome)')
    .eq('user_id', user.id)
    .eq('status', 'ativo')
  const prodId = (ents?.[0]?.product as unknown as { id: string })?.id
  if (prodId) {
    const { data: prog } = await db
      .from('programs')
      .select('nome')
      .eq('product_id', prodId)
      .maybeSingle()
    programaNome =
      (prog?.nome as string) ??
      ((ents?.[0]?.product as unknown as { nome: string })?.nome ?? programaNome)
  }

  // Magic link de acesso.
  const { data: linkData, error: linkErr } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email: email!,
    options: { redirectTo: `${appUrl}/auth/callback?next=/bem-vinda` },
  })
  if (linkErr) throw linkErr
  const magicLink = linkData.properties?.action_link
  if (!magicLink) throw new Error('Não foi possível gerar o link de acesso.')

  // Envia pelo Resend com o template de boas-vindas.
  const resend = new Resend(apiKey as string)
  const { data, error } = await resend.emails.send({
    from,
    to: email!,
    subject: 'Bem-vinda ao BodyMy! Seu acesso está pronto 🤍',
    html: welcomeHtml({ primeiroNome, programaNome, magicLink }),
  })

  if (error) {
    const e = error as { statusCode?: number; name?: string; message?: string }
    console.error('✗ Resend FALHOU:')
    console.error(`   status: ${e.statusCode ?? '(sem)'} | name: ${e.name} | message: ${e.message}`)
    if (e.statusCode === 403 || /testing emails|your own email|only send/i.test(e.message ?? '')) {
      console.error(
        '\n   💡 403 (modo teste): configure RESEND_FROM de um domínio verificado para enviar a qualquer aluna.',
      )
    } else if (e.statusCode === 422 || /domain is invalid|not verified/i.test(e.message ?? '')) {
      console.error('\n   💡 422: domínio do RESEND_FROM não verificado no Resend.')
    }
    process.exit(1)
  }

  console.log(`✓ E-mail enviado para ${email} (id=${data?.id})`)
  console.log(`  Programa citado: ${programaNome}`)
  console.log('  A aluna recebe o botão "ACESSAR MEU PROGRAMA" e a dica de instalar o app.\n')
}

main().catch((err) => {
  console.error('✗ Erro:', err)
  process.exit(1)
})
