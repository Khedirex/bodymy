import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/session'
import { getPrimaryProgram } from '@/lib/queries'
import { Onboarding } from './Onboarding'

export const metadata = { title: 'Bienvenida — BodyMy' }
export const dynamic = 'force-dynamic'

export default async function BemVindaPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')

  const primary = await getPrimaryProgram(profile.id)

  return (
    <Onboarding
      nome={profile.nome}
      programaNome={primary?.program.nome ?? 'tu programa'}
    />
  )
}
