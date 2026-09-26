import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { captureException } from '@/lib/observability'
import type { Profile } from '@/types/db'

// Helpers de sessão para Server Components / Route Handlers.

// Lê o usuário de forma DEFENSIVA: getUser() pode, em cenários raros,
// rejeitar (falha de rede Vercel↔Supabase) ou retornar um shape
// inesperado. Nunca deixamos isso virar um crash genérico sem contexto.
// cache() = memória por REQUISIÇÃO. auth.getUser() é uma ida à rede; sem isso
// ela se repetia a cada chamador dentro do mesmo carregamento de página.
const lerUsuario = cache(async () => {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      // Sem sessão válida (ex.: token expirado) — não é erro fatal.
      return null
    }
    return data?.user ?? null
  } catch (err) {
    captureException(err, { fn: 'session.lerUsuario' })
    // Propaga como erro tratável para o boundary (retry costuma resolver
    // um problema transitório), com mensagem honesta.
    throw new Error('No pudimos verificar tu sesión ahora.')
  }
})

export async function getUser() {
  return lerUsuario()
}

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await lerUsuario()
  if (!user) return null

  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    captureException(new Error(`[session.getProfile] ${error.message}`), {
      code: error.code,
      userId: user.id,
    })
    // Não travamos por causa disso — devolvemos o esqueleto abaixo.
  }

  // Fallback: se o profile ainda não existe (ex: primeiríssimo acesso),
  // devolvemos um esqueleto com o e-mail do auth.
  if (!data) {
    return {
      id: user.id,
      nome: (user.user_metadata?.nome as string) ?? null,
      email: user.email ?? null,
      quiz_data: null,
      onboarding_completo: false,
      is_admin: false,
      created_at: user.created_at,
    }
  }
  return data as Profile
})
