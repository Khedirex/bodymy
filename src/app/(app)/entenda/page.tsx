import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { getProgramTrack } from '@/lib/queries'
import { getCircuitosDaAluna } from '@/lib/circuito'
import { SafetyNotice } from '@/components/SafetyNotice'
import { EmptyState } from '@/components/ui/states'
import { BookIcon, ChevronRight } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

// "Entenda a prática": as 28 aulas de movimento somático viram material
// complementar — leitura livre (sem trava sequencial, sem marcar feito).
export default async function EntendaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  // Acesso: algum protocolo da aluna tem este material de leitura
  // (circuitos.programa_slug). O entitlement já é validado pelo circuito.
  const supabase = createClient()
  const programaSlug = (await getCircuitosDaAluna(supabase, profile.id)).find((c) => c.programa_slug)
    ?.programa_slug
  const track = programaSlug
    ? await getProgramTrack(profile.id, programaSlug, { skipEntitlement: true })
    : null
  if (!track) {
    return (
      <EmptyState
        titulo="Material complementario"
        descricao="En cuanto tu acceso esté activo, los textos sobre la práctica aparecerán aquí."
        icone={<BookIcon width={28} height={28} />}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Comprende la práctica</h1>
        <p className="mt-1 text-ink-700">
          Textos cortos sobre el movimiento somático — el porqué detrás de los ejercicios. Lee en
          el orden que quieras, cuando tengas ganas.
        </p>
      </header>

      <SafetyNotice />

      <div className="space-y-5">
        {track.weeks.map((w) => (
          <section key={w.week.id}>
            <h2 className="section-title mb-2">{w.week.titulo}</h2>
            <ul className="space-y-2">
              {w.days.map((d) => {
                if (!d.node) return null
                const { lesson } = d.node
                return (
                  <li key={d.day.id}>
                    <Link href={`/entenda/${lesson.id}`} className="card flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cream-200 text-ink-800">
                        <BookIcon width={18} height={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-ink-900">{lesson.titulo}</p>
                        <p className="truncate text-sm text-ink-700">{lesson.duracao_min} min de lectura</p>
                      </div>
                      <ChevronRight className="text-ink-700/40" width={20} height={20} />
                    </Link>
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
