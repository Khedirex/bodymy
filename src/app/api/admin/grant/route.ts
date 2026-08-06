import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Concede um acesso (entitlement ativo, origem manual). Idempotente:
// upsert por (user_id, product_id) — reativa se estava revogado.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const { alunaId, productId } = (await request.json().catch(() => ({}))) as {
    alunaId?: string
    productId?: string
  }
  if (!alunaId || !productId) {
    return NextResponse.json({ error: 'faltam_parametros' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin.from('entitlements').upsert(
    {
      user_id: alunaId,
      product_id: productId,
      origem: 'manual',
      status: 'ativo',
      kiwify_order_id: 'admin-grant',
    },
    { onConflict: 'user_id,product_id' },
  )
  if (error) return NextResponse.json({ error: 'erro_ao_conceder' }, { status: 500 })

  await adminLog({
    adminId: guard.info.adminId,
    acao: 'conceder_acesso',
    alvoTipo: 'aluna',
    alvoId: alunaId,
    detalhes: { productId },
  })
  return NextResponse.json({ ok: true, mensagem: 'Acesso concedido.' })
}
