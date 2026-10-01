import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getCisneEstado, hasCisneAccess, podeAbrirDia } from '@/lib/cisne-server'
import { getCisneDia, isDiaValido } from '@/lib/cisne'
import { DiaCisne } from '@/components/cisne/DiaCisne'

export const dynamic = 'force-dynamic'

export default async function CisneDiaPage({ params }: { params: { n: string } }) {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const n = Number(params.n)
  if (!isDiaValido(n)) notFound()
  if (!(await hasCisneAccess(profile.id))) redirect('/cisne')

  // Dia ainda bloqueado (fora de ordem ou já fez um dia hoje) → painel.
  const estado = await getCisneEstado(profile.id)
  if (!podeAbrirDia(estado, n)) redirect('/cisne')

  const registro = estado.registros.get(n)
  return (
    <DiaCisne
      key={n}
      dia={getCisneDia(n)}
      jaFeito={Boolean(registro)}
      cuelloAnterior={registro?.cuello ?? null}
    />
  )
}
