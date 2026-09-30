import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { getProgramTrack } from '@/lib/queries'
import { getCircuitoPrograma } from '@/lib/circuito'
import { SafetyNotice } from '@/components/SafetyNotice'
import { EmptyState } from '@/components/ui/states'
import { BookIcon, ChevronRight } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

// "Guías del reto": todas as aulas do programa (bienvenida + un día por
// aula) para consultar quando quiser — leitura livre, sem trava sequencial e
// sem marcar feito (o dia se marca em /treino).
export default async function EntendaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  // Acesso: qualquer SKU que libera a experiência (não só o produto canônico).
  const supabase = createClient()
  // O programa que ela acessa (qualquer SKU que libera a experiência). O
  // acesso já vem validado, então a trilha pula a checagem por produto.
  const programa = await getCircuitoPrograma(supabase, profile.id)
  const track = programa
    ? await getProgramTrack(profile.id, programa.slug, { skipEntitlement: true })
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
        <h1 className="text-2xl font-extrabold text-ink-900">Guías del reto</h1>
        <p className="mt-1 text-ink-700">
          Todos los días del reto en un solo lugar. Vuelve a ver un video o repasa una guía
          cuando quieras.
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
                        <p className="truncate text-sm text-ink-700">
                          {lesson.tipo === 'video'
                            ? `Video de ${lesson.duracao_min} min`
                            : `${lesson.duracao_min} min de lectura`}
                        </p>
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
