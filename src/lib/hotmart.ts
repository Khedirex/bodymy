import 'server-only'
import crypto from 'node:crypto'
import type { PurchaseEvent, KiwifyEventType } from '@/lib/kiwify'

// =====================================================================
// Integração Hotmart (webhook de compra).
//
// Verificação: a Hotmart envia um token fixo ("hottok") — no header
// `X-HOTMART-HOTTOK` (webhook 2.0) ou no corpo (`payload.hottok`).
// Comparamos com HOTMART_WEBHOOK_TOKEN em tempo constante.
// =====================================================================

export function verifyHotmartToken(received: string | null, expected: string): boolean {
  if (!received || !expected) return false
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// --- Tipos do payload (subconjunto que usamos; webhook 2.0) ----------
export interface HotmartPayload {
  id?: string // id único do evento (idempotência)
  event?: string // 'PURCHASE_APPROVED' | 'PURCHASE_REFUNDED' | 'PURCHASE_CHARGEBACK' | ...
  hottok?: string
  data?: {
    product?: { id?: number | string; name?: string }
    buyer?: { email?: string; name?: string }
    purchase?: {
      transaction?: string
      status?: string // 'APPROVED' | 'COMPLETE' | 'REFUNDED' | 'CHARGEBACK' ...
    }
  }
  [key: string]: unknown
}

function mapTipo(event: string, status: string): KiwifyEventType {
  const e = event.toUpperCase()
  const s = status.toUpperCase()
  if (e.includes('APPROVED') || e.includes('COMPLETE') || ['APPROVED', 'COMPLETE'].includes(s)) {
    return 'compra_aprovada'
  }
  if (e.includes('REFUND') || s === 'REFUNDED') return 'reembolso'
  if (e.includes('CHARGEBACK') || s === 'CHARGEBACK') return 'chargeback'
  return 'ignorado'
}

// Normaliza o payload cru da Hotmart para a forma estável do app.
export function normalizeHotmartEvent(payload: HotmartPayload): PurchaseEvent {
  const data = payload.data ?? {}
  const event = payload.event ?? ''
  const status = data.purchase?.status ?? ''
  const type = mapTipo(event, status)

  const productId = data.product?.id != null ? String(data.product.id) : null
  const email = data.buyer?.email ?? null
  const nome = data.buyer?.name ?? null
  const orderId = data.purchase?.transaction ?? null

  const eventId =
    payload.id ??
    (orderId ? `${orderId}:${type}` : `${email ?? 'sem-email'}:${type}:${status}`)

  return {
    eventId,
    type,
    provider: 'hotmart',
    productId,
    orderId,
    email: email ? email.trim().toLowerCase() : null,
    nome: nome?.trim() ?? null,
  }
}

// Extrai o hottok do header ou do corpo.
export function extractHottok(headers: Headers, payload: HotmartPayload): string | null {
  return headers.get('x-hotmart-hottok') ?? payload.hottok ?? null
}
