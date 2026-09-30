import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getProfile } from '@/lib/session'
import { createClient } from '@/lib/supabase/server'
import {
  getTrainingConfig,
  getCircuitoPrograma,
  getTodayPlan,
  syncLiberacao,
  getAulaDoDia,
  diaDoDesafio,
  type CircuitoPrograma,
} from '@/lib/circuito'
import { todayISO } from '@/lib/dates'
import { AulaDoDia } from '@/components/circuito/AulaDoDia'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { UserTrainingConfig } from '@/types/db'
import { AgeGate } from '@/components/circuito/AgeGate'
import { TreinoFluxo } from '@/components/circuito/TreinoFluxo'
import { EmptyState } from '@/components/ui/states'
import { LockIcon } from '@/components/ui/icons'

export const dynamic = 'force-dynamic'

export default async function TreinoPage() {
  const profile = await getProfile()
  if (!profile) redirect('/login')
  if (!profile.onboarding_completo) redirect('/bem-vinda')

  const supabase = createClient()

  // Acesso ao circuito é por entitlement (mesmo produto). Sem acesso → vitrine.
  // Qual protocolo ela acessa (catálogo, semanas e progresso vêm daqui).
  const programa = await getCircuitoPrograma(supabase, profile.id)
  if (!programa) {
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

  // Formato aula diária (vídeo + texto do dia): não usa séries/descanso, então
  // não precisa do age gate — a posição da aluna é criada direto.
  if (programa.formato === 'aula_diaria') {
    return <AulaDiariaPage supabase={supabase} userId={profile.id} programa={programa} />
  }

  // Sem config → coleta a faixa etária uma única vez (age gate).
  let config = await getTrainingConfig(supabase, profile.id, programa.id)
  if (!config) return <AgeGate />

  // "Avança no próximo acesso": se aguardava uma liberação que já aconteceu.
  config = await syncLiberacao(supabase, profile.id, config, programa)

  const plan = await getTodayPlan(supabase, profile.id, config, programa.id)
  // Concluiu a semana e ainda aguarda a próxima ser liberada.
  const aguardando = config.aguardando_liberacao > 0 ? config.semana_atual : 0

  return (
    <TreinoFluxo
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
  )
}

async function AulaDiariaPage({
  supabase,
  userId,
  programa,
}: {
  supabase: SupabaseClient
  userId: string
  programa: CircuitoPrograma
}) {
  let config = await getTrainingConfig(supabase, userId, programa.id)
  if (!config) {
    // Defaults da tabela (semana 1, dia 1). ignoreDuplicates: duas abas
    // abertas ao mesmo tempo não quebram.
    await supabase
      .from('user_training_config')
      .upsert({ user_id: userId, program_id: programa.id }, { onConflict: 'user_id,program_id', ignoreDuplicates: true })
    config = await getTrainingConfig(supabase, userId, programa.id)
  }
  const posicao: Pick<UserTrainingConfig, 'semana_atual' | 'dia_atual'> = config ?? { semana_atual: 1, dia_atual: 1 }

  // Já fez o dia de hoje? Mostra a aula feita (e quando volta), em vez de
  // liberar o próximo dia no mesmo dia.
  const { data: sessaoHoje } = await supabase
    .from('training_sessions')
    .select('semana, dia')
    .eq('user_id', userId)
    .eq('program_id', programa.id)
    .eq('data', todayISO())
    .eq('completa', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const proximoDia = diaDoDesafio(posicao)
  const dia = sessaoHoje
    ? diaDoDesafio({ semana_atual: sessaoHoje.semana as number, dia_atual: sessaoHoje.dia as number })
    : proximoDia

  const { aula, bienvenidaId } = await getAulaDoDia(programa.id, dia)

  return (
    <AulaDoDia
      dia={dia}
      totalDias={programa.totalDias}
      titulo={aula?.titulo ?? null}
      duracaoMin={aula?.duracao_min ?? 15}
      videoId={aula?.panda_video_id ?? null}
      conteudo={aula?.conteudo ?? null}
      bienvenidaId={bienvenidaId}
      feitoHoje={Boolean(sessaoHoje)}
      proximoDia={proximoDia}
    />
  )
}
