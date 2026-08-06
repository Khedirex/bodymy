// check:env — valida a configuração ANTES do dev server subir.
// Verifica: variáveis do Supabase presentes; URL do Supabase sem sufixo
// (/rest/v1); APP_URL sem wildcard (/**, /*); RESEND_FROM em formato
// aceito. Mensagens em pt-BR dizendo o valor correto esperado.
//
// Lê o .env.local (não versionado) e também process.env. Sai com código 1
// se algo estiver faltando/inválido. Nunca imprime valores secretos.
import { readFileSync, existsSync } from 'node:fs'
import {
  sanitizeSupabaseUrl,
  sanitizeAppUrl,
  validateOriginUrl,
  validateResendFrom,
  detectaSufixoIndevido,
} from './env-rules.mjs'

const LOCAL = '.env.local'
const OBRIGATORIAS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

function parseEnv(path) {
  const map = {}
  if (!existsSync(path)) return map
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim().replace(/^export\s+/, '')
    map[key] = line.slice(eq + 1)
  }
  return map
}

const env = parseEnv(LOCAL)
for (const k of Object.keys(process.env)) {
  if (env[k] === undefined && process.env[k] != null) env[k] = process.env[k]
}

const problemas = []
const avisos = []

// 1) Obrigatórias presentes
if (!existsSync(LOCAL) && !OBRIGATORIAS.every((k) => env[k])) {
  problemas.push(`Arquivo ${LOCAL} não encontrado. Rode "npm run setup:env" e preencha os valores.`)
}
for (const k of OBRIGATORIAS) {
  if (!(env[k] ?? '').trim()) problemas.push(`${k} está vazia.`)
}

// 2) URL do Supabase — avisa sufixo indevido e valida formato saneado
for (const a of detectaSufixoIndevido('NEXT_PUBLIC_SUPABASE_URL', env['NEXT_PUBLIC_SUPABASE_URL'])) avisos.push(a)
const supaUrl = sanitizeSupabaseUrl(env['NEXT_PUBLIC_SUPABASE_URL'])
if (supaUrl) {
  const err = validateOriginUrl(supaUrl, 'NEXT_PUBLIC_SUPABASE_URL', 'https://SEU-PROJETO.supabase.co')
  if (err) problemas.push(err)
}

// 3) APP_URL — avisa wildcard e valida (vazio é OK: cai no default/Codespace)
for (const a of detectaSufixoIndevido('NEXT_PUBLIC_APP_URL', env['NEXT_PUBLIC_APP_URL'])) avisos.push(a)
const appUrl = sanitizeAppUrl(env['NEXT_PUBLIC_APP_URL'])
if (appUrl) {
  const err = validateOriginUrl(appUrl, 'NEXT_PUBLIC_APP_URL', 'https://seu-dominio (ou o URL do Codespace)')
  if (err) problemas.push(err)
} else if (!env['CODESPACE_NAME']) {
  avisos.push('NEXT_PUBLIC_APP_URL vazia — usando http://localhost:3000 (ok em dev local).')
}

// 4) RESEND_FROM — formato aceito (vazio ou "Nome <email@dominio>")
const rf = validateResendFrom(env['RESEND_FROM'])
if (!rf.valid) {
  // não bloqueia o dev (o app cai no remetente de teste), mas avisa alto
  avisos.push(rf.error)
}

if (avisos.length) {
  console.warn('⚠ Avisos de configuração:')
  for (const a of avisos) console.warn(`   - ${a}`)
}

if (problemas.length) {
  console.error('\n✗ Configuração incompleta/ inválida:')
  for (const p of problemas) console.error(`   - ${p}`)
  console.error(
    '\n→ Corrija no .env.local e rode de novo. Valores esperados:\n' +
      '   NEXT_PUBLIC_SUPABASE_URL = https://SEU-PROJETO.supabase.co  (sem /rest/v1)\n' +
      '   NEXT_PUBLIC_APP_URL      = https://seu-dominio  (sem /**, ou vazio em dev)\n' +
      '   RESEND_FROM              = "Nome <email@dominio>"  (ou vazio p/ teste)\n',
  )
  process.exit(1)
}

if (avisos.length) {
  console.log(
    '✓ Ok para subir — os avisos acima são corrigidos automaticamente em runtime ' +
      '(sanitização defensiva). Ideal ajustar no .env.local mesmo assim.',
  )
} else {
  console.log('✓ Configuração de ambiente válida (Supabase, APP_URL, RESEND_FROM).')
}
