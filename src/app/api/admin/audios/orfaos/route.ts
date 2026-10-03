import { NextResponse, type NextRequest } from 'next/server'
import { adminApiGuard, adminLog } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Remove do bucket arquivos que NÃO estão no catálogo (órfãos).
// Confere a ausência no catálogo antes de apagar: um bug meu aqui apagaria
// áudio em uso, e áudio apagado não volta — não há backup de Storage.
export async function DELETE(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const { paths } = (await request.json().catch(() => ({}))) as { paths?: string[] }
  if (!paths || paths.length === 0) {
    return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { data: usados } = await admin
      .from('audio_biblioteca')
      .select('storage_path')
      .in('storage_path', paths)

    const emUso = new Set((usados ?? []).map((r) => r.storage_path as string))
    const apagar = paths.filter((p) => !emUso.has(p))
    if (apagar.length === 0) {
      return NextResponse.json({ ok: true, apagados: 0, recusados: paths.length })
    }

    const { error } = await admin.storage.from('audios').remove(apagar)
    if (error) throw error

    await adminLog({
      adminId: guard.info.adminId,
      acao: 'limpar_audios_orfaos',
      alvoTipo: 'bucket',
      detalhes: { quantos: apagar.length },
    })

    return NextResponse.json({ ok: true, apagados: apagar.length, recusados: paths.length - apagar.length })
  } catch (err) {
    captureException(err, { rota: 'admin_audios_orfaos' })
    return NextResponse.json({ error: 'erro_ao_remover' }, { status: 500 })
  }
}
