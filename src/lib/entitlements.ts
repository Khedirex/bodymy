import 'server-only'
import { cache } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { captureException } from '@/lib/observability'
import { createClient } from '@/lib/supabase/server'

// =====================================================================
// Regra de negócio central: acesso a conteúdo é SEMPRE validado no
// servidor via entitlement ativo. O front pode mostrar o cadeado, mas
// nunca é a fonte de verdade do acesso.
// =====================================================================

/**
 * Retorna true se o usuário tem um entitlement ATIVO para o produto.
 * Deve ser chamado em código de servidor com um client autenticado
 * (respeitando RLS) ou admin.
 */
export async function userHasEntitlement(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<boolean> {
  if (!userId || !productId) return false

  const { data, error } = await supabase
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('status', 'ativo')
    .maybeSingle()

  if (error) {
    // Em caso de erro de leitura, negamos acesso por segurança (mas logamos).
    captureException(new Error(`[entitlements.userHasEntitlement] ${error.message}`), {
      code: error.code,
      userId,
      productId,
    })
    return false
  }

  return Boolean(data)
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

  return new Set((data ?? []).map((row) => row.product_id as string))
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
