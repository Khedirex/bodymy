import { createAdminClient } from '@/lib/supabase/admin'
import { CIRCUITO_PRODUCT_SLUGS } from '@/lib/training'
import { ObrigadoView } from './ObrigadoView'
import { SUPORTE_EMAIL, emailDosParams } from './params'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Bienvenida a BodyMy 🤍' }

// Página pública pós-compra (Kiwify). Recebe ?email= opcional.
export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const email = emailDosParams(searchParams)

  let produtoNome = 'tu programa BodyMy'
  try {
    const admin = createAdminClient()
    const { data } = await admin
      .from('products')
      .select('nome')
      .in('slug', CIRCUITO_PRODUCT_SLUGS)
      .limit(1)
      .maybeSingle()
    if (data?.nome) produtoNome = data.nome as string
  } catch {
    /* mantém o fallback */
  }

  return <ObrigadoView email={email} produtoNome={produtoNome} suporteEmail={SUPORTE_EMAIL} />
}
