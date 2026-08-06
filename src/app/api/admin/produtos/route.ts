import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ProductTipo } from '@/types/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TIPOS: ProductTipo[] = ['programa', 'dieta_premium', 'bundle', 'extra']

// Cria (sem id) ou atualiza (com id) um produto.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const nome = (b.nome as string)?.trim()
  const slug = (b.slug as string)?.trim()
  const tipo = b.tipo as ProductTipo
  if (!nome || !slug) return NextResponse.json({ error: 'nome_e_slug_obrigatorios' }, { status: 400 })
  if (!TIPOS.includes(tipo)) return NextResponse.json({ error: 'tipo_invalido' }, { status: 400 })
  if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: 'slug_invalido' }, { status: 400 })

  const campos = {
    nome,
    slug,
    descricao: (b.descricao as string) ?? null,
    tipo,
    preco_exibicao: (b.preco_exibicao as string) ?? null,
    kiwify_product_id: (b.kiwify_product_id as string) ?? null,
    kiwify_checkout_url: (b.kiwify_checkout_url as string) ?? null,
    sales_page: (b.sales_page as Record<string, unknown>) ?? null,
    ativo: b.ativo !== false,
  }

  const admin = createAdminClient()
  const id = b.id as string | undefined

  if (id) {
    const { error } = await admin.from('products').update(campos).eq('id', id)
    if (error) return NextResponse.json({ error: `erro:${error.message}` }, { status: 500 })
    await adminLog({ adminId: guard.info.adminId, acao: 'editar_produto', alvoTipo: 'produto', alvoId: id, detalhes: { slug } })
    return NextResponse.json({ ok: true, id, mensagem: 'Produto salvo.' })
  }

  const { data, error } = await admin.from('products').insert(campos).select('id').single()
  if (error) return NextResponse.json({ error: `erro:${error.message}` }, { status: 500 })
  await adminLog({ adminId: guard.info.adminId, acao: 'criar_produto', alvoTipo: 'produto', alvoId: data.id, detalhes: { slug } })
  return NextResponse.json({ ok: true, id: data.id, mensagem: 'Produto criado.' })
}
