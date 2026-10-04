import { createAdminClient } from '@/lib/supabase/admin'
import { MODULOS } from '@/lib/modulos'
import { BIBLIOTECAS } from '@/lib/bibliotecas'
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

  // O módulo que a compra abre, lido do registro: a página de obrigado não
  // conhece produto por nome, e um produto novo não precisa de mudança aqui.
  const modulo = slug ? MODULOS.find((m) => m.productSlugs.includes(slug)) : undefined

  // Produto com guia em PDF: ela baixa na hora, sem esperar o login. É a
  // primeira entrega concreta da compra.
  const biblioteca = slug
    ? BIBLIOTECAS.find((b) => b.guiaPdf && b.productSlugs.includes(slug))
    : undefined
  const guia = biblioteca?.guiaPdf
    ? {
        url: biblioteca.guiaPdf,
        arquivo: biblioteca.guiaPdf.split('/').pop() ?? 'guia.pdf',
        titulo: biblioteca.guiaTitulo ?? 'Tu guía en PDF',
        ondeNoApp: `Los audios están en el app, en "${biblioteca.nome}".`,
      }
    : undefined

  return (
    <ObrigadoView
      email={email}
      produtoNome={produtoNome}
      suporteEmail={SUPORTE_EMAIL}
      guia={guia}
      moduloHref={modulo?.href}
      moduloChamada={modulo ? `${modulo.nome}: ${modulo.resumo}.` : undefined}
    />
  )
}
