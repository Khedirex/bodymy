import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { serverEnv } from '@/lib/env'
import {
  verifyKiwifySignature,
  normalizeKiwifyEvent,
  type KiwifyPayload,
} from '@/lib/kiwify'
import { processPurchaseEvent } from '@/lib/purchase'
import { captureException } from '@/lib/observability'

// O webhook precisa do corpo BRUTO para validar a assinatura, então
// desativamos qualquer parsing automático e lemos como texto.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // 1) Validar assinatura (query `signature` ou header).
  const url = new URL(request.url)
  const signature =
    url.searchParams.get('signature') ??
    request.headers.get('x-kiwify-signature') ??
    null

  if (!verifyKiwifySignature(rawBody, signature, serverEnv.kiwifyWebhookSecret)) {
    return NextResponse.json({ error: 'assinatura inválida' }, { status: 401 })
  }

  let payload: KiwifyPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'json inválido' }, { status: 400 })
  }

  const event = normalizeKiwifyEvent(payload)
  const admin = createAdminClient()

  // 2) Idempotência: registra o evento; se já processado, retorna 200.
  const { data: existing } = await admin
    .from('webhook_events')
    .select('id, processed')
    .eq('provider', 'kiwify')
    .eq('event_id', event.eventId)
    .maybeSingle()

  if (existing?.processed) {
    return NextResponse.json({ ok: true, duplicated: true })
  }

  if (!existing) {
    await admin.from('webhook_events').insert({
      provider: 'kiwify',
      event_id: event.eventId,
      payload: payload as unknown as Record<string, unknown>,
      processed: false,
    })
  }

  // 3/4) Processa o evento (compra aprovada / reembolso / chargeback).
  try {
    const result = await processPurchaseEvent(event)

    await admin
      .from('webhook_events')
      .update({ processed: true })
      .eq('provider', 'kiwify')
      .eq('event_id', event.eventId)

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    // 5) Erro: loga no Sentry e retorna 500 para a Kiwify reenviar.
    captureException(err, { webhook: 'kiwify', eventId: event.eventId })
    return NextResponse.json({ error: 'erro ao processar' }, { status: 500 })
  }
}
