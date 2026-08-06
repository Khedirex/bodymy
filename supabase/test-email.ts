/* eslint-disable no-console */
// =====================================================================
// BodyMy — Teste de envio de e-mail (Resend)
// Dispara um e-mail real e imprime o resultado DETALHADO do Resend, para
// validar a configuração sem depender do fluxo de login.
//
// Uso:  npm run test:email -- seu@email.com
// Requer: RESEND_API_KEY no .env.local. RESEND_FROM opcional (vazio =
//         remetente de teste onboarding@resend.dev).
// =====================================================================

import './load-env'
import { Resend } from 'resend'
// Regras de validação compartilhadas com o app (scripts/env-rules.mjs).
import { validateResendFrom } from '../scripts/env-rules.mjs'

const TEST_FROM = 'BodyMy <onboarding@resend.dev>'

const to = process.argv.slice(2).find((a) => a.includes('@'))
if (!to) {
  console.error('Uso: npm run test:email -- seu@email.com')
  process.exit(1)
}

const apiKey = process.env.RESEND_API_KEY
if (!apiKey) {
  console.error('✗ RESEND_API_KEY vazia. Preencha no .env.local e rode de novo.')
  process.exit(1)
}

const rf = validateResendFrom(process.env.RESEND_FROM)
if (!rf.valid) {
  console.warn(`⚠ ${rf.error}`)
  console.warn('  → usando o remetente de teste onboarding@resend.dev')
}
const from = rf.valid && rf.value ? rf.value : TEST_FROM
const testMode = from === TEST_FROM

async function main() {
  console.log(`\n📧 Enviando e-mail de teste`)
  console.log(`   from: ${from}${testMode ? '  (MODO TESTE — só entrega ao dono da conta Resend)' : ''}`)
  console.log(`   to:   ${to}\n`)

  const resend = new Resend(apiKey as string)
  const { data, error } = await resend.emails.send({
    from,
    to: to as string,
    subject: 'Teste de e-mail — BodyMy ✓',
    html: '<div style="font-family:sans-serif"><h2>Funcionou! 🎉</h2><p>Este é um e-mail de teste do BodyMy enviado pelo Resend. Se você recebeu isto, a configuração de envio está OK.</p></div>',
  })

  if (error) {
    const e = error as { statusCode?: number; name?: string; message?: string }
    console.error('✗ Resend FALHOU:')
    console.error(`   status:  ${e.statusCode ?? '(sem status)'}`)
    console.error(`   name:    ${e.name ?? '(sem name)'}`)
    console.error(`   message: ${e.message ?? '(sem message)'}`)
    console.error('\n   raw:', JSON.stringify(error))
    // Instruções de correção para os erros mais comuns
    const msg = (e.message ?? '').toLowerCase()
    if (e.statusCode === 403 || /testing emails|your own email|only send/.test(msg)) {
      console.error(
        '\n   💡 MODO DE TESTE (403): o onboarding@resend.dev só entrega para o E-MAIL DONO\n' +
          '      da conta Resend. Faça o teste enviando para esse endereço, OU verifique um\n' +
          '      domínio (Resend → Domains) + DNS na Hostinger e use RESEND_FROM do domínio.',
      )
    } else if (e.statusCode === 422 || /domain is invalid|not verified/.test(msg)) {
      console.error(
        '\n   💡 DOMÍNIO INVÁLIDO (422): o domínio do RESEND_FROM não está verificado.\n' +
          '      Deixe RESEND_FROM vazio (usa onboarding@resend.dev) ou verifique o domínio.',
      )
    } else if (e.statusCode === 401 || /api key/.test(msg)) {
      console.error('\n   💡 RESEND_API_KEY inválida — copie a chave correta em Resend → API Keys.')
    }
    process.exit(1)
  }

  console.log(`✓ Enviado com sucesso! id = ${data?.id}`)
  if (testMode) {
    console.log(
      '\n(Modo teste do Resend: o e-mail só chega se "' +
        to +
        '" for o endereço dono da conta Resend.\n' +
        ' Para enviar a qualquer endereço, verifique um domínio e ajuste o RESEND_FROM.)',
    )
  }
}

main().catch((err) => {
  console.error('✗ Erro inesperado:', err)
  process.exit(1)
})
