// Move os valores preenchidos de .env.example para .env.local, corrigindo
// erros comuns de cópia, e restaura .env.example como template vazio.
//
// Use quando você colou credenciais no .env.example por engano:
//   node scripts/setup-env-local.mjs
//
// Correções aplicadas ao mover:
//  - remove espaços em volta do valor (inclusive logo após o "=")
//  - remove aspas acidentais
//  - NEXT_PUBLIC_SUPABASE_URL: remove sufixo /rest/v1(/) e barra final
//
// Nunca imprime valores — só os NOMES das variáveis afetadas.
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs'

const EXAMPLE = '.env.example'
const LOCAL = '.env.local'

if (!existsSync(EXAMPLE)) {
  console.error(`✗ ${EXAMPLE} não encontrado. Rode na raiz do projeto.`)
  process.exit(1)
}

const linhas = readFileSync(EXAMPLE, 'utf8').split(/\r?\n/)

const preenchidas = []
const localOut = []
const exampleOut = []

for (const line of linhas) {
  const m = line.match(/^(\s*)([A-Z0-9_]+)(\s*)=(.*)$/)
  if (!m) {
    // comentário ou linha em branco: mantém em ambos
    localOut.push(line)
    exampleOut.push(line)
    continue
  }
  const [, indent, key, , rawVal] = m
  let val = rawVal.trim().replace(/^["']|["']$/g, '')

  if (key === 'NEXT_PUBLIC_SUPABASE_URL' && val) {
    val = val.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '')
  }

  // .env.local recebe o valor saneado (sem espaço após o "=")
  localOut.push(`${indent}${key}=${val}`)
  if (val) preenchidas.push(key)

  // .env.example volta a ser template: nome + valor vazio, comentários mantidos
  exampleOut.push(`${indent}${key}=`)
}

// Backup do .env.local anterior, se existir
if (existsSync(LOCAL)) copyFileSync(LOCAL, `${LOCAL}.bak`)

writeFileSync(LOCAL, localOut.join('\n'))
writeFileSync(EXAMPLE, exampleOut.join('\n'))

console.log(`✓ ${LOCAL} criado a partir de ${EXAMPLE} (valores saneados).`)
console.log(`✓ ${EXAMPLE} restaurado como template vazio (sem credenciais).`)
if (existsSync(`${LOCAL}.bak`)) console.log(`• backup do anterior em ${LOCAL}.bak`)
console.log(
  preenchidas.length
    ? `• variáveis com valor movidas: ${preenchidas.join(', ')}`
    : '• atenção: nenhuma variável tinha valor preenchido no .env.example.',
)
