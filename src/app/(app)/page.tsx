import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import {
  getPrimaryProgram,
  getProgramTrack,
  getCheckinDates,
  getEsteira,
} from '@/lib/queries'
import { calcularStreak } from '@/lib/streak'
import { todayISO } from '@/lib/dates'
import { StreakBadge } from '@/components/StreakBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { LockedProductCard } from '@/components/LockedProductCard'
import { InstallBanner } from '@/components/pwa/InstallBanner'
import { EmptyState } from '@/components/ui/states'
import { PlayIcon, ChevronRight, SaladIcon, LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const [primary, datas, storefront] = await Promise.all([
    getPrimaryProgram(profile.id),
    getCheckinDates(profile.id),
    getEsteira(profile.id),
  ])

  const hoje = todayISO()
  const streak = calcularStreak(datas, hoje)

  const track = primary ? await getProgramTrack(profile.id, primary.program.slug) : null
  const proxima = track?.nextLesson ?? null
  const programaConcluido = track ? track.completedCount >= track.totalLessons && track.totalLessons > 0 : false

  const primeiroNome = (profile.nome ?? '').split(' ')[0] || 'Olá'
  const bloqueados = storefront.filter((s) => !s.liberado)

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-ink-700">Oi,</p>
          <h1 className="text-2xl font-extrabold text-ink-900">{primeiroNome} 🤍</h1>
        </div>
        <StreakBadge dias={streak.atual} />
      </header>

      <InstallBanner />

      {/* Card "Hoje" */}
      <section>
        <h2 className="section-title mb-2">Hoje</h2>
        {track && proxima ? (
          <div className="card">
            <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-coral-600">
              <span className="chip">
                Semana {proxima.weekNumero} · Dia {proxima.dayNumero}
              </span>
            </div>
            <h3 className="text-lg font-bold text-ink-900">{proxima.lesson.titulo}</h3>
            <p className="mt-1 text-sm text-ink-700">
              {proxima.lesson.duracao_min} min · no seu ritmo
            </p>
            <div className="mt-4">
              <Link
                href={`/programa/${track.program.slug}/aula/${proxima.lesson.id}`}
                className="btn-primary w-full"
              >
                <PlayIcon width={20} height={20} /> Começar agora
              </Link>
            </div>
            <div className="mt-4">
              <ProgressBar
                atual={track.completedCount}
                total={track.totalLessons}
                label="Seu progresso no programa"
              />
            </div>
          </div>
        ) : track && programaConcluido ? (
          <div className="card text-center">
            <div className="mb-2 text-4xl" aria-hidden>
              🏆
            </div>
            <h3 className="text-lg font-bold text-ink-900">Você concluiu o programa!</h3>
            <p className="mt-1 text-sm text-ink-700">
              Que constância linda. Continue se movimentando no seu ritmo.
            </p>
            <Link href={`/programa/${track.program.slug}`} className="btn-secondary mt-4 w-full">
              Rever meu programa
            </Link>
          </div>
        ) : (
          <EmptyState
            titulo="Seu programa aparece aqui"
            descricao="Assim que seu acesso estiver ativo, sua aula do dia aparece neste espaço."
            icone={<LockIcon width={28} height={28} />}
          />
        )}
      </section>

      {/* Atalho para o cardápio do dia */}
      <Link
        href="/dieta"
        className="card flex items-center gap-3"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sage-100 text-sage-600">
          <SaladIcon width={22} height={22} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-ink-900">Cardápio de hoje</p>
          <p className="text-sm text-ink-700">Ideias simples para a sua alimentação</p>
        </div>
        <ChevronRight className="text-ink-700/40" width={20} height={20} />
      </Link>

      {/* Carrossel Descubra */}
      {bloqueados.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="section-title">Descubra</h2>
            <Link href="/descubra" className="text-sm font-semibold text-coral-600">
              Ver tudo
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
