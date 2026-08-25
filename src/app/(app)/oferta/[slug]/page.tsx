import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getProductWithAccess } from '@/lib/queries'
import { SalesView } from '@/components/SalesView'
import { CheckIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function OfertaPage({ params }: { params: { slug: string } }) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const result = await getProductWithAccess(profile.id, params.slug)
  if (!result) notFound()

  // Já liberado → não faz sentido vender de novo; mostra estado de acesso.
  if (result.liberado) {
    return (
      <div className="space-y-5">
        <div className="card text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-sage-600">
            <CheckIcon width={28} height={28} />
          </div>
          <h1 className="text-xl font-extrabold text-ink-900">
            Ya tienes acceso a {result.product.nome}
          </h1>
          <p className="mt-1 text-ink-700">¡Qué bueno verte por aquí! Solo tienes que continuar.</p>
          {result.programSlug ? (
            <Link href={`/programa/${result.programSlug}`} className="btn-primary mt-4 w-full">
              Ir al programa
            </Link>
          ) : (
            <Link href="/dieta" className="btn-primary mt-4 w-full">
              Ver contenido
            </Link>
          )}
        </div>
      </div>
    )
  }

  return <SalesView product={result.product} />
}
