import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { hasOracionesAccess, getOracionesCatalogo } from '@/lib/oraciones-server'
import { OracionesLista } from '@/components/oraciones/OracionesLista'
import { FeedbackOntem } from '@/components/audio/FeedbackOntem'
import { perguntaDeOntem } from '@/lib/feedback-server'
import { ORACIONES_MODULO } from '@/lib/oraciones'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Oración Milagrosa — BodyMy' }

// Mini-app das oraciones. Acesso pelo ENTITLEMENT, igual aos outros módulos.
export default async function OracionesPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  if (!(await hasOracionesAccess(profile.id))) {
    return (
      <div className="space-y-4">
        <EmptyState
          titulo="Tus oraciones aparecen aquí"
          descricao="En cuanto tu acceso esté activo, las oraciones aparecerán en este espacio."
          icone={<LockIcon width={28} height={28} />}
        />
        <Link href="/descubra" className="btn-secondary w-full">
          Ver qué tiene BodyMy
        </Link>
      </div>
    )
  }

  const [{ itens, liberados, bloqueados }, ontem] = await Promise.all([
    getOracionesCatalogo(profile.id),
    perguntaDeOntem(profile.id, ORACIONES_MODULO),
  ])

  return (
    <div className="space-y-5">
      {ontem && <FeedbackOntem audioId={ontem.audioId} titulo={ontem.titulo} />}
      <OracionesLista itens={itens} liberados={liberados} bloqueados={bloqueados} />
    </div>
  )
}
