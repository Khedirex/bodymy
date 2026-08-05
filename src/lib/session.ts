import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/db'

// Helpers de sessão para Server Components / Route Handlers.

export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fallback: se o profile ainda não existe (ex: primeiríssimo acesso),
  // devolvemos um esqueleto com o e-mail do auth.
  if (!data) {
    return {
      id: user.id,
      nome: (user.user_metadata?.nome as string) ?? null,
      email: user.email ?? null,
      quiz_data: null,
      onboarding_completo: false,
      created_at: user.created_at,
    }
  }
  return data as Profile
}
