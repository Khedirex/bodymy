import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

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
    // Em caso de erro de leitura, negamos acesso por segurança.
    // eslint-disable-next-line no-console
    console.error('[entitlements] erro ao verificar acesso:', error.message)
    return false
  }

  return Boolean(data)
}

/**
 * Retorna o conjunto de product_ids que o usuário tem ativos.
 * Útil para pintar estados de cadeado em listas (vitrine).
 */
export async function getActiveEntitlementProductIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  if (!userId) return new Set()

  const { data, error } = await supabase
    .from('entitlements')
    .select('product_id')
    .eq('user_id', userId)
    .eq('status', 'ativo')

  if (error) {
    // eslint-disable-next-line no-console
    console.error('[entitlements] erro ao listar acessos:', error.message)
    return new Set()
  }

  return new Set((data ?? []).map((row) => row.product_id as string))
}
