import { createAdminClient } from '@/lib/supabase/admin'
import { PRODUTO_PRINCIPAL_SLUG } from '@/lib/training'
import { ObrigadoView } from './ObrigadoView'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Bienvenida a BodyMy 🤍' }

// Suporte por e-mail (por enquanto). Ajuste conforme o negócio.
const SUPORTE_EMAIL = 'soporte@bodymy.online'

// Página pública pós-compra (Hotmart/Kiwify). Recebe ?email= e ?produto=
// (slug) opcionais; sem produto, mostra o produto principal.
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

  const slugPedido = pick(searchParams.produto)
  const slug = slugPedido && /^[a-z0-9-]{1,60}$/.test(slugPedido) ? slugPedido : PRODUTO_PRINCIPAL_SLUG

  let produtoNome = 'tu programa BodyMy'
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('products').select('nome').eq('slug', slug).maybeSingle()
    if (data?.nome) produtoNome = data.nome as string
  } catch {
    /* mantém o fallback */
  }

  return <ObrigadoView email={email} produtoNome={produtoNome} suporteEmail={SUPORTE_EMAIL} />
}
