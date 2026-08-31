import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getNutriAccess,
  getDietaAtiva,
  getHistorico,
  getNutriPerfil,
  getContextoProtocolo,
  NUTRI_PRODUCT_SLUG,
} from '@/lib/nutri'
import { NutriPanel } from '@/components/nutri/NutriPanel'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Sofía — BodyMy' }

const DISCLAIMER =
  'Este contenido es educativo y no sustituye el seguimiento de un nutricionista o médico.'

// Espaço privado da aluna com a Sofía: acompanhamento diário (plano de apoio +
// chat). O produto/entitlement, trial e gate são resolvidos no servidor.
export default async function SofiaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = createClient()
  const admin = createAdminClient()

  const [acesso, dietaAtiva, historico, perfil, contexto, nutriProduto] = await Promise.all([
    getNutriAccess(supabase, profile.id),
    getDietaAtiva(supabase, profile.id),
    getHistorico(supabase, profile.id, 40),
    getNutriPerfil(supabase, profile.id),
    getContextoProtocolo(supabase, profile.id),
    admin
      .from('products')
      .select('nome, kiwify_checkout_url')
      .eq('slug', NUTRI_PRODUCT_SLUG)
      .maybeSingle()
      .then((r) => r.data),
  ])

  return (
    <div className="space-y-5">
      <NutriPanel
        initialAcesso={acesso}
        initialDieta={dietaAtiva?.conteudo ?? null}
        initialHistorico={historico.map((h) => ({ papel: h.papel, conteudo: h.conteudo }))}
        initialPerfil={perfil}
        checkoutUrl={(nutriProduto?.kiwify_checkout_url as string) ?? null}
        produtoNome={(nutriProduto?.nome as string) ?? 'Acompañamiento Diario'}
        diaDoDesafio={contexto?.diaDoDesafio ?? null}
        nome={profile.nome}
      />

      <div className="rounded-2xl border border-gold-300/50 bg-gold-300/10 px-4 py-3 text-sm text-ink-700">
        <span className="mr-1" aria-hidden>
          ℹ️
        </span>
        {DISCLAIMER}
      </div>
    </div>
  )
}
