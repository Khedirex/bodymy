import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getLessonForUser } from '@/lib/queries'
import { LessonReader } from '@/components/lesson/LessonReader'

export const dynamic = 'force-dynamic'

export default async function EntendaLessonPage({ params }: { params: { id: string } }) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const { hasAccess, ctx } = await getLessonForUser(profile.id, params.id)
  if (!hasAccess || !ctx) redirect('/entenda')

  const lesson = ctx.lesson
  return (
    <LessonReader titulo={lesson.titulo} duracaoMin={lesson.duracao_min} conteudo={lesson.conteudo} />
  )
}
