import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getBaseDiet, getEsteira } from '@/lib/queries'
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
import { DietMenu } from '@/components/diet/DietMenu'
import { LockedProductCard } from '@/components/LockedProductCard'
import { EmptyState } from '@/components/ui/states'
import { SaladIcon } from '@/components/ui/icons'
import { todayISO } from '@/lib/dates'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dieta — BodyMy' }

const DISCLAIMER =
  'Este contenido es educativo y no sustituye el seguimiento de un nutricionista o médico.'

export default async function DietaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const supabase = createClient()
  const admin = createAdminClient()

  const [base, storefront, acesso, dietaAtiva, historico, perfil, contexto, nutriProduto] =
    await Promise.all([
      getBaseDiet(),
      getEsteira(profile.id),
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

  // "Cardápio do dia": rotaciona pelos dias do plano conforme a data.
  const totalDias = base?.days.length ?? 7
  const hoje = todayISO()
  const [y, m, d] = hoje.split('-').map(Number)
  const diaDoAno = Math.floor(
    (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86_400_000,
  )
  const diaInicial = totalDias > 0 ? (diaDoAno % totalDias) + 1 : 1

  const premium = storefront.filter(
    (s) => s.product.tipo === 'dieta_premium' && !s.liberado,
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Tu alimentación</h1>
        <p className="mt-1 text-ink-700">Ideas simples para tu día a día.</p>
      </header>

      {/* Acompañamiento Diario (asistente do reto + plano de apoio + chat) */}
      <NutriPanel
        initialAcesso={acesso}
        initialDieta={dietaAtiva?.conteudo ?? null}
        initialHistorico={historico.map((h) => ({ papel: h.papel, conteudo: h.conteudo }))}
        initialPerfil={perfil}
        checkoutUrl={(nutriProduto?.kiwify_checkout_url as string) ?? null}
        produtoNome={(nutriProduto?.nome as string) ?? 'Acompañamiento Diario'}
        diaDoDesafio={contexto?.diaDoDesafio ?? null}
      />

      {/* Disclaimer fixo de conteúdo educativo */}
      <div className="rounded-2xl border border-gold-300/50 bg-gold-300/10 px-4 py-3 text-sm text-ink-700">
        <span className="mr-1" aria-hidden>
          ℹ️
        </span>
        {DISCLAIMER}
      </div>

      <section>
        <h2 className="section-title mb-2">Menú base</h2>
        {base ? (
          <DietMenu days={base.days} diaInicial={diaInicial} />
        ) : (
          <EmptyState
            titulo="Menú en preparación"
            descricao="Muy pronto encontrarás aquí sugerencias de comidas para cada día."
            icone={<SaladIcon width={28} height={28} />}
          />
        )}
      </section>

      {/* Planos premium bloqueados */}
      {premium.length > 0 && (
        <section>
          <h2 className="section-title mb-2">Menús premium</h2>
          <div className="space-y-3">
            {premium.map((s) => (
              <LockedProductCard key={s.product.id} product={s.product} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
