// setup:env — cria o .env.local a partir do .env.example QUANDO ele não existe.
// Não sobrescreve um .env.local já existente (idempotente e seguro).
// Ao copiar, sanea os valores do Supabase:
//   - remove espaços em volta (inclusive logo após o "=")
//   - remove aspas acidentais
//   - NEXT_PUBLIC_SUPABASE_URL: remove sufixo /rest/v1(/) e barra final
//
// Nunca imprime valores — apenas mensagens de status.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const EXAMPLE = '.env.example'
const LOCAL = '.env.local'

if (!existsSync(EXAMPLE)) {
  console.error(`✗ ${EXAMPLE} não encontrado. Rode na raiz do projeto.`)
  process.exit(1)
}

if (existsSync(LOCAL)) {
  console.log(`• ${LOCAL} já existe — nada a fazer (não sobrescrevo).`)
  process.exit(0)
}

const linhas = readFileSync(EXAMPLE, 'utf8').split(/\r?\n/)
const out = linhas.map((line) => {
  const m = line.match(/^(\s*)([A-Z0-9_]+)(\s*)=(.*)$/)
  if (!m) return line // comentário / linha em branco
  const [, indent, key, , rawVal] = m
  let val = rawVal.trim().replace(/^["']|["']$/g, '')
  if (key === 'NEXT_PUBLIC_SUPABASE_URL' && val) {
    val = val.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  }
  return `${indent}${key}=${val}`
})

writeFileSync(LOCAL, out.join('\n'))
console.log(`✓ ${LOCAL} criado a partir de ${EXAMPLE}.`)
console.log(`→ Preencha as variáveis do Supabase e rode "npm run check:env" para validar.`)
