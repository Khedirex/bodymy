'use client'

import { createBrowserClient } from '@supabase/ssr'
import { assertSupabaseEnv } from '@/lib/env'

// Cliente Supabase para uso no browser (Client Components).
// Usa apenas a anon key + RLS. Nunca a service role.
export function createClient() {
  const { url, anonKey } = assertSupabaseEnv()
  return createBrowserClient(url, anonKey)
}
