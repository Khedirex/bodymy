import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { bibliotecaPorSlug, BIBLIOTECAS } from '@/lib/bibliotecas'
import { hasBibliotecaAccess, getCatalogoBiblioteca, getProgressoBiblioteca } from '@/lib/biblioteca-server'
import { BibliotecaLista } from '@/components/biblioteca/BibliotecaLista'
import { BibliotecaSequencia } from '@/components/biblioteca/BibliotecaSequencia'
import { FeedbackOntem } from '@/components/audio/FeedbackOntem'
import { perguntaDeOntem } from '@/lib/feedback-server'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return BIBLIOTECAS.map((b) => ({ slug: b.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const config = bibliotecaPorSlug(params.slug)
  return { title: config ? `${config.nome} — BodyMy` : 'BodyMy' }
}

// Mini-app de QUALQUER biblioteca de áudio. Uma rota serve todos os produtos
// de áudio: o que muda é a configuração em src/lib/bibliotecas.ts.
export default async function BibliotecaPage({ params }: { params: { slug: string } }) {
  const config = bibliotecaPorSlug(params.slug)
  if (!config) notFound()

  const profile = await getProfile()
  if (!profile) redirect('/login')

  if (!(await hasBibliotecaAccess(profile.id, config.slug))) {
    return (
      <div className="space-y-4">
        <EmptyState
          titulo={`${config.nome} aparece aquí`}
          descricao="En cuanto tu acceso esté activo, los audios aparecerán en este espacio."
          icone={<LockIcon width={28} height={28} />}
        />
        <Link href="/descubra" className="btn-secondary w-full">
          Ver qué tiene BodyMy
        </Link>
      </div>
    )
  }

  const ontem = await perguntaDeOntem(profile.id, config.slug)
  const pergunta = ontem ? (
    <FeedbackOntem
      modulo={config.slug}
      data={ontem.data}
      quantos={ontem.quantos}
      titulo={ontem.titulo}
    />
  ) : null

  // Sequência: uma noite por dia, com avanço. Livre: ela escolhe.
  if (config.formato === 'secuencia') {
    const p = await getProgressoBiblioteca(profile.id, config.slug)
    return (
      <div className="space-y-5">
        {pergunta}
        <BibliotecaSequencia
          config={config}
          sequencia={p.sequencia}
          concluidas={p.concluidas}
          proxima={p.proxima}
          feitoHoje={p.feitoHoje}
          terminado={p.terminado}
          total={p.total}
        />
      </div>
    )
  }

  const { itens, bloqueados } = await getCatalogoBiblioteca(profile.id, config.slug)
  return (
    <div className="space-y-5">
      {pergunta}
      <BibliotecaLista config={config} itens={itens} bloqueados={bloqueados} />
    </div>
  )
}
