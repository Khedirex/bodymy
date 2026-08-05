import 'server-only'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env, serverEnv } from '@/lib/env'

// Cliente com a SERVICE ROLE KEY — ignora RLS.
// USO EXCLUSIVO EM SERVIDOR (webhook Kiwify, criação de contas, URLs
// assinadas). O import de 'server-only' garante erro de build se este
// módulo vazar para o bundle do client.
export function createAdminClient() {
  const faltando: string[] = []
  if (!env.supabaseUrl) faltando.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) faltando.push('SUPABASE_SERVICE_ROLE_KEY')
  if (faltando.length > 0) {
    const msg =
      `[BodyMy] Configuração do Supabase (servidor) ausente: ${faltando.join(', ')}.\n` +
      `→ Preencha no .env.local. A SUPABASE_SERVICE_ROLE_KEY fica em ` +
      `Supabase → Project Settings → API → "Project API keys → service_role" ` +
      `(secreta — use SOMENTE no servidor).`
    // eslint-disable-next-line no-console
    console.error(msg)
    throw new Error(msg)
  }

  return createSupabaseClient(env.supabaseUrl, serverEnv.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
