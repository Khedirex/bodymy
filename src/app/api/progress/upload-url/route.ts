import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Gera uma URL assinada de UPLOAD para o bucket privado progress-photos.
// O path é sempre prefixado por user_id/ para isolar as fotos.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  let body: { ext?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const ext = (body.ext ?? 'jpg').replace(/[^a-z0-9]/gi, '').slice(0, 5) || 'jpg'
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.storage
      .from('progress-photos')
      .createSignedUploadUrl(path)
    if (error) throw error
    return NextResponse.json({ path, token: data.token, signedUrl: data.signedUrl })
  } catch (err) {
    captureException(err, { rota: 'progress_upload_url' })
    return NextResponse.json({ error: 'erro ao gerar upload' }, { status: 500 })
  }
}
