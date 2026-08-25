import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { serverEnv } from '@/lib/env'
import { verifyHotmartToken, normalizeHotmartEvent, extractHottok, type HotmartPayload } from '@/lib/hotmart'
import { processPurchaseEvent } from '@/lib/purchase'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Webhook da Hotmart. Verifica o hottok, garante idempotência por evento e
// reaproveita o mesmo processPurchaseEvent do fluxo Kiwify (o produto é
// localizado por hotmart_product_id OU kiwify_product_id).
export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  let payload: HotmartPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'json inválido' }, { status: 400 })
  }

  // 1) Verifica o hottok (header ou corpo).
  const hottok = extractHottok(request.headers, payload)
  if (!verifyHotmartToken(hottok, serverEnv.hotmartWebhookToken)) {
    return NextResponse.json({ error: 'token inválido' }, { status: 401 })
  }

  const event = normalizeHotmartEvent(payload)

  // eslint-disable-next-line no-console
  console.log('[webhook:hotmart] recebido', {
    tipo: event.type,
    hotmart_product_id: event.productId,
    email: event.email,
    orderId: event.orderId,
    eventId: event.eventId,
  })

  const admin = createAdminClient()

  // 2) Idempotência (provider = 'hotmart').
  const { data: existing } = await admin
    .from('webhook_events')
    .select('id, processed')
    .eq('provider', 'hotmart')
    .eq('event_id', event.eventId)
    .maybeSingle()

  if (existing?.processed) {
    return NextResponse.json({ ok: true, duplicated: true })
  }
  if (!existing) {
    await admin.from('webhook_events').insert({
      provider: 'hotmart',
      event_id: event.eventId,
      payload: payload as unknown as Record<string, unknown>,
      processed: false,
    })
  }

  // 3) Processa (compra aprovada / reembolso / chargeback).
  try {
    const result = await processPurchaseEvent(event)
    // eslint-disable-next-line no-console
    console.log('[webhook:hotmart] resultado', { status: result.status, detail: result.detail })

    await admin
      .from('webhook_events')
      .update({ processed: true })
      .eq('provider', 'hotmart')
      .eq('event_id', event.eventId)

    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    captureException(err, { webhook: 'hotmart', eventId: event.eventId })
    return NextResponse.json({ error: 'erro ao processar' }, { status: 500 })
  }
}
