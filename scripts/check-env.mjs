// check:env — valida se as variáveis do Supabase estão preenchidas ANTES
// do dev server, dando uma mensagem clara em vez do erro genérico do
// supabase-js ("Your project's URL and Key are required...").
//
// Lê o .env.local (não versionado). Sai com código 1 se algo estiver
// faltando/ inválido. Nunca imprime valores.
import { readFileSync, existsSync } from 'node:fs'

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
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    map[key] = val
  }
  return map
}

const env = parseEnv(LOCAL)
// Também aceita variáveis vindas do ambiente (ex: Vercel / ambiente remoto).
for (const k of OBRIGATORIAS) if (!env[k] && process.env[k]) env[k] = process.env[k].trim()

const problemas = []
if (!existsSync(LOCAL) && !OBRIGATORIAS.every((k) => process.env[k])) {
  problemas.push(`Arquivo ${LOCAL} não encontrado. Rode "npm run setup:env" e preencha os valores.`)
}
for (const k of OBRIGATORIAS) {
  if (!env[k]) problemas.push(`${k} está vazia.`)
}
// Avisos de formatação (não bloqueiam, mas alertam):
const url = env['NEXT_PUBLIC_SUPABASE_URL']
const avisos = []
if (url) {
  if (/\/rest\/v1\/?$/.test(url)) avisos.push('NEXT_PUBLIC_SUPABASE_URL termina em /rest/v1 — deve terminar em .supabase.co')
  if (!/^https:\/\//.test(url)) avisos.push('NEXT_PUBLIC_SUPABASE_URL deveria começar com https://')
}

if (avisos.length) {
  console.warn('⚠ Avisos de configuração:')
  for (const a of avisos) console.warn(`   - ${a}`)
}

if (problemas.length) {
  console.error('\n✗ Configuração do Supabase incompleta:')
  for (const p of problemas) console.error(`   - ${p}`)
  console.error(
    '\n→ Preencha no .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ' +
      'SUPABASE_SERVICE_ROLE_KEY.\n' +
      '  (Supabase → Project Settings → API → Project URL / anon public / service_role)\n',
  )
  process.exit(1)
}

console.log('✓ Variáveis do Supabase presentes.')
