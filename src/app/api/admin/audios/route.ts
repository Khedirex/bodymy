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
    bloco?: string | null
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
      bloco: body.bloco ?? null,
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
      detalhes: { modulo, bloco: body.bloco ?? null, quantos: linhas.length },
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

// Troca um áudio de lugar com o vizinho DO MESMO BLOCO. A ordem de upload
// define a sequência de noites; sem isto, um arquivo que entrou fora de
// lugar só se arrumava com SQL na mão.
export async function PATCH(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const { id, direcao } = (await request.json().catch(() => ({}))) as {
    id?: string
    direcao?: 'sube' | 'baja'
  }
  if (!id || (direcao !== 'sube' && direcao !== 'baja')) {
    return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { data: atual } = await admin
      .from('audio_biblioteca')
      .select('id, modulo, bloco, ordem')
      .eq('id', id)
      .maybeSingle()
    if (!atual) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 })

    let q = admin
      .from('audio_biblioteca')
      .select('id, ordem')
      .eq('modulo', atual.modulo as string)
      .limit(1)

    // Blocos diferentes não se misturam: trocar com o vizinho de outro bloco
    // mudaria o áudio de bloco sem querer.
    q = atual.bloco ? q.eq('bloco', atual.bloco as string) : q.is('bloco', null)

    const { data: vizinhos } =
      direcao === 'sube'
        ? await q.lt('ordem', atual.ordem as number).order('ordem', { ascending: false })
        : await q.gt('ordem', atual.ordem as number).order('ordem', { ascending: true })

    const vizinho = vizinhos?.[0]
    if (!vizinho) return NextResponse.json({ ok: true, movido: false })

    await admin
      .from('audio_biblioteca')
      .update({ ordem: vizinho.ordem as number })
      .eq('id', atual.id as string)
    await admin
      .from('audio_biblioteca')
      .update({ ordem: atual.ordem as number })
      .eq('id', vizinho.id as string)

    return NextResponse.json({ ok: true, movido: true })
  } catch (err) {
    captureException(err, { rota: 'admin_audios_patch' })
    return NextResponse.json({ error: 'erro_ao_reordenar' }, { status: 500 })
  }
}

// Marca (ou desmarca) o áudio de resgate de madrugada. Só um por módulo:
// a tela mostra um botão, não uma lista.
export async function PUT(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const { id, resgate } = (await request.json().catch(() => ({}))) as {
    id?: string
    resgate?: boolean
  }
  if (!id) return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })

  try {
    const admin = createAdminClient()
    const { data: alvo } = await admin
      .from('audio_biblioteca')
      .select('modulo')
      .eq('id', id)
      .maybeSingle()
    if (!alvo) return NextResponse.json({ error: 'no_encontrado' }, { status: 404 })

    if (resgate) {
      await admin
        .from('audio_biblioteca')
        .update({ resgate: false })
        .eq('modulo', alvo.modulo as string)
    }
    await admin.from('audio_biblioteca').update({ resgate: Boolean(resgate) }).eq('id', id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'admin_audios_put' })
    return NextResponse.json({ error: 'erro_ao_marcar' }, { status: 500 })
  }
}
