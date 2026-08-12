import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Salva edições do circuito. Três "kinds":
//   - exercise:  { kind:'exercise', id, nome, descricao, ativo }
//   - variation: { kind:'variation', id, panda_video_id, duracao_seg, instrucoes }
//   - stretch:   { kind:'stretch', id, nome, descricao, panda_video_id, duracao_seg }
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const b = (await request.json().catch(() => ({}))) as Record<string, unknown>
  const kind = b.kind as string
  const id = b.id as string | undefined
  if (!id) return NextResponse.json({ error: 'id_obrigatorio' }, { status: 400 })

  const admin = createAdminClient()
  const vid = (s: unknown) => {
    const t = (s as string | null)?.toString().trim()
    return t ? t : null
  }
  const num = (s: unknown) => {
    const n = Number(s)
    return Number.isFinite(n) && n > 0 ? Math.round(n) : null
  }

  try {
    if (kind === 'exercise') {
      const nome = (b.nome as string)?.trim()
      if (!nome) return NextResponse.json({ error: 'nome_obrigatorio' }, { status: 400 })
      const { error } = await admin
        .from('exercises')
        .update({ nome, descricao: vid(b.descricao), ativo: b.ativo !== false })
        .eq('id', id)
      if (error) throw error
      await adminLog({ adminId: guard.info.adminId, acao: 'editar_exercicio', alvoTipo: 'exercise', alvoId: id, detalhes: { nome } })
    } else if (kind === 'variation') {
      const { error } = await admin
        .from('exercise_variations')
        .update({
          panda_video_id: vid(b.panda_video_id),
          duracao_seg: num(b.duracao_seg),
          instrucoes: vid(b.instrucoes),
        })
        .eq('id', id)
      if (error) throw error
      await adminLog({ adminId: guard.info.adminId, acao: 'editar_variacao', alvoTipo: 'exercise_variation', alvoId: id, detalhes: { video: Boolean(vid(b.panda_video_id)) } })
    } else if (kind === 'stretch') {
      const nome = (b.nome as string)?.trim()
      if (!nome) return NextResponse.json({ error: 'nome_obrigatorio' }, { status: 400 })
      const { error } = await admin
        .from('stretches')
        .update({
          nome,
          descricao: vid(b.descricao),
          panda_video_id: vid(b.panda_video_id),
          duracao_seg: num(b.duracao_seg),
        })
        .eq('id', id)
      if (error) throw error
      await adminLog({ adminId: guard.info.adminId, acao: 'editar_alongamento', alvoTipo: 'stretch', alvoId: id, detalhes: { nome } })
    } else {
      return NextResponse.json({ error: 'kind_invalido' }, { status: 400 })
    }
    return NextResponse.json({ ok: true, mensagem: 'Salvo.' })
  } catch (err) {
    return NextResponse.json({ error: `erro:${(err as Error).message}` }, { status: 500 })
  }
}
