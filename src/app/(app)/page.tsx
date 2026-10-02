import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getCheckinDates, getEsteira } from '@/lib/queries'
import { getModulosDaAluna, escolherPrincipal } from '@/lib/modulos'
import { calcularStreak } from '@/lib/streak'
import { todayISO, addDaysISO } from '@/lib/dates'
import { HomeDash, type DiaSemana } from '@/components/home/HomeDash'
import { ModuloDestaque, CarrosselModulos } from '@/components/home/ModuloCard'
import { LockedProductCard } from '@/components/LockedProductCard'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

// Quantos produtos da esteira mostrar no resumo da Home.
const ESTEIRA_RESUMO = 4

// A Home é o PAINEL DA ROTINA. Ela não conhece produto por nome: lê o
// registro de módulos (src/lib/modulos.ts) e mostra o que a compra liberou.
export default async function HomePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const [datas, storefront, modulos] = await Promise.all([
    getCheckinDates(profile.id),
    getEsteira(profile.id),
    getModulosDaAluna(profile.id),
  ])

  const hoje = todayISO()
  const streak = calcularStreak(datas, hoje)

  // Resumo da semana (últimos 7 dias, do mais antigo até hoje).
  const feitos = new Set(datas)
  const semana: DiaSemana[] = Array.from({ length: 7 }, (_, i) => {
    const data = addDaysISO(hoje, -(6 - i))
    return { data, fez: feitos.has(data), ehHoje: data === hoje }
  })
  const perdidos = semana.filter((d) => !d.fez && !d.ehHoje).length

  const principal = escolherPrincipal(modulos)
  // O carrossel só existe a partir do segundo produto.
  const outros = modulos.filter((m) => m.modulo.slug !== principal?.modulo.slug)

  const primeiroNome = (profile.nome ?? '').split(' ')[0] || 'Hola'
  const bloqueados = storefront.filter((s) => !s.liberado)

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm text-ink-700">Hola,</p>
        <h1 className="text-2xl font-extrabold text-ink-900">{primeiroNome} 🤍</h1>
      </header>

      <InstallBanner />

      {/* Constância — vale para a rotina inteira, não para um produto só. */}
      {modulos.length > 0 && (
        <HomeDash
          diaDoDesafio={principal?.estado ? principal.estado.concluidos + 1 : null}
          diasFeitos={principal?.estado?.concluidos ?? 0}
          totalDias={principal?.estado?.total ?? 0}
          streakAtual={streak.atual}
          fezHoje={streak.fezHoje}
          semana={semana}
          perdidos={perdidos}
        />
      )}

      {/* Hoje: o módulo principal da compra */}
      <section>
        <h2 className="section-title mb-2">Hoy</h2>
        {principal ? (
          <ModuloDestaque item={principal} />
        ) : (
          <EmptyState
            titulo="Tu rutina aparece aquí"
            descricao="En cuanto tu acceso esté activo, lo de hoy aparecerá en este espacio."
            icone={<LockIcon width={28} height={28} />}
          />
        )}
      </section>

      {/* A partir do segundo produto, as rotinas dela viram carrossel. */}
      <CarrosselModulos itens={outros} />

      {/* O que ela ainda não tem — sempre por último. */}
      {bloqueados.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="section-title">Para ti</h2>
            <Link href="/descubra" className="text-sm font-semibold text-coral-600">
              Ver todo
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {bloqueados.slice(0, ESTEIRA_RESUMO).map((s) => (
              <LockedProductCard key={s.product.id} product={s.product} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
