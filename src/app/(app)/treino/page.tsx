import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { getTrainingConfig, hasCircuitoAccess, getTodayPlan } from '@/lib/circuito'
import { AgeGate } from '@/components/circuito/AgeGate'
import { SemanaZeroView } from '@/components/circuito/SemanaZeroView'
import { CircuitoSession } from '@/components/circuito/CircuitoSession'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function TreinoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const supabase = createClient()

  // Acesso ao circuito é por entitlement (mesmo produto). Sem acesso → vitrine.
  const temAcesso = await hasCircuitoAccess(supabase, profile.id)
  if (!temAcesso) {
    return (
      <div className="space-y-4">
        <EmptyState
          titulo="Seu treino aparece aqui"
          descricao="Assim que seu acesso estiver ativo, seu circuito do dia aparece neste espaço."
          icone={<LockIcon width={28} height={28} />}
        />
        <Link href="/descubra" className="btn-secondary w-full">Ver o que tem no BodyMy</Link>
      </div>
    )
  }

  // Sem config → coleta a faixa etária uma única vez (age gate).
  const config = await getTrainingConfig(supabase, profile.id)
  if (!config) return <AgeGate />

  const plan = await getTodayPlan(supabase, profile.id, config)

  if (plan.tipo === 'semana_zero') {
    return <SemanaZeroView dia={plan.diaSemanaZero} stretches={plan.stretches} />
  }

  return (
    <CircuitoSession
      semana={plan.semana}
      dia={plan.dia}
      series={plan.series}
      descanso_seg={plan.descanso_seg}
      exercicios={plan.exercicios.map((e) => ({
        exercise_id: e.exercise.id,
        nome: e.exercise.nome,
        descricao: e.exercise.descricao,
        instrucoes: e.variation?.instrucoes ?? null,
        nivel: e.nivel,
        videoId: e.variation?.panda_video_id ?? null,
        podeFacilitar: e.podeFacilitar,
      }))}
    />
  )
}
