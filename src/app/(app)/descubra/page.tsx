import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getEsteira } from '@/lib/queries'
import { LockedProductCard } from '@/components/LockedProductCard'
import { EmptyState } from '@/components/ui/states'
import { CompassIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Descubra — BodyMy' }

export default async function DescubraPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  // Vitrine = esteira: só o que é upsell dos produtos que ela já possui.
  const storefront = await getEsteira(profile.id)
  const liberados = storefront.filter((s) => s.liberado)
  const bloqueados = storefront.filter((s) => !s.liberado)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Descubra</h1>
        <p className="mt-1 text-ink-700">
          Tudo o que o BodyMy tem para você. Desbloqueie no seu tempo.
        </p>
      </header>

      {bloqueados.length > 0 && (
        <section>
          <h2 className="section-title mb-2">Para desbloquear</h2>
          <div className="space-y-3">
            {bloqueados.map((s) => (
              <LockedProductCard key={s.product.id} product={s.product} />
            ))}
          </div>
        </section>
      )}

      {liberados.length > 0 && (
        <section>
          <h2 className="section-title mb-2">Seus acessos</h2>
          <div className="space-y-3">
            {liberados.map((s) => (
              <LockedProductCard key={s.product.id} product={s.product} liberado />
            ))}
          </div>
        </section>
      )}

      {storefront.length === 0 && (
        <EmptyState
          titulo="Em breve, novidades"
          descricao="Estamos preparando novos programas e conteúdos para você."
          icone={<CompassIcon width={28} height={28} />}
        />
      )}
    </div>
  )
}
