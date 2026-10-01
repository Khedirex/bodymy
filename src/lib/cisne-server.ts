import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getActiveEntitlementProductIds } from '@/lib/entitlements'
import { captureException } from '@/lib/observability'
import { todayISO } from '@/lib/dates'
import { CISNE_PRODUCT_SLUG, CISNE_TOTAL_DIAS } from '@/lib/cisne'
import type { Product } from '@/types/db'

// =====================================================================
// Camada de servidor do Reset Postura de Cisne. O acesso é SEMPRE pelo
// entitlement do produto (validado aqui); o progresso é o diário
// cisne_registros (RLS dono).
// =====================================================================

export interface CisneRegistro {
  dia: number
  cuello: number | null
  data: string // YYYY-MM-DD (America/Sao_Paulo)
}

export interface CisneEstado {
  registros: Map<number, CisneRegistro>
  concluidos: number
  // Próximo dia a fazer (1–14) ou null quando o reto terminou.
  proximoDia: number | null
  // Já concluiu um dia hoje → o próximo só abre amanhã.
  feitoHoje: boolean
  terminado: boolean
}

// Produto do módulo (lido com admin: a RLS de products só mostra o
// "mundo" da aluna, e a página de venda precisa dele mesmo sem acesso).
export const getCisneProduct = cache(async (): Promise<Product | null> => {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('products')
    .select('*')
    .eq('slug', CISNE_PRODUCT_SLUG)
    .eq('ativo', true)
    .maybeSingle()
  if (error) {
    captureException(new Error(`[cisne.getCisneProduct] ${error.message}`), { code: error.code })
  }
  return (data as Product) ?? null
})

export async function hasCisneAccess(userId: string): Promise<boolean> {
  if (!userId) return false
  const product = await getCisneProduct()
  if (!product) return false
  const ativos = await getActiveEntitlementProductIds(createClient(), userId)
  return ativos.has(product.id)
}

export async function getCisneEstado(userId: string): Promise<CisneEstado> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('cisne_registros')
    .select('dia, cuello, data')
    .eq('user_id', userId)
    .order('dia', { ascending: true })
  if (error) {
    captureException(new Error(`[cisne.getCisneEstado] ${error.message}`), { code: error.code, userId })
  }

  const registros = new Map<number, CisneRegistro>()
  for (const r of (data ?? []) as CisneRegistro[]) registros.set(r.dia, r)
  return calcularEstado(registros, todayISO())
}

// Regra do reto: os dias vão em ordem e no máximo UM dia novo por data.
export function calcularEstado(registros: Map<number, CisneRegistro>, hoje: string): CisneEstado {
  let proximoDia: number | null = null
  for (let d = 1; d <= CISNE_TOTAL_DIAS; d++) {
    if (!registros.has(d)) {
      proximoDia = d
      break
    }
  }
  const feitoHoje = Array.from(registros.values()).some((r) => r.data === hoje)
  return {
    registros,
    concluidos: registros.size,
    proximoDia,
    feitoHoje,
    terminado: proximoDia === null,
  }
}

// Um dia pode ser aberto se já foi feito (para repetir) ou se é o próximo
// e nenhum dia novo foi concluído hoje.
export function podeAbrirDia(estado: CisneEstado, dia: number): boolean {
  if (estado.registros.has(dia)) return true
  return dia === estado.proximoDia && !estado.feitoHoje
}
