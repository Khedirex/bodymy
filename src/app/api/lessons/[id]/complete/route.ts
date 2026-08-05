import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLessonForUser, getCheckinDates } from '@/lib/queries'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Conclui uma aula: registra lesson_completion + checkin de treino do dia
// e devolve o streak atualizado e a próxima aula (para a celebração).
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  // Valida acesso no servidor (nunca confia só no front).
  const { hasAccess, ctx } = await getLessonForUser(user.id, params.id)
  if (!hasAccess || !ctx) {
    return NextResponse.json({ error: 'sem acesso a esta aula' }, { status: 403 })
  }

  const hoje = todayISO()

  try {
    // Registra conclusão (idempotente via unique user_id+lesson_id).
    const { error: compErr } = await supabase
      .from('lesson_completions')
      .upsert(
        { user_id: user.id, lesson_id: params.id },
        { onConflict: 'user_id,lesson_id', ignoreDuplicates: true },
      )
    if (compErr) throw compErr

    // Check-in de treino do dia (idempotente via unique user_id+data+tipo).
    const { error: ckErr } = await supabase
      .from('checkins')
      .upsert(
        { user_id: user.id, data: hoje, tipo: 'treino' },
        { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
      )
    if (ckErr) throw ckErr

    const datas = await getCheckinDates(user.id)
    const streak = calcularStreak(datas, hoje)

    return NextResponse.json({
      ok: true,
      streak,
      proxima: ctx.proxima,
    })
  } catch (err) {
    captureException(err, { rota: 'lesson_complete', lessonId: params.id })
    return NextResponse.json({ error: 'erro ao concluir aula' }, { status: 500 })
  }
}
