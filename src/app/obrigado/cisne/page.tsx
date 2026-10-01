import { createAdminClient } from '@/lib/supabase/admin'
import { CISNE_PRODUCT_SLUG, CISNE_NOME, CISNE_GUIA_PDF } from '@/lib/cisne'
import { ObrigadoView } from '../ObrigadoView'
import { SUPORTE_EMAIL, emailDosParams } from '../params'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Bienvenida a Reset Postura de Cisne 🤍' }

// Página pública pós-compra do Reset Postura de Cisne (Hotmart). Mesmo
// fluxo do /obrigado + onde achar o reto no app + o PDF para baixar.
// Configure na Hotmart: página de obrigado = https://<app>/obrigado/cisne
export default async function ObrigadoCisnePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const email = emailDosParams(searchParams)

  let produtoNome = `${CISNE_NOME} — Reto 14 días`
  try {
    const admin = createAdminClient()
    const { data } = await admin.from('products').select('nome').eq('slug', CISNE_PRODUCT_SLUG).maybeSingle()
    if (data?.nome) produtoNome = data.nome as string
  } catch {
    /* mantém o fallback */
  }

  return (
    <ObrigadoView
      email={email}
      produtoNome={produtoNome}
      suporteEmail={SUPORTE_EMAIL}
      guia={{
        url: CISNE_GUIA_PDF,
        arquivo: 'Reset-Postura-de-Cisne-Reto-14-Dias.pdf',
        titulo: produtoNome,
        ondeNoApp:
          'Al entrar, tócalo en Inicio → “Hoy” (o en la pestaña “Tu plan”). Cada día se abre un nuevo día del reto.',
      }}
    />
  )
}
