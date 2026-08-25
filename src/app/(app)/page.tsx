import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getCheckinDates, getEsteira } from '@/lib/queries'
import { createClient } from '@/lib/supabase/server'
import { getTrainingConfig, hasCircuitoAccess } from '@/lib/circuito'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import { StreakBadge } from '@/components/StreakBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { LockedProductCard } from '@/components/LockedProductCard'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { EmptyState } from '@/components/ui/states'
import { PlayIcon, ChevronRight, SaladIcon, LockIcon, BookIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const supabase = createClient()
  const [datas, storefront, temAcesso, config] = await Promise.all([
    getCheckinDates(profile.id),
    getEsteira(profile.id),
    hasCircuitoAccess(supabase, profile.id),
    getTrainingConfig(supabase, profile.id),
  ])

  const hoje = todayISO()
  const streak = calcularStreak(datas, hoje)

  // Rótulo do "Hoje" conforme o estágio do circuito.
  const chipHoje = !config
    ? 'Vamos a empezar'
    : `Semana ${config.semana_atual} · Día ${config.dia_atual}`
  const tituloHoje = 'Tu entrenamiento de hoy'
  // Progresso nas 4 semanas (28 dias).
  const diasFeitos = config ? (config.semana_atual - 1) * 7 + (config.dia_atual - 1) : 0

  const primeiroNome = (profile.nome ?? '').split(' ')[0] || 'Hola'
  const bloqueados = storefront.filter((s) => !s.liberado)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-700">Hola,</p>
          <h1 className="text-2xl font-extrabold text-ink-900">{primeiroNome} 🤍</h1>
        </div>
        <StreakBadge dias={streak.atual} />
      </header>

      <InstallBanner />

      {/* Card "Hoje" — circuito */}
      <section>
        <h2 className="section-title mb-2">Hoje</h2>
        {temAcesso ? (
          <div className="card">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-coral-600">
              <span className="chip">{chipHoje}</span>
            </div>
            <h3 className="text-lg font-bold text-ink-900">{tituloHoje}</h3>
            <p className="mt-1 text-sm text-ink-700">
              Movilidad + 5 ejercicios · se ajusta a ti
            </p>
            <div className="mt-4">
              <Link href="/treino" className="btn-primary w-full">
                <PlayIcon width={20} height={20} /> Empezar ahora
              </Link>
            </div>
            {config ? (
              <div className="mt-4">
                <ProgressBar atual={diasFeitos} total={28} label="Tu progreso en las 4 semanas" />
              </div>
            ) : null}
          </div>
        ) : (
          <EmptyState
            titulo="Tu entrenamiento aparece aquí"
            descricao="En cuanto tu acceso esté activo, tu circuito del día aparecerá en este espacio."
            icone={<LockIcon width={28} height={28} />}
          />
        )}
      </section>

      {/* Material complementar: as 28 aulas viram "Entenda a prática" */}
      {temAcesso ? (
        <Link href="/entenda" className="card flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cream-200 text-ink-800">
            <BookIcon width={22} height={22} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-ink-900">Comprende la práctica</p>
            <p className="text-sm text-ink-700">Textos cortos sobre el movimiento somático</p>
          </div>
          <ChevronRight className="text-ink-700/40" width={20} height={20} />
        </Link>
      ) : null}

      {/* Atalho para o cardápio do dia */}
      <Link
        href="/dieta"
        className="card flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
          <SaladIcon width={22} height={22} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-ink-900">Menú de hoy</p>
          <p className="text-sm text-ink-700">Ideas simples para tu alimentación</p>
        </div>
        <ChevronRight className="text-ink-700/40" width={20} height={20} />
      </Link>

      {/* Carrossel Descubra */}
      {bloqueados.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="section-title">Descubre</h2>
            <Link href="/descubra" className="text-sm font-semibold text-coral-600">
              Ver todo
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {bloqueados.map((s) => (
              <LockedProductCard key={s.product.id} product={s.product} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
