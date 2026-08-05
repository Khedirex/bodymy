import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { serverEnv } from '@/lib/env'

// Cliente com a SERVICE ROLE KEY — ignora RLS.
// USO EXCLUSIVO EM SERVIDOR (webhook Kiwify, criação de contas, URLs
// assinadas). O import de 'server-only' garante erro de build se este
// módulo vazar para o bundle do client.
export function createAdminClient() {
  return createSupabaseClient(env.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
