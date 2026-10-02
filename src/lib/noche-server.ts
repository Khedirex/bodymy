import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { captureException } from '@/lib/observability'
import { todayISO } from '@/lib/dates'
import {
  NOCHE_PRODUCT_SLUG,
  NOCHE_TOTAL_NOCHES,
  type NocheNivel,
  type NocheAudioId,
} from '@/lib/noche'

// =====================================================================
// Estado do Ritual Noche Perfecta no servidor.
// O acesso vem do entitlement; o progresso, de noche_registros/noche_estado.
// =====================================================================

export interface NocheRegistro {
  noche: number
  audio_id: NocheAudioId
  repeticao: boolean
  concluida_em: string
}

export interface NocheEstado {
  nivel: NocheNivel | null
  registros: NocheRegistro[]
  concluidas: number
  /** Próxima noite a fazer (1..14) ou null quando terminou. */
  proximaNoche: number | null
  /** Já concluiu uma noite hoje → a próxima abre amanhã. */
  feitoHoje: boolean
  terminado: boolean
}

export const hasNocheAccess = cache(async (userId: string): Promise<boolean> => {
  if (!userId) return false
  const supabase = createClient()
  const ativos = await getActiveEntitlementProductIds(supabase, userId)
  if (ativos.size === 0) return false

  const admin = createAdminClient()
  const { data } = await admin
    .from('products')
    .select('id')
    .eq('slug', NOCHE_PRODUCT_SLUG)
    .maybeSingle()
  return data ? ativos.has(data.id as string) : false
})

export const getNocheEstado = cache(async (userId: string): Promise<NocheEstado> => {
  const supabase = createClient()

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
  const terminado = concluidas >= NOCHE_TOTAL_NOCHES

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
    proximaNoche: terminado ? null : concluidas + 1,
    feitoHoje,
    terminado,
  }
})
