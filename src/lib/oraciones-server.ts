import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { captureException } from '@/lib/observability'
import {
  ORACIONES_MODULO,
  ORACIONES_PRODUCT_SLUG,
  ORACIONES_UPSELL_SLUG,
  type OracionItem,
} from '@/lib/oraciones'

// =====================================================================
// Catálogo e acesso da biblioteca de oraciones.
//
// O cadeado é POR ÁUDIO: cada linha aponta para o produto que a libera, e a
// comparação é com os entitlements ativos. Nenhuma lista fixa no código
// decide quem vê o quê — trocar quantas vêm no bump é mudar linhas no banco.
// =====================================================================

export interface OracionesCatalogo {
  itens: OracionItem[]
  liberados: number
  bloqueados: number
}

/** Tem o bump (ou a coleção completa) → o módulo aparece para ela. */
export const hasOracionesAccess = cache(async (userId: string): Promise<boolean> => {
  if (!userId) return false
  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  if (ativos.size === 0) return false

  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('id')
    .in('slug', [ORACIONES_PRODUCT_SLUG, ORACIONES_UPSELL_SLUG])
  return (data ?? []).some((p) => ativos.has(p.id as string))
})

/**
 * A biblioteca inteira, com o cadeado resolvido item a item.
 *
 * O que ela ainda não comprou aparece BLOQUEADO, não escondido: é a vitrine
 * do upsell — ela vê que existem mais oraciones e o que falta para abrir.
 */
export const getOracionesCatalogo = cache(async (userId: string): Promise<OracionesCatalogo> => {
  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('audio_biblioteca')
    .select('id, titulo, descricao, ordem, duracao_seg, product_id')
    .eq('modulo', ORACIONES_MODULO)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    captureException(new Error(`[oraciones.catalogo] ${error.message}`), { userId })
    return { itens: [], liberados: 0, bloqueados: 0 }
  }

  const itens: OracionItem[] = (data ?? []).map((r) => ({
    id: r.id as string,
    titulo: r.titulo as string,
    descricao: (r.descricao as string) ?? null,
    ordem: r.ordem as number,
    duracaoSeg: (r.duracao_seg as number) ?? null,
    liberado: ativos.has(r.product_id as string),
  }))

  return {
    itens,
    liberados: itens.filter((i) => i.liberado).length,
    bloqueados: itens.filter((i) => !i.liberado).length,
  }
})

/**
 * URL assinada para TOCAR um áudio. Curta de propósito: o link não serve
 * para ser repassado. Devolve null quando ela não tem o produto daquele
 * áudio — a checagem é aqui, nunca na tela.
 */
export async function urlAssinadaDoAudio(
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
    captureException(new Error(`[oraciones.urlAssinada] ${error.message}`), { userId, audioId })
    return null
  }
  return data?.signedUrl ?? null
}
