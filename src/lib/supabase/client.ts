'use client'

import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

// Cliente Supabase para uso no browser (Client Components).
// Usa apenas a anon key + RLS. Nunca a service role.
export function createClient() {
  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey)
}
