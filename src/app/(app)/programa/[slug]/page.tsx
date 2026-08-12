import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getProgramMeta, getProgramTrack } from '@/lib/queries'
import { SalesView } from '@/components/SalesView'

export const dynamic = 'force-dynamic'

// O programa em vídeo agora é o Circuito (/treino), e as 28 aulas viram
// material complementar (/entenda). Esta rota antiga redireciona quem tem
// acesso para o circuito; sem acesso, mostra a página de venda.
export default async function ProgramaPage({ params }: { params: { slug: string } }) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const meta = await getProgramMeta(params.slug)
  if (!meta) notFound()

  const track = await getProgramTrack(profile.id, params.slug)
  if (!track) return <SalesView product={meta.product} />

  redirect('/treino')
}
