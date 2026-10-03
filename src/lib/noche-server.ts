import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { captureException } from '@/lib/observability'
import { todayISO } from '@/lib/dates'
import {
  NOCHE_MODULO,
  NOCHE_PRODUCT_SLUG,
  NOCHE_BLOCOS,
  blocosSequenciais,
  type NocheAudio,
  type NocheBloco,
  type NocheNivel,
} from '@/lib/noche'

// =====================================================================
// Catálogo e estado do Ritual Noche Perfecta.
//
// O catálogo vem do banco; o acesso, do entitlement; o progresso, de
// noche_registros. Nada de conteúdo no código.
// =====================================================================

// Os 7 áudios antigos, que ainda moram em public/. Só entram em cena
// enquanto o catálogo novo está vazio — sem isto, trocar o conteúdo deixaria
// as compradoras de ontem com um módulo vazio no meio do ritual delas.
// Saem daqui (e do repositório) assim que os novos subirem.
const LEGADO: NocheAudio[] = [
  'Apagado Mental',
  'Liberación Corporal',
  'Reconexión Pineal',
  'Ondas Profundas',
  'Ancla de Madrugada',
  'Sueño Continuo',
  'Sellado',
].map((titulo, i) => ({
  id: `legado-${i + 1}`,
  titulo,
  descricao: null,
  bloco: 'modulo-1',
  noche: i + 1,
  duracaoSeg: null,
  resgate: i === 4,
  urlPublica: `/audios/noche/vn${i + 1}.mp3`,
}))

export interface BlocoComAudios {
  bloco: NocheBloco
  audios: NocheAudio[]
}

export interface NocheCatalogo {
  /** O caminho noite a noite, já numerado (1..total). */
  sequencia: NocheAudio[]
  /** Blocos que ela abre quando precisar, fora da ordem. */
  apoio: BlocoComAudios[]
  /** Áudio de madrugada, se algum estiver marcado. */
  resgate: NocheAudio | null
  total: number
  /** Nenhum áudio cadastrado ainda (o painel está vazio). */
  vazio: boolean
}

const ordemDoBloco = (slug: string | null): number => {
  const i = NOCHE_BLOCOS.findIndex((b) => b.slug === slug)
  return i === -1 ? 999 : i
}

/** O catálogo do ritual. Igual para todas — não depende da aluna. */
export const getNocheCatalogo = cache(async (): Promise<NocheCatalogo> => {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('audio_biblioteca')
    .select('id, titulo, descricao, bloco, ordem, duracao_seg, resgate')
    .eq('modulo', NOCHE_MODULO)
    .eq('ativo', true)
    .order('ordem', { ascending: true })

  if (error) {
    captureException(new Error(`[noche.catalogo] ${error.message}`), { code: error.code })
  }

  const todos: NocheAudio[] = (data ?? []).map((r) => ({
    id: r.id as string,
    titulo: r.titulo as string,
    descricao: (r.descricao as string) ?? null,
    bloco: (r.bloco as string) ?? null,
    noche: null,
    duracaoSeg: (r.duracao_seg as number) ?? null,
    resgate: Boolean(r.resgate),
  }))

  const slugsSequenciais = new Set(blocosSequenciais().map((b) => b.slug))

  const sequencia = todos
    .filter((a) => a.bloco && slugsSequenciais.has(a.bloco))
    .sort((a, b) => ordemDoBloco(a.bloco) - ordemDoBloco(b.bloco))
    .map((a, i) => ({ ...a, noche: i + 1 }))

  const apoio = NOCHE_BLOCOS.filter((b) => !b.sequencial)
    .map((bloco) => ({ bloco, audios: todos.filter((a) => a.bloco === bloco.slug) }))
    .filter((b) => b.audios.length > 0)

  if (sequencia.length === 0 && apoio.length === 0) {
    return {
      sequencia: LEGADO,
      apoio: [],
      resgate: LEGADO.find((a) => a.resgate) ?? null,
      total: LEGADO.length,
      vazio: true,
    }
  }

  return {
    sequencia,
    apoio,
    resgate: todos.find((a) => a.resgate) ?? null,
    total: sequencia.length,
    vazio: false,
  }
})

export interface NocheRegistro {
  noche: number
  audio_id: string
  repeticao: boolean
  concluida_em: string
}

export interface NocheEstado {
  nivel: NocheNivel | null
  registros: NocheRegistro[]
  concluidas: number
  /** Próxima noite a fazer (1..total) ou null quando terminou. */
  proximaNoche: number | null
  /** Já concluiu uma noite hoje → a próxima abre amanhã. */
  feitoHoje: boolean
  terminado: boolean
  total: number
}

export const hasNocheAccess = cache(async (userId: string): Promise<boolean> => {
  if (!userId) return false
  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  if (ativos.size === 0) return false

  const admin = createAdminClient()
  // Sem filtro de `ativo`: tirar de venda não cancela acesso de quem pagou.
  const { data } = await admin
    .from('products')
    .select('id')
    .eq('slug', NOCHE_PRODUCT_SLUG)
    .maybeSingle()
  return data ? ativos.has(data.id as string) : false
})

export const getNocheEstado = cache(async (userId: string): Promise<NocheEstado> => {
  const supabase = createClient()
  const catalogo = await getNocheCatalogo()

  const [{ data: regs, error: regErr }, { data: est }] = await Promise.all([
    supabase
      .from('noche_registros')
      .select('noche, audio_id, repeticao, concluida_em')
      .eq('user_id', userId)
      .order('noche', { ascending: true }),
    supabase.from('noche_estado').select('nivel').eq('user_id', userId).maybeSingle(),
  ])

  if (regErr) {
    captureException(new Error(`[noche.getNocheEstado] ${regErr.message}`), {
      code: regErr.code,
      userId,
    })
  }

  const registros = (regs ?? []) as NocheRegistro[]
  const concluidas = registros.length
  const total = catalogo.total
  const terminado = total > 0 && concluidas >= total

  // "Hoje" no fuso do app. concluida_em é timestamptz: fatiar a string daria
  // a data em UTC, que vira o dia seguinte para quem termina o ritual à noite.
  const hoje = todayISO()
  const feitoHoje = registros.some(
    (r) => r.concluida_em && todayISO(new Date(r.concluida_em)) === hoje,
  )

  return {
    nivel: (est?.nivel as NocheNivel) ?? null,
    registros,
    concluidas,
    proximaNoche: terminado || total === 0 ? null : concluidas + 1,
    feitoHoje,
    terminado,
    total,
  }
})

/**
 * URL para tocar um áudio do ritual. Assinada e curta — o link não serve
 * para repassar. O acesso é conferido aqui, nunca na tela.
 */
export async function urlDoAudioNoche(userId: string, audioId: string): Promise<string | null> {
  if (!(await hasNocheAccess(userId))) return null

  // Legado em public/: enquanto o conteúdo novo não sobe.
  if (audioId.startsWith('legado-')) {
    const n = Number(audioId.split('-')[1])
    return n >= 1 && n <= 7 ? `/audios/noche/vn${n}.mp3` : null
  }

  const admin = createAdminClient()
  const { data: audio } = await admin
    .from('audio_biblioteca')
    .select('storage_path, modulo, ativo')
    .eq('id', audioId)
    .maybeSingle()

  if (!audio || !audio.ativo || audio.modulo !== NOCHE_MODULO) return null

  const { data, error } = await admin.storage
    .from('audios')
    .createSignedUrl(audio.storage_path as string, 60 * 60)

  if (error) {
    captureException(new Error(`[noche.urlDoAudio] ${error.message}`), { userId, audioId })
    return null
  }
  return data?.signedUrl ?? null
}
