import { createAdminClient } from '@/lib/supabase/admin'
import { CIRCUITO_PRODUCT_SLUGS } from '@/lib/training'
import { ObrigadoView } from './ObrigadoView'
import { SUPORTE_EMAIL, emailDosParams } from './params'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Bienvenida a BodyMy 🤍' }

// Página pública pós-compra. Aceita ?email= e ?produto=<slug>.
//
// O `produto` importa agora que o app vende vários: sem ele, quem comprava o
// Ritual Noche Perfecta via "Tu acceso a Protocolo Descompresión Articular",
// porque o nome era buscado sempre pelo slug do circuito.
export default async function ObrigadoPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const email = emailDosParams(searchParams)

  const bruto = searchParams.produto ?? searchParams.product
  const slug = (Array.isArray(bruto) ? bruto[0] : bruto)?.trim().toLowerCase() || null

  let produtoNome = 'tu programa BodyMy'
  try {
    const admin = createAdminClient()
    // Com slug: o produto comprado. Sem slug: cai no protocolo principal,
    // que é o comportamento de antes (links antigos seguem funcionando).
    const q = admin.from('products').select('nome')
    const { data } = slug
      ? await q.eq('slug', slug).limit(1).maybeSingle()
      : await q.in('slug', CIRCUITO_PRODUCT_SLUGS).limit(1).maybeSingle()
    if (data?.nome) produtoNome = data.nome as string
  } catch {
    /* mantém o fallback */
  }

  return <ObrigadoView email={email} produtoNome={produtoNome} suporteEmail={SUPORTE_EMAIL} />
}
