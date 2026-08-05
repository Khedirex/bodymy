import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

type CookieToSet = { name: string; value: string; options: CookieOptions }

// Cliente Supabase para Server Components / Route Handlers.
// Respeita a sessão do usuário (cookies) e a RLS. Usa a anon key.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
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
