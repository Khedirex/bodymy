import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCheckinDates } from '@/lib/queries'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cria uma entrada de progresso (foto opcional + medidas + peso opcional).
// Peso NUNCA é obrigatório. Também registra um check-in do dia.
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'não autenticado' }, { status: 401 })

  let body: {
    foto_path?: string | null
    medidas?: Record<string, number> | null
    peso?: number | null
    nota?: string | null
    data?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'json inválido' }, { status: 400 })
  }

  const hoje = todayISO()
  const dataEntrada = body.data ?? hoje

  // Se enviou foto, garante que o path pertence ao próprio usuário.
  if (body.foto_path && !body.foto_path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: 'foto inválida' }, { status: 400 })
  }

  try {
    const { error } = await supabase.from('progress_entries').insert({
      user_id: user.id,
      data: dataEntrada,
      foto_path: body.foto_path ?? null,
      medidas: body.medidas ?? null,
      peso: body.peso ?? null,
      nota: body.nota ?? null,
    })
    if (error) throw error

    // Marca um check-in no dia da entrada (constância também conta aqui).
    await supabase
      .from('checkins')
      .upsert(
        { user_id: user.id, data: dataEntrada, tipo: 'treino' },
        { onConflict: 'user_id,data,tipo', ignoreDuplicates: true },
      )

    const datas = await getCheckinDates(user.id)
    const streak = calcularStreak(datas, hoje)
    return NextResponse.json({ ok: true, streak })
  } catch (err) {
    captureException(err, { rota: 'progress_create' })
    return NextResponse.json({ error: 'erro ao salvar progresso' }, { status: 500 })
  }
}
