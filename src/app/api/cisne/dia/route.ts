import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { hasCisneAccess, getCisneEstado, podeAbrirDia } from '@/lib/cisne-server'
import { isDiaValido } from '@/lib/cisne'
import { getCheckinDates } from '@/lib/queries'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Conclui um dia do Reset Postura de Cisne: grava o diário (dia + como
// ficou o pescoço) e o check-in 'treino' do dia (mantém o streak).
// Repetir um dia já feito só atualiza a nota do pescoço e o check-in.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'no_autenticado' }, { status: 401 })

  const b = (await request.json().catch(() => ({}))) as { dia?: number; cuello?: number | null }
  const dia = Number(b.dia)
  if (!isDiaValido(dia)) return NextResponse.json({ error: 'dia_invalido' }, { status: 400 })
  const cuello =
    typeof b.cuello === 'number' && Number.isInteger(b.cuello) && b.cuello >= 1 && b.cuello <= 5
      ? b.cuello
      : null

  // Acesso validado no servidor (nunca só no front).
  if (!(await hasCisneAccess(user.id))) {
    return NextResponse.json({ error: 'sin_acceso' }, { status: 403 })
  }

  try {
    const estado = await getCisneEstado(user.id)
    if (!podeAbrirDia(estado, dia)) {
      return NextResponse.json({ error: 'dia_bloqueado' }, { status: 409 })
    }

    const hoje = todayISO()
    const jaFeito = estado.registros.get(dia)

    if (jaFeito) {
      // Repetição (manutenção): mantém a data original do dia no reto.
      if (cuello !== null) {
        const { error } = await supabase
          .from('cisne_registros')
          .update({ cuello })
          .eq('user_id', user.id)
          .eq('dia', dia)
        if (error) throw error
      }
    } else {
      const { error } = await supabase
        .from('cisne_registros')
        .insert({ user_id: user.id, dia, cuello, data: hoje })
      if (error) throw error
    }

    const { error: ckErr } = await supabase
      .from('checkins')
      .upsert(
        { user_id: user.id, data: hoje, tipo: 'treino' },
        { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
      )
    if (ckErr) throw ckErr

    const streak = calcularStreak(await getCheckinDates(user.id), hoje)
    return NextResponse.json({ ok: true, dia, repeticao: Boolean(jaFeito), streak })
  } catch (err) {
    captureException(err, { rota: 'cisne_dia', dia })
    return NextResponse.json({ error: 'no_pudimos_guardar' }, { status: 500 })
  }
}
