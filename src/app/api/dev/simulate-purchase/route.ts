import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/lib/env'
import { normalizeKiwifyEvent, type KiwifyPayload } from '@/lib/kiwify'
import { processPurchaseEvent } from '@/lib/purchase'
import { captureException } from '@/lib/observability'

// =====================================================================
// Rota de DEV para simular o webhook da Kiwify sem depender da Kiwify.
// Habilitada apenas quando DEV_TOOLS_ENABLED=true (dev/staging).
//
// Exemplo:
//   curl -X POST localhost:3000/api/dev/simulate-purchase \
//     -H 'content-type: application/json' \
//     -d '{"email":"nova@cliente.com","nome":"Nova Cliente",
//          "kiwify_product_id":"kiwify_pilates_somatico"}'
// =====================================================================
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!env.devToolsEnabled) {
    return NextResponse.json({ error: 'rota desabilitada' }, { status: 404 })
  }

  let body: {
    email?: string
    nome?: string
    kiwify_product_id?: string
    tipo?: 'compra_aprovada' | 'reembolso' | 'chargeback'
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'json inválido' }, { status: 400 })
  }

  if (!body.email || !body.kiwify_product_id) {
    return NextResponse.json(
      { error: 'informe email e kiwify_product_id' },
      { status: 400 },
    )
  }

  // Monta um payload no formato Kiwify e reaproveita o mesmo processador.
  const fakePayload: KiwifyPayload = {
    order_id: `dev-${Date.now()}`,
    order_status:
      body.tipo === 'reembolso'
        ? 'refunded'
        : body.tipo === 'chargeback'
          ? 'chargedback'
          : 'paid',
    product_id: body.kiwify_product_id,
    customer_email: body.email,
    customer_name: body.nome ?? 'Cliente Teste',
  }

  try {
    const event = normalizeKiwifyEvent(fakePayload)
    const result = await processPurchaseEvent(event)
    return NextResponse.json({ ok: true, simulated: true, ...result })
  } catch (err) {
    captureException(err, { rota: 'simulate-purchase' })
    return NextResponse.json({ error: 'erro ao simular' }, { status: 500 })
  }
}
