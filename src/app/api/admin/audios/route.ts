import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Registra no catálogo um áudio que JÁ subiu para o bucket.
// Aceita um lote: 63 arquivos viram uma chamada, não 63.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const body = (await request.json().catch(() => ({}))) as {
    modulo?: string
    productId?: string
    itens?: Array<{ titulo?: string; storagePath?: string; ordem?: number; duracaoSeg?: number | null }>
  }

  const modulo = (body.modulo ?? 'oraciones').trim()
  const productId = body.productId
  const itens = (body.itens ?? []).filter((i) => i.titulo && i.storagePath)
  if (!productId || itens.length === 0) {
    return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const linhas = itens.map((i) => ({
      modulo,
      product_id: productId,
      titulo: (i.titulo as string).slice(0, 200),
      ordem: i.ordem ?? 0,
      storage_path: i.storagePath as string,
      duracao_seg: i.duracaoSeg ?? null,
      ativo: true,
    }))

    const { data, error } = await admin.from('audio_biblioteca').insert(linhas).select('id')
    if (error) throw error

    await adminLog({
      adminId: guard.info.adminId,
      acao: 'subir_audios',
      alvoTipo: 'produto',
      alvoId: productId,
      detalhes: { modulo, quantos: linhas.length },
    })

    return NextResponse.json({ ok: true, criados: data?.length ?? 0 })
  } catch (err) {
    captureException(err, { rota: 'admin_audios_post' })
    const detalhe = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: 'erro_ao_registrar', detalhe }, { status: 500 })
  }
}

// Remove um áudio do catálogo E do bucket — sem isto, um upload errado
// ficaria pago e invisível, ocupando espaço para sempre.
export async function DELETE(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const { id } = (await request.json().catch(() => ({}))) as { id?: string }
  if (!id) return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })

  try {
    const admin = createAdminClient()
    const { data: audio } = await admin
      .from('audio_biblioteca')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle()

    await admin.from('audio_biblioteca').delete().eq('id', id)
    if (audio?.storage_path) {
      await admin.storage.from('audios').remove([audio.storage_path as string])
    }

    await adminLog({
      adminId: guard.info.adminId,
      acao: 'remover_audio',
      alvoTipo: 'audio',
      alvoId: id,
      detalhes: {},
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'admin_audios_delete' })
    return NextResponse.json({ error: 'erro_ao_remover' }, { status: 500 })
  }
}
