import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { captureException } from '@/lib/observability'
import { bibliotecaPorSlug, type ItemBiblioteca } from '@/lib/bibliotecas'
import { todayISO } from '@/lib/dates'

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


// =====================================================================
// Bibliotecas em SEQUÊNCIA (uma noite por dia), como o Mantenimiento.
//
// Mesma regra do ritual: o servidor decide qual é a próxima e só libera uma
// por dia. Sem isso, ela ouviria as 21 numa tarde e o produto perderia
// exatamente aquilo que vende — a constância.
// =====================================================================

export interface ProgressoBiblioteca {
  /** Os áudios na ordem, já numerados (1..total). */
  sequencia: ItemBiblioteca[]
  concluidas: number
  /** Próxima a fazer, ou null quando terminou. */
  proxima: number | null
  feitoHoje: boolean
  terminado: boolean
  total: number
}

export async function getProgressoBiblioteca(
  userId: string,
  moduloSlug: string,
): Promise<ProgressoBiblioteca> {
  const config = bibliotecaPorSlug(moduloSlug)
  const { itens } = await getCatalogoBiblioteca(userId, moduloSlug)

  // A ordem dos blocos manda; dentro do bloco, a ordem do upload.
  const ordemBloco = (slug: string | null) => {
    const i = (config?.blocos ?? []).findIndex((b) => b.slug === slug)
    return i === -1 ? 999 : i
  }
  const sequencia = [...itens]
    .filter((i) => i.liberado)
    .sort((a, b) => ordemBloco(a.bloco) - ordemBloco(b.bloco) || a.ordem - b.ordem)

  const admin = createAdminClient()
  const { data: feitas } = await admin
    .from('biblioteca_progresso')
    .select('numero, concluida_em')
    .eq('user_id', userId)
    .eq('modulo', moduloSlug)
    .order('numero', { ascending: true })

  const concluidas = feitas?.length ?? 0
  const total = sequencia.length
  const terminado = total > 0 && concluidas >= total

  const hoje = todayISO()
  const feitoHoje = (feitas ?? []).some(
    (f) => f.concluida_em && todayISO(new Date(f.concluida_em as string)) === hoje,
  )

  return {
    sequencia,
    concluidas,
    proxima: terminado || total === 0 ? null : concluidas + 1,
    feitoHoje,
    terminado,
    total,
  }
}
