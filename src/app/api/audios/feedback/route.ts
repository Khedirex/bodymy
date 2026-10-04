import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const RESPOSTAS = new Set(['dormi', 'relajo', 'no_ayudo'])

// Guarda a resposta do fim do áudio. O módulo vem do próprio áudio, não do
// corpo: o client não decide a que produto o retorno pertence.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const { audioId, resposta, comentario } = (await request.json().catch(() => ({}))) as {
    audioId?: string
    resposta?: string
    comentario?: string
  }
  if (!audioId || !resposta || !RESPOSTAS.has(resposta)) {
    return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()
    const { data: audio } = await admin
      .from('audio_biblioteca')
      .select('modulo')
      .eq('id', audioId)
      .maybeSingle()
    if (!audio) return NextResponse.json({ error: 'audio_no_encontrado' }, { status: 404 })

    const { error } = await admin.from('audio_feedback').insert({
      user_id: user.id,
      audio_id: audioId,
      modulo: audio.modulo as string,
      resposta,
      comentario: (comentario ?? '').trim().slice(0, 500) || null,
    })
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'audio_feedback' })
    return NextResponse.json({ error: 'no_pudimos_guardar' }, { status: 500 })
  }
}
