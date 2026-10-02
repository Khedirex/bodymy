import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getModulosDaAluna } from '@/lib/modulos'
import { temaDoModulo } from '@/lib/modulo-tema'
import { ProgressBar } from '@/components/ProgressBar'
import { EmptyState } from '@/components/ui/states'
import { ChevronRight, CheckIcon, RouteIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mis rutinas — BodyMy' }

// Todas as rotinas que a compra liberou, com o progresso de cada uma.
// Lê o registro de módulos — não conhece produto por nome.
export default async function RutinasPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const modulos = await getModulosDaAluna(profile.id)

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold text-ink-900">Mis rutinas</h1>
        <p className="mt-1 text-base text-ink-700">Todo lo que ya es tuyo, en un solo lugar.</p>
      </header>

      {modulos.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            titulo="Todavía no tienes rutinas"
            descricao="En cuanto tu acceso esté activo, tus programas aparecerán aquí."
            icone={<RouteIcon width={28} height={28} />}
          />
          <Link href="/descubra" className="btn-secondary w-full">
            Ver qué tiene BodyMy
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {modulos.map(({ modulo, estado }) => {
            const tema = temaDoModulo(modulo.slug)
            return (
            <li key={modulo.slug}>
              <Link href={modulo.href} className="block rounded-3xl bg-white p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${tema.avatar}`}
                  >
                    {modulo.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-bold text-ink-900">{modulo.nome}</span>
                    <span className="block text-base text-ink-700">{modulo.resumo}</span>
                  </span>
                  {estado?.terminado ? (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage-100 text-sage-600">
                      <CheckIcon width={18} height={18} />
                    </span>
                  ) : (
                    <ChevronRight className="shrink-0 text-ink-700/40" width={20} height={20} />
                  )}
                </div>

                {estado && (
                  <div className="mt-4">
                    <ProgressBar
                      atual={estado.concluidos}
                      total={estado.total}
                      label="Tu avance"
                      gradiente={tema.barra}
                    />
                  </div>
                )}
              </Link>
            </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
