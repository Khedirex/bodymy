import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { captureException } from '@/lib/observability'
import { bibliotecaPorSlug, type ItemBiblioteca } from '@/lib/bibliotecas'

// =====================================================================
// Catálogo e acesso de QUALQUER biblioteca de áudio.
//
// Mesma regra de sempre: o cadeado é por áudio (cada linha aponta para o
// produto que a libera) e a URL é assinada no servidor, depois de conferir
// o entitlement. Uma função só serve todos os produtos de áudio.
// =====================================================================

export interface CatalogoBiblioteca {
  itens: ItemBiblioteca[]
  liberados: number
  bloqueados: number
}

/** Ids dos produtos de uma biblioteca (sem filtro de `ativo`: tirar de
 *  venda não cancela o acesso de quem comprou). */
const idsDosProdutos = cache(async (slugs: string): Promise<string[]> => {
  const admin = createAdminClient()
  const { data } = await admin.from('products').select('id').in('slug', slugs.split(','))
  return (data ?? []).map((p) => p.id as string)
})

export async function hasBibliotecaAccess(userId: string, moduloSlug: string): Promise<boolean> {
  const config = bibliotecaPorSlug(moduloSlug)
  if (!userId || !config) return false

  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  if (ativos.size === 0) return false

  const ids = await idsDosProdutos(config.productSlugs.join(','))
  return ids.some((id) => ativos.has(id))
}

export async function getCatalogoBiblioteca(
  userId: string,
  moduloSlug: string,
): Promise<CatalogoBiblioteca> {
  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('audio_biblioteca')
    .select('id, titulo, descricao, bloco, ordem, duracao_seg, product_id')
    .eq('modulo', moduloSlug)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    captureException(new Error(`[biblioteca.catalogo] ${error.message}`), { userId, moduloSlug })
    return { itens: [], liberados: 0, bloqueados: 0 }
  }

  const itens: ItemBiblioteca[] = (data ?? []).map((r) => ({
    id: r.id as string,
    titulo: r.titulo as string,
    descricao: (r.descricao as string) ?? null,
    bloco: (r.bloco as string) ?? null,
    ordem: r.ordem as number,
    duracaoSeg: (r.duracao_seg as number) ?? null,
    liberado: ativos.has(r.product_id as string),
  }))

  return {
    itens,
    liberados: itens.filter((i) => i.liberado).length,
    bloqueados: itens.filter((i) => !i.liberado).length,
  }
}

/**
 * URL assinada para tocar um áudio. Curta de propósito — o link não serve
 * para repassar. Devolve null quando ela não tem o produto DAQUELE áudio.
 */
export async function urlAssinadaBiblioteca(
  userId: string,
  audioId: string,
): Promise<string | null> {
  if (!userId || !audioId) return null

  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  if (ativos.size === 0) return null

  const admin = createAdminClient()
  const { data: audio } = await admin
    .from('audio_biblioteca')
    .select('storage_path, product_id, ativo')
    .eq('id', audioId)
    .maybeSingle()

  if (!audio || !audio.ativo) return null
  if (!ativos.has(audio.product_id as string)) return null

  const { data, error } = await admin.storage
    .from('audios')
    .createSignedUrl(audio.storage_path as string, 60 * 60)

  if (error) {
    captureException(new Error(`[biblioteca.urlAssinada] ${error.message}`), { userId, audioId })
    return null
  }
  return data?.signedUrl ?? null
}
