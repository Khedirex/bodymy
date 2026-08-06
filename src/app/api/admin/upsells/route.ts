import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Gerencia a esteira de upsell de um produto: adicionar, remover, reordenar.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const b = (await request.json().catch(() => ({}))) as {
    action?: 'add' | 'remove' | 'reorder'
    productId?: string
    upsellProductId?: string
    upsellId?: string
    ordem?: number
  }
  const admin = createAdminClient()

  if (b.action === 'add') {
    if (!b.productId || !b.upsellProductId) return NextResponse.json({ error: 'faltam_parametros' }, { status: 400 })
    if (b.productId === b.upsellProductId) return NextResponse.json({ error: 'nao_pode_upsell_de_si_mesmo' }, { status: 400 })
    const { error } = await admin.from('product_upsells').upsert(
      { product_id: b.productId, upsell_product_id: b.upsellProductId, ordem: b.ordem ?? 0, ativo: true },
      { onConflict: 'product_id,upsell_product_id' },
    )
    if (error) return NextResponse.json({ error: `erro:${error.message}` }, { status: 500 })
    await adminLog({ adminId: guard.info.adminId, acao: 'esteira_add', alvoTipo: 'produto', alvoId: b.productId, detalhes: { upsell: b.upsellProductId } })
    return NextResponse.json({ ok: true, mensagem: 'Upsell adicionado.' })
  }

  if (b.action === 'remove') {
    if (!b.upsellId) return NextResponse.json({ error: 'faltam_parametros' }, { status: 400 })
    const { error } = await admin.from('product_upsells').delete().eq('id', b.upsellId)
    if (error) return NextResponse.json({ error: `erro:${error.message}` }, { status: 500 })
    await adminLog({ adminId: guard.info.adminId, acao: 'esteira_remove', alvoTipo: 'product_upsell', alvoId: b.upsellId })
    return NextResponse.json({ ok: true, mensagem: 'Upsell removido.' })
  }

  if (b.action === 'reorder') {
    if (!b.upsellId || typeof b.ordem !== 'number') return NextResponse.json({ error: 'faltam_parametros' }, { status: 400 })
    const { error } = await admin.from('product_upsells').update({ ordem: b.ordem }).eq('id', b.upsellId)
    if (error) return NextResponse.json({ error: `erro:${error.message}` }, { status: 500 })
    await adminLog({ adminId: guard.info.adminId, acao: 'esteira_reorder', alvoTipo: 'product_upsell', alvoId: b.upsellId, detalhes: { ordem: b.ordem } })
    return NextResponse.json({ ok: true, mensagem: 'Ordem atualizada.' })
  }

  return NextResponse.json({ error: 'acao_invalida' }, { status: 400 })
}
