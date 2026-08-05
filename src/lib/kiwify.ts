import 'server-only'
import crypto from 'node:crypto'

// =====================================================================
// Integração Kiwify (webhook de compra).
//
// Assinatura: a Kiwify envia um HMAC-SHA1 (hex) do corpo bruto da
// requisição, usando o "token" do webhook como chave, no query param
// `?signature=`. Validamos com comparação em tempo constante.
// (Se sua conta Kiwify usar outro esquema, ajuste verifyKiwifySignature.)
// =====================================================================

export function verifyKiwifySignature(
  rawBody: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature || !secret) return false
  const expected = crypto.createHmac('sha1', secret).update(rawBody, 'utf8').digest('hex')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

// --- Tipos do payload (subconjunto que usamos) ----------------------
export interface KiwifyPayload {
  // id único do evento/pedido para idempotência
  order_id?: string
  webhook_event_id?: string
  order_status?: string // 'paid' | 'approved' | 'refunded' | 'chargedback' ...
  webhook_event_type?: string // 'order_approved' | 'order_refunded' | ...
  Product?: { product_id?: string; product_name?: string }
  product_id?: string
  Customer?: { email?: string; full_name?: string; first_name?: string }
  customer_email?: string
  customer_name?: string
  [key: string]: unknown
}

export type KiwifyEventType = 'compra_aprovada' | 'reembolso' | 'chargeback' | 'ignorado'

export interface NormalizedKiwifyEvent {
  eventId: string
  type: KiwifyEventType
  kiwifyProductId: string | null
  orderId: string | null
  email: string | null
  nome: string | null
}

// Normaliza o payload cru da Kiwify para uma forma estável usada pelo app.
export function normalizeKiwifyEvent(payload: KiwifyPayload): NormalizedKiwifyEvent {
  const status = (payload.order_status ?? '').toLowerCase()
  const type = (payload.webhook_event_type ?? '').toLowerCase()

  let eventType: KiwifyEventType = 'ignorado'
  if (
    ['paid', 'approved'].includes(status) ||
    ['order_approved', 'order_paid', 'compra_aprovada'].includes(type)
  ) {
    eventType = 'compra_aprovada'
  } else if (status === 'refunded' || type.includes('refund')) {
    eventType = 'reembolso'
  } else if (status === 'chargedback' || type.includes('chargeback')) {
    eventType = 'chargeback'
  }

  const kiwifyProductId =
    payload.Product?.product_id ?? payload.product_id ?? null

  const email =
    payload.Customer?.email ?? payload.customer_email ?? null

  const nome =
    payload.Customer?.full_name ??
    payload.customer_name ??
    payload.Customer?.first_name ??
    null

  const orderId = payload.order_id ?? null

  // event_id para idempotência: prioriza webhook_event_id, cai para
  // order_id + tipo (um mesmo pedido gera eventos distintos por tipo).
  const eventId =
    payload.webhook_event_id ??
    (orderId ? `${orderId}:${eventType}` : `${email ?? 'sem-email'}:${eventType}:${status}`)

  return {
    eventId,
    type: eventType,
    kiwifyProductId,
    orderId,
    email: email ? email.trim().toLowerCase() : null,
    nome: nome?.trim() ?? null,
  }
}
