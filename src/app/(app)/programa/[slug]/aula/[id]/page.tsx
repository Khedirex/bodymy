import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// As aulas migraram para o material complementar "Entenda a prática".
// Redireciona links antigos para o leitor read-only.
export default function AulaPage({ params }: { params: { slug: string; id: string } }) {
  redirect(`/entenda/${params.id}`)
}
