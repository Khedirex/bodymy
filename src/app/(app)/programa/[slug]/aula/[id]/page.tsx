import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getLessonForUser } from '@/lib/queries'
import { LessonView } from '@/components/lesson/LessonView'
import type { GuiaBloco, Lesson } from '@/types/db'

export const dynamic = 'force-dynamic'

export default async function AulaPage({
  params,
}: {
  params: { slug: string; id: string }
}) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const { hasAccess, ctx } = await getLessonForUser(profile.id, params.id)

  // Sem acesso → manda para a página do programa (que mostra a venda).
  if (!hasAccess || !ctx) {
    redirect(`/programa/${params.slug}`)
  }

  return (
    <LessonView
      lesson={ctx.lesson as Lesson & { conteudo: { intro?: string; blocos: GuiaBloco[] } | null }}
      programSlug={ctx.program.slug}
      programNome={ctx.program.nome}
      weekNumero={ctx.weekNumero}
      dayNumero={ctx.dayNumero}
      jaConcluida={ctx.completed}
      proxima={ctx.proxima}
    />
  )
}
