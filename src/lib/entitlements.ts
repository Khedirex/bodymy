import 'server-only'
import { cache } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { captureException } from '@/lib/observability'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// =====================================================================
// Regra de negócio central: acesso a conteúdo é SEMPRE validado no
// servidor via entitlement ativo. O front pode mostrar o cadeado, mas
// nunca é a fonte de verdade do acesso.
// =====================================================================

/**
 * Retorna true se o usuário tem acesso ATIVO ao produto — comprado direto
 * ou incluído num bundle que ele comprou.
 *
 * Delega ao conjunto expandido para existir UMA definição de "tem acesso":
 * se esta função consultasse a tabela por conta própria, um produto vendido
 * dentro de um combo passaria no cadeado da vitrine e falharia aqui.
 */
export async function userHasEntitlement(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<boolean> {
  if (!userId || !productId) return false
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  return ativos.has(productId)
}

/**
 * Retorna o conjunto de product_ids que o usuário tem ativos.
 * Útil para pintar estados de cadeado em listas (vitrine).
 */
// Memorizado por REQUISIÇÃO e por usuário: esta leitura se repetia em
// getCircuitoPrograma e getEsteira no mesmo carregamento de página.
//
// A chave é APENAS o userId. O client não pode entrar na chave porque
// createClient() devolve uma instância nova a cada chamada — com ele na
// assinatura, o cache nunca acertaria. Por isso o client é criado aqui
// dentro; os dois chamadores passavam um client autenticado, e a RLS de
// entitlements já restringe ao dono, então o resultado é o mesmo.
const idsAtivosDoUsuario = cache(async (userId: string): Promise<Set<string>> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('entitlements')
    .select('product_id')
    .eq('user_id', userId)
    .eq('status', 'ativo')

  if (error) {
    captureException(new Error(`[entitlements.getActiveEntitlementProductIds] ${error.message}`), {
      code: error.code,
      userId,
    })
    return new Set()
  }

  const comprados = new Set((data ?? []).map((row) => row.product_id as string))
  if (comprados.size === 0) return comprados

  // Um bundle dá acesso ao que ele contém. Expandir AQUI faz todas as
  // checagens respeitarem isso de uma vez — acesso a módulo, cadeado da
  // vitrine e esteira. Sem isso, quem comprasse o "Combo 3 en 1" continuaria
  // vendo os três itens à venda, como se não os tivesse.
  const admin = createAdminClient()
  const { data: pacotes } = await admin
    .from('product_bundles')
    .select('included_product_id')
    .in('bundle_product_id', Array.from(comprados))

  for (const p of pacotes ?? []) comprados.add(p.included_product_id as string)
  return comprados
})

/**
 * Retorna o conjunto de product_ids que o usuário tem ativos.
 * O parâmetro `supabase` é mantido por compatibilidade com os chamadores;
 * a leitura usa o client autenticado da requisição (ver nota acima).
 */
export async function getActiveEntitlementProductIds(
  _supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  if (!userId) return new Set()
  return idsAtivosDoUsuario(userId)
}
