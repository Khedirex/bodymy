'use client'

import { createBrowserClient } from '@supabase/ssr'
import { assertSupabaseEnv } from '@/lib/env'

// Cookies de auth com vida longa (1 ano) para a sessão sobreviver a
// fechar/reabrir o app e reiniciar o celular. A duração real da sessão
// ainda depende da validade do refresh token (config no painel Supabase).
const LONG_COOKIE = {
  maxAge: 60 * 60 * 24 * 365, // 1 ano
  sameSite: 'lax' as const,
  path: '/',
}

// Cliente Supabase para uso no browser (Client Components).
// Usa apenas a anon key + RLS. Nunca a service role.
export function createClient() {
  const { url, anonKey } = assertSupabaseEnv()
  return createBrowserClient(url, anonKey, { cookieOptions: LONG_COOKIE })
}
