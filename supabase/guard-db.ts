/* eslint-disable no-console */
// Guard de identidade do banco. Impede rodar seeds/diagnóstico contra o
// Supabase ERRADO (ex.: um projeto antigo de outro sistema). Verifica,
// via API, dois marcadores do schema do BodyMy:
//   - a tabela 'entitlements' existe
//   - 'products' tem a coluna 'kiwify_product_id'
// Aborta com mensagem clara se qualquer um faltar.
import type { SupabaseClient } from '@supabase/supabase-js'

function pareceSchemaFaltando(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false
  const code = err.code ?? ''
  const msg = (err.message ?? '').toLowerCase()
  return (
    code === '42P01' || // undefined_table
    code === '42703' || // undefined_column
    code === 'PGRST204' || // coluna não encontrada (schema cache)
    code === 'PGRST205' || // tabela não encontrada
    msg.includes('does not exist') ||
    msg.includes('could not find') ||
    msg.includes('schema cache')
  )
}

export async function assertBodyMyDb(db: SupabaseClient) {
  const problemas: string[] = []

  // 1) entitlements existe?
  const ent = await db.from('entitlements').select('id').limit(1)
  if (ent.error && pareceSchemaFaltando(ent.error)) {
    problemas.push("a tabela 'entitlements' não existe")
  }

  // 2) products tem kiwify_product_id?
  const prod = await db.from('products').select('kiwify_product_id').limit(1)
  if (prod.error && pareceSchemaFaltando(prod.error)) {
    problemas.push("'products' não tem a coluna 'kiwify_product_id'")
  }

  if (problemas.length > 0) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '(não definida)'
    console.error('\n✗ BANCO ERRADO — este Supabase NÃO parece ser o do BodyMy:')
    for (const p of problemas) console.error(`   - ${p}`)
    console.error(`\n  URL conectada: ${url}`)
    console.error(
      '  Confira NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local\n' +
        '  e rode supabase/schema.sql no projeto CORRETO antes dos seeds.\n',
    )
    process.exit(1)
  }
}
