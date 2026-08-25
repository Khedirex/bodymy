import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getExerciseAdmin } from '@/lib/admin-queries'
import { ExerciseEditor } from '@/components/admin/ExerciseEditor'

export const dynamic = 'force-dynamic'

export default async function ExercicioEditPage({ params }: { params: { id: string } }) {
  const ex = await getExerciseAdmin(params.id)
  if (!ex) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/admin/exercicios" className="hover:underline">← Circuito</Link>
        <span>/</span>
        <span className="text-slate-800">{ex.nome}</span>
      </div>
      <p className="text-sm text-slate-500">
        Día {ex.dia_do_ciclo} del ciclo · posición {ex.ordem_no_dia} de 5 · ejercicio{' '}
        {ex.ordem_no_circuito} de 35
      </p>
      <ExerciseEditor exercise={ex} />
    </div>
  )
}
