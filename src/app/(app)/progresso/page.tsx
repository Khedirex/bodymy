import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getProfile } from '@/lib/session'
import { getCheckinDates, getProgressEntries } from '@/lib/queries'
import { calcularStreak, constanciaSemanal } from '@/lib/streak'
import { todayISO, formatDataBR } from '@/lib/dates'
import { Calendar } from '@/components/progress/Calendar'
import { ConstancyChart } from '@/components/progress/ConstancyChart'
import { AddProgressForm } from '@/components/progress/AddProgressForm'
import { StreakBadge } from '@/components/StreakBadge'
import { EmptyState } from '@/components/ui/states'
import { ChartIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Progresso — BodyMy' }

export default async function ProgressoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const hoje = todayISO()
  const [datas, entries] = await Promise.all([
    getCheckinDates(profile.id),
    getProgressEntries(profile.id),
  ])

  const streak = calcularStreak(datas, hoje)
  const semanas = constanciaSemanal(datas, hoje, 6)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Seu progresso</h1>
        <p className="mt-1 text-ink-700">Cada dia conta. Olhe o quanto você já caminhou.</p>
      </header>

      {/* Streak atual + recorde */}
      <div className="flex items-center justify-between gap-3 rounded-3xl bg-white p-5 shadow-card">
        <div>
          <p className="text-sm text-ink-700">Sequência atual</p>
          <p className="text-3xl font-extrabold text-coral-600">
            {streak.atual}
            <span className="ml-1 text-base font-semibold text-ink-700">
              {streak.atual === 1 ? 'dia' : 'dias'}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-ink-700">Seu recorde</p>
          <p className="text-3xl font-extrabold text-ink-900">
            {streak.recorde}
            <span className="ml-1 text-base font-semibold text-ink-700">
              {streak.recorde === 1 ? 'dia' : 'dias'}
            </span>
          </p>
        </div>
      </div>

      {/* Calendário */}
      <section>
        <h2 className="section-title mb-2">Seus dias ativos</h2>
        <Calendar checkinDates={datas} hoje={hoje} />
      </section>

      {/* Constância */}
      <ConstancyChart semanas={semanas} />

      {/* Linha do tempo */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="section-title">Linha do tempo</h2>
          <StreakBadge dias={streak.atual} />
        </div>

        <div className="mb-3">
          <AddProgressForm />
        </div>

        {entries.length === 0 ? (
          <EmptyState
            titulo="Comece sua linha do tempo"
            descricao="Registre uma foto ou uma medida quando quiser. É só para você acompanhar sua evolução, no seu tempo."
            icone={<ChartIcon width={28} height={28} />}
          />
        ) : (
          <ul className="space-y-3">
            {entries.map((e) => (
              <li key={e.id} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-bold text-ink-900">{formatDataBR(e.data)}</p>
                </div>
                {e.fotoUrl ? (
                  <div className="relative mb-3 h-56 w-full overflow-hidden rounded-2xl bg-cream-100">
                    <Image
                      src={e.fotoUrl}
                      alt={`Registro de ${formatDataBR(e.data)}`}
                      fill
                      sizes="(max-width: 448px) 100vw, 448px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
                {e.medidas ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {Object.entries(e.medidas).map(([k, v]) => (
                      <span key={k} className="chip capitalize">
                        {k}: {v} cm
                      </span>
                    ))}
                  </div>
                ) : null}
                {e.peso ? <span className="chip">Peso: {e.peso} kg</span> : null}
                {e.nota ? <p className="mt-2 text-ink-800">{e.nota}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
