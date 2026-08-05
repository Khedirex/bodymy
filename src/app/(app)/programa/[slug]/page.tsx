import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getProgramMeta, getProgramTrack } from '@/lib/queries'
import { SalesView } from '@/components/SalesView'
import { ProgressBar } from '@/components/ProgressBar'
import { CheckIcon, LockIcon, PlayIcon, ChevronRight } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function ProgramaPage({ params }: { params: { slug: string } }) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const meta = await getProgramMeta(params.slug)
  if (!meta) notFound()

  const track = await getProgramTrack(profile.id, params.slug)

  // Sem entitlement → a vitrine vira ponto de venda no lugar do conteúdo.
  if (!track) {
    return <SalesView product={meta.product} />
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-coral-600">Seu programa</p>
        <h1 className="text-2xl font-extrabold text-ink-900">{track.program.nome}</h1>
        {track.program.descricao ? (
          <p className="mt-1 text-ink-700">{track.program.descricao}</p>
        ) : null}
        <div className="mt-4">
          <ProgressBar
            atual={track.completedCount}
            total={track.totalLessons}
            label="Progresso"
          />
        </div>
      </header>

      <div className="space-y-5">
        {track.weeks.map((w) => (
          <section key={w.week.id}>
            <h2 className="section-title mb-2">{w.week.titulo}</h2>
            <ul className="space-y-2">
              {w.days.map((d) => {
                const node = d.node
                if (!node) {
                  return (
                    <li key={d.day.id} className="card text-sm text-ink-700/60">
                      {d.day.titulo} — em breve
                    </li>
                  )
                }
                const { lesson, completed, locked } = node
                const href = `/programa/${track.program.slug}/aula/${lesson.id}`

                return (
                  <li key={d.day.id}>
                    {locked ? (
                      <div className="card flex items-center gap-3 opacity-70">
                        <StatusDot state="locked" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink-800">
                            {d.day.titulo}
                          </p>
                          <p className="truncate text-sm text-ink-700/70">
                            {lesson.titulo}
                          </p>
                        </div>
                        <LockIcon className="text-ink-700/40" width={20} height={20} />
                      </div>
                    ) : (
                      <Link href={href} className="card flex items-center gap-3">
                        <StatusDot state={completed ? 'done' : 'open'} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink-900">
                            {d.day.titulo}
                          </p>
                          <p className="truncate text-sm text-ink-700">{lesson.titulo}</p>
                        </div>
                        {completed ? (
                          <ChevronRight className="text-ink-700/40" width={20} height={20} />
                        ) : (
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-coral-400 text-white">
                            <PlayIcon width={16} height={16} />
                          </span>
                        )}
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function StatusDot({ state }: { state: 'done' | 'open' | 'locked' }) {
  if (state === 'done') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
        <CheckIcon width={18} height={18} />
      </span>
    )
  }
  if (state === 'locked') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream-200 text-ink-700/40">
        <LockIcon width={16} height={16} />
      </span>
    )
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-coral-200 text-coral-400">
      •
    </span>
  )
}
