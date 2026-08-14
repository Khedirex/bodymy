import { createAdminClient } from '@/lib/supabase/admin'
import { CIRCUITO_PRODUCT_SLUG } from '@/lib/training'
import { ObrigadoView } from './ObrigadoView'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Bem-vinda ao BodyMy 🤍' }

// Número de suporte (WhatsApp). Ajuste no deploy conforme o negócio.
const WHATSAPP_SUPORTE = 'https://wa.me/5599999999999'

// Página pública pós-compra (Kiwify). Recebe ?email= opcional.
export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  // Aceita variações do nome do parâmetro que a Kiwify possa enviar.
  const ALIASES = ['email', 'customer_email', 'e-mail', 'mail', 'Email']
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
  const raw = ALIASES.map((k) => pick(searchParams[k])).find(Boolean)
  const email = raw && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw.trim()) ? raw.trim().toLowerCase() : null

  let produtoNome = 'seu programa BodyMy'
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('products')
      .select('nome')
      .eq('slug', CIRCUITO_PRODUCT_SLUG)
      .maybeSingle()
    if (data?.nome) produtoNome = data.nome as string
  } catch {
    /* mantém o fallback */
  }

  return <ObrigadoView email={email} produtoNome={produtoNome} whatsapp={WHATSAPP_SUPORTE} />
}
