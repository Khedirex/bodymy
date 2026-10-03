import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { adminApiGuard } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EXTENSOES = new Set(['mp3', 'm4a', 'aac', 'ogg', 'wav'])

// URL assinada de UPLOAD para o bucket privado 'audios'. O arquivo sobe
// direto do navegador para o Storage: não passa pela função (que tem limite
// de corpo) e um lote de 63 áudios não derruba nada.
export async function POST(request: NextRequest) {
  const guard = await adminApiGuard()
  if (!guard.ok) return guard.res

  const { modulo, ext } = (await request.json().catch(() => ({}))) as {
    modulo?: string
    ext?: string
  }
  const pasta = (modulo ?? 'oraciones').replace(/[^a-z0-9-]/gi, '').slice(0, 40) || 'oraciones'
  const extensao = (ext ?? 'mp3').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4)
  if (!EXTENSOES.has(extensao)) {
    return NextResponse.json({ error: 'formato_no_soportado' }, { status: 400 })
  }

  const path = `${pasta}/${crypto.randomUUID()}.${extensao}`
  try {
    const admin = createAdminClient()
    const { data, error } = await admin.storage.from('audios').createSignedUploadUrl(path)
    if (error) throw error
    return NextResponse.json({ path, token: data.token, signedUrl: data.signedUrl })
  } catch (err) {
    captureException(err, { rota: 'admin_audios_upload_url' })
    return NextResponse.json({ error: 'erro_ao_gerar_upload' }, { status: 500 })
  }
}
