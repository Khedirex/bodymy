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

  const { modulo, data, resposta, comentario } = (await request.json().catch(() => ({}))) as {
    modulo?: string
    data?: string
    resposta?: string
    comentario?: string
  }
  if (!modulo || !data || !resposta || !RESPOSTAS.has(resposta)) {
    return NextResponse.json({ error: 'faltan_parametros' }, { status: 400 })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return NextResponse.json({ error: 'fecha_invalida' }, { status: 400 })
  }

  try {
    const admin = createAdminClient()

    // Se a noite teve um áudio só, guardamos qual foi: ajuda a saber que
    // faixa estava tocando nas noites que ela avaliou mal.
    const { data: escutas } = await admin
      .from('audio_escutas')
      .select('audio_id')
      .eq('user_id', user.id)
      .eq('modulo', modulo)
      .eq('data', data)

    const { error } = await admin.from('audio_feedback').upsert(
      {
        user_id: user.id,
        audio_id: escutas?.length === 1 ? (escutas[0].audio_id as string) : null,
        modulo,
        data,
        resposta,
        comentario: (comentario ?? '').trim().slice(0, 500) || null,
      },
      { onConflict: 'user_id,modulo,data' },
    )
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'audio_feedback' })
    return NextResponse.json({ error: 'no_pudimos_guardar' }, { status: 500 })
  }
}
