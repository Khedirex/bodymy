import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { hasCisneAccess } from '@/lib/cisne-server'
import { CISNE_BIBLIOTECA, CISNE_INTENSIDADES, doseNaSemana } from '@/lib/cisne'
import { ExercicioDetalhe } from '@/components/cisne/ExercicioDetalhe'
import { ChevronLeft } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Biblioteca de ejercicios — Reset Postura de Cisne' }

// Biblioteca ilustrada: como fazer cada um dos 12 movimentos.
export default async function CisneEjerciciosPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!(await hasCisneAccess(profile.id))) redirect('/cisne')

  return (
    <div className="space-y-5">
      <Link href="/cisne" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-700">
        <ChevronLeft width={18} height={18} /> Reset Postura de Cisne
      </Link>
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-sage-600">Biblioteca de ejercicios</p>
        <h1 className="text-2xl font-extrabold text-ink-900">Cómo hacer cada movimiento</h1>
      </header>

      {CISNE_BIBLIOTECA.map((e) => (
        <details key={e.id} className="card group p-4">
          <summary className="flex cursor-pointer list-none items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.imagem} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-coral-600">
                EJERCICIO {String(e.numero).padStart(2, '0')}
              </span>
              <span className="block font-bold text-ink-900">{e.nome}</span>
            </span>
            <span className="text-ink-700/40 transition group-open:rotate-90">›</span>
          </summary>
          <div className="mt-4 space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={e.imagem} alt={e.nome} className="w-full rounded-2xl" loading="lazy" />
            <ExercicioDetalhe exercicio={e} />
            <table className="w-full text-sm">
              <tbody>
                {CISNE_INTENSIDADES.map((int) => (
                  <tr key={int.semana} className="border-t border-cream-200">
                    <td className="py-1.5 text-ink-700">Semana {int.semana} · {int.nome}</td>
                    <td className="py-1.5 text-right font-bold text-ink-900">{doseNaSemana(e, int.semana)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ))}
    </div>
  )
}
