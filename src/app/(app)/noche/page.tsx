import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { hasNocheAccess, getNocheEstado, getNocheCatalogo } from '@/lib/noche-server'
import { NocheRitual } from '@/components/noche/NocheRitual'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ritual Noche Perfecta — BodyMy' }

// Mini-app do Ritual Noche Perfecta. O acesso é pelo ENTITLEMENT da compra,
// igual aos outros módulos — nada de página aberta.
export default async function NochePage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  if (!(await hasNocheAccess(profile.id))) {
    return (
      <div className="space-y-4">
        <EmptyState
          titulo="Tu ritual aparece aquí"
          descricao="En cuanto tu acceso esté activo, las noches del ritual aparecerán en este espacio."
          icone={<LockIcon width={28} height={28} />}
        />
        <Link href="/descubra" className="btn-secondary w-full">
          Ver qué tiene BodyMy
        </Link>
      </div>
    )
  }

  const [estado, catalogo] = await Promise.all([
    getNocheEstado(profile.id),
    getNocheCatalogo(),
  ])

  const audioDeHoje =
    catalogo.sequencia.find((a) => a.noche === estado.proximaNoche) ?? null

  return (
    <NocheRitual
      nivel={estado.nivel}
      concluidas={estado.concluidas}
      proximaNoche={estado.proximaNoche}
      feitoHoje={estado.feitoHoje}
      terminado={estado.terminado}
      total={estado.total}
      audioDeHoje={audioDeHoje}
      apoio={catalogo.apoio}
      resgate={catalogo.resgate}
    />
  )
}
