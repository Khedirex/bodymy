import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { assertSupabaseEnv } from '@/lib/env'

type CookieToSet = { name: string; value: string; options: CookieOptions }

// Cliente Supabase para Server Components / Route Handlers.
// Respeita a sessão do usuário (cookies) e a RLS. Usa a anon key.
export function createClient() {
  const cookieStore = cookies()
  const { url, anonKey } = assertSupabaseEnv()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // `setAll` chamado de um Server Component sem resposta mutável.
          // O middleware cuida da renovação da sessão, então é seguro ignorar.
        }
      },
    },
  })
}
