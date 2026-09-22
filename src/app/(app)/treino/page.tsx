import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import { resolverCircuito, ensureTrainingConfig, getTodayPlan, syncLiberacao } from '@/lib/circuito'
import { AgeGate } from '@/components/circuito/AgeGate'
import { TreinoFluxo } from '@/components/circuito/TreinoFluxo'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function TreinoPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const supabase = createClient()

  // Cada produto libera o PRÓPRIO protocolo. ?c= escolhe entre os que ela
  // possui; sem parâmetro, abre o principal (o primeiro comprado).
  const pedido = typeof searchParams.c === 'string' ? searchParams.c : null
  const { atual, todos } = await resolverCircuito(supabase, profile.id, pedido)
  if (!atual) {
    return (
      <div className="space-y-4">
        <EmptyState
          titulo="Tu entrenamiento aparece aquí"
          descricao="En cuanto tu acceso esté activo, tu circuito del día aparecerá en este espacio."
          icone={<LockIcon width={28} height={28} />}
        />
        <Link href="/descubra" className="btn-secondary w-full">Ver qué tiene BodyMy</Link>
      </div>
    )
  }

  // Seletor de protocolo (só quando ela tem mais de um).
  const seletor =
    todos.length > 1 ? (
      <nav className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4" aria-label="Tus protocolos">
        {todos.map((c) => (
          <Link
            key={c.slug}
            href={`/treino?c=${c.slug}`}
            aria-current={c.slug === atual.slug ? 'page' : undefined}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              c.slug === atual.slug ? 'bg-coral-500 text-white' : 'bg-white text-ink-700 shadow-card'
            }`}
          >
            {c.nome}
          </Link>
        ))}
      </nav>
    ) : null

  // Sem config → cria a partir da faixa do perfil; se não houver, pergunta.
  let config = await ensureTrainingConfig(supabase, profile.id, atual.slug)
  if (!config) {
    return (
      <>
        {seletor}
        <AgeGate circuito={atual.slug} />
      </>
    )
  }

  // "Avança no próximo acesso": se aguardava uma liberação que já aconteceu.
  config = await syncLiberacao(supabase, profile.id, config)

  const plan = await getTodayPlan(supabase, profile.id, config)
  // Concluiu a semana e ainda aguarda a próxima ser liberada.
  const aguardando = config.aguardando_liberacao > 0 ? config.semana_atual : 0

  return (
    <>
      {seletor}
      <TreinoFluxo
        key={atual.slug}
        circuito={atual.slug}
        semana={plan.semana}
        dia={plan.dia}
        series={plan.series}
        descanso_seg={plan.descanso_seg}
        tempoExecSeg={config.tempo_execucao_seg}
        aguardandoDesde={aguardando}
        stretches={plan.stretches}
        exercicios={plan.exercicios.map((e) => ({
          exercise_id: e.exercise.id,
          nome: e.exercise.nome,
          descricao: e.exercise.descricao,
          instrucoes: e.variation?.instrucoes ?? null,
          nivel: e.nivel,
          videoId: e.variation?.panda_video_id ?? null,
          podeFacilitar: e.podeFacilitar,
          tipo: e.exercise.tipo,
          bilateral: e.exercise.bilateral,
          permanenciaSeg: e.variation?.duracao_seg ?? 0,
        }))}
      />
    </>
  )
}
