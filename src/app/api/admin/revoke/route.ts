import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Revoga um acesso (status = revogado). Idempotente (revogar de novo é no-op).
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
  const { error } = await admin
    .from('entitlements')
    .update({ status: 'revogado' })
    .eq('user_id', alunaId)
    .eq('product_id', productId)
  if (error) return NextResponse.json({ error: 'erro_ao_revogar' }, { status: 500 })

  await adminLog({
    adminId: guard.info.adminId,
    acao: 'revogar_acesso',
    alvoTipo: 'aluna',
    alvoId: alunaId,
    detalhes: { productId },
  })
  return NextResponse.json({ ok: true, mensagem: 'Acesso revogado.' })
}
