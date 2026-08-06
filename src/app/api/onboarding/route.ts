import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { captureException } from '@/lib/observability'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HORARIOS = ['manha', 'tarde', 'noite'] as const
type Horario = (typeof HORARIOS)[number]

// Salva a resposta do onboarding (horário preferido) e marca
// onboarding_completo. Substitui a antiga Server Action — mantém o app
// 100% em rotas /api (sem a fragilidade de action IDs entre builds).
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erro: 'nao_autenticado' }, { status: 401 })

  let body: { horario?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ erro: 'json_invalido' }, { status: 400 })
  }

  const horario = body.horario as Horario
  if (!HORARIOS.includes(horario)) {
    return NextResponse.json({ erro: 'horario_invalido' }, { status: 400 })
  }

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('quiz_data')
      .eq('id', user.id)
      .maybeSingle()

    const quizData = {
      ...(profile?.quiz_data ?? {}),
      horario_preferido: horario,
    }

    const { error } = await supabase
      .from('profiles')
      .update({ quiz_data: quizData, onboarding_completo: true })
      .eq('id', user.id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    captureException(err, { rota: 'onboarding' })
    return NextResponse.json({ erro: 'falha_ao_salvar' }, { status: 500 })
  }
}
