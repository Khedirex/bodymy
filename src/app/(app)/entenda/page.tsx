import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { getProgramTrack } from '@/lib/queries'
import { hasCircuitoAccess } from '@/lib/circuito'
import { CIRCUITO_PRODUCT_SLUG } from '@/lib/training'
import { SafetyNotice } from '@/components/SafetyNotice'
import { EmptyState } from '@/components/ui/states'
import { BookIcon, ChevronRight } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

// "Entenda a prática": as 28 aulas de movimento somático viram material
// complementar — leitura livre (sem trava sequencial, sem marcar feito).
export default async function EntendaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  // Acesso: qualquer SKU que libera a experiência (não só o produto canônico).
  const supabase = createClient()
  const temAcesso = await hasCircuitoAccess(supabase, profile.id)
  // Conteúdo é sempre o do programa canônico; entitlement já validado acima.
  const track = temAcesso
    ? await getProgramTrack(profile.id, CIRCUITO_PRODUCT_SLUG, { skipEntitlement: true })
    : null
  if (!track) {
    return (
      <EmptyState
        titulo="Material complementar"
        descricao="Assim que seu acesso estiver ativo, os textos sobre a prática aparecem aqui."
        icone={<BookIcon width={28} height={28} />}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Entenda a prática</h1>
        <p className="mt-1 text-ink-700">
          Textos curtos sobre o movimento somático — o porquê por trás dos exercícios. Leia na
          ordem que quiser, quando tiver vontade.
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
                        <p className="truncate text-sm text-ink-700">{lesson.duracao_min} min de leitura</p>
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
