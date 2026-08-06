import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getBaseDiet, getEsteira } from '@/lib/queries'
import { DietMenu } from '@/components/diet/DietMenu'
import { LockedProductCard } from '@/components/LockedProductCard'
import { EmptyState } from '@/components/ui/states'
import { SaladIcon } from '@/components/ui/icons'
import { todayISO } from '@/lib/dates'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Dieta — BodyMy' }

const DISCLAIMER =
  'Este conteúdo é educativo e não substitui acompanhamento de nutricionista ou médico.'

export default async function DietaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const [base, storefront] = await Promise.all([getBaseDiet(), getEsteira(profile.id)])

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
        <h1 className="text-2xl font-extrabold text-ink-900">Sua alimentação</h1>
        <p className="mt-1 text-ink-700">Ideias simples para o seu dia a dia.</p>
      </header>

      {/* Disclaimer fixo de conteúdo educativo */}
      <div className="rounded-2xl border border-gold-300/50 bg-gold-300/10 px-4 py-3 text-sm text-ink-700">
        <span className="mr-1" aria-hidden>
          ℹ️
        </span>
        {DISCLAIMER}
      </div>

      {base ? (
        <DietMenu days={base.days} diaInicial={diaInicial} />
      ) : (
        <EmptyState
          titulo="Cardápio em preparação"
          descricao="Em breve você encontra aqui sugestões de refeições para cada dia."
          icone={<SaladIcon width={28} height={28} />}
        />
      )}

      {/* Planos premium bloqueados */}
      {premium.length > 0 && (
        <section>
          <h2 className="section-title mb-2">Cardápios premium</h2>
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
