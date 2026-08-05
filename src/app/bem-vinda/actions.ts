'use server'

import { createClient } from '@/lib/supabase/server'

type Horario = 'manha' | 'tarde' | 'noite'

// Salva a resposta do onboarding e marca onboarding_completo.
export async function completarOnboarding(horario: Horario) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, erro: 'sem sessão' }

  // Lê quiz_data atual para mesclar.
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

  if (error) return { ok: false as const, erro: error.message }
  return { ok: true as const }
}
