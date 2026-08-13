// =====================================================================
// Tipos de domínio do BodyMy.
// Espelham o schema em /supabase/migrations. Mantidos à mão (sem
// geração automática) para o MVP — quando o schema mudar, atualizar aqui.
// =====================================================================

export type ProductTipo = 'programa' | 'dieta_premium' | 'bundle' | 'extra'
export type EntitlementOrigem = 'kiwify' | 'manual' | 'bonus'
export type EntitlementStatus = 'ativo' | 'revogado'
export type LessonTipo = 'video' | 'guia'
export type CheckinTipo = 'treino' | 'dieta' | 'agua'

export interface Profile {
  id: string
  nome: string | null
  email: string | null
  quiz_data: QuizData | null
  onboarding_completo: boolean
  is_admin: boolean
  created_at: string
}

export interface QuizData {
  objetivo?: string
  restricoes?: string[]
  horario_preferido?: 'manha' | 'tarde' | 'noite'
  [key: string]: unknown
}

export interface SalesPage {
  headline: string
  subheadline?: string
  imagem_url?: string
  bullets: string[]
  depoimento?: { texto: string; autora: string }
  cta_label?: string
}

export interface Product {
  id: string
  slug: string
  nome: string
  descricao: string | null
  tipo: ProductTipo
  kiwify_product_id: string | null
  kiwify_checkout_url: string | null
  preco_exibicao: string | null
  sales_page: SalesPage | null
  ativo: boolean
  created_at: string
}

export interface Entitlement {
  id: string
  user_id: string
  product_id: string
  origem: EntitlementOrigem
  kiwify_order_id: string | null
  status: EntitlementStatus
  created_at: string
}

export interface Program {
  id: string
  product_id: string
  slug: string
  nome: string
  descricao: string | null
  capa_url: string | null
  duracao_semanas: number
  ordem_exibicao: number
  ativo: boolean
}

export interface ProgramWeek {
  id: string
  program_id: string
  numero: number
  titulo: string
}

export interface ProgramDay {
  id: string
  week_id: string
  numero: number
  titulo: string
}

export interface GuiaBloco {
  tipo: 'texto' | 'passo' | 'dica' | 'aviso'
  titulo?: string
  conteudo: string
}

export interface Lesson {
  id: string
  day_id: string
  titulo: string
  tipo: LessonTipo
  panda_video_id: string | null
  conteudo: { intro?: string; blocos: GuiaBloco[] } | null
  duracao_min: number
  ordem: number
}

export interface DietPlan {
  id: string
  product_id: string | null
  slug: string
  nome: string
  descricao: string | null
  ativo: boolean
}

export interface Refeicao {
  titulo: string
  itens: string[]
}

export interface DietDayRefeicoes {
  cafe: Refeicao
  almoco: Refeicao
  lanche: Refeicao
  jantar: Refeicao
}

export interface DietDay {
  id: string
  diet_plan_id: string
  numero: number
  refeicoes: DietDayRefeicoes
}

export interface Checkin {
  id: string
  user_id: string
  data: string
  tipo: CheckinTipo
}

export interface LessonCompletion {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
}

export interface ProgressEntry {
  id: string
  user_id: string
  data: string
  foto_path: string | null
  medidas: Record<string, number> | null
  peso: number | null
  nota: string | null
}

export interface WebhookEvent {
  id: string
  provider: string
  event_id: string
  payload: unknown
  processed: boolean
  created_at: string
}

export interface ProductUpsell {
  id: string
  product_id: string
  upsell_product_id: string
  ordem: number
  ativo: boolean
  created_at: string
}

export interface AdminLog {
  id: string
  admin_user_id: string | null
  acao: string
  alvo_tipo: string | null
  alvo_id: string | null
  detalhes: Record<string, unknown> | null
  created_at: string
}

// =====================================================================
// Circuito de vídeo com personalização adaptativa
// =====================================================================
export type FaixaEtaria = '30-35' | '36-40' | '41-45' | '46+'
export type SessionExerciseStatus = 'fez' | 'nao_conseguiu' | 'pulou'
export type EixoDificuldade = 'descanso' | 'exercicio' | 'series'

export type ExercicioTipo = 'tempo' | 'repeticao' | 'permanencia'

export interface Exercise {
  id: string
  nome: string
  descricao: string | null
  dia_do_ciclo: number // 1-7
  ordem_no_dia: number // 1-5
  ordem_no_circuito: number // 1-35
  tipo: ExercicioTipo
  bilateral: boolean
  ativo: boolean
  created_at: string
}

export interface ExerciseVariation {
  id: string
  exercise_id: string
  nivel: number // 1-4
  panda_video_id: string | null
  duracao_seg: number | null
  instrucoes: string | null
  created_at: string
}

export interface Stretch {
  id: string
  nome: string
  descricao: string | null
  panda_video_id: string | null
  ordem: number // 1-10
  duracao_seg: number | null
  lados: number // 1 simples, 2 bilateral (30s/lado), 3 pescoço (3 posições)
  created_at: string
}

export interface UserTrainingConfig {
  user_id: string
  faixa_etaria: FaixaEtaria | null
  series: number // 2-6
  descanso_seg: number // 20-120
  tempo_execucao_seg: number // 10-120 (execução por série nos tipo 'tempo')
  semana_atual: number // 1-4
  dia_atual: number // 1-7
  aguardando_liberacao: number // 0 = não aguarda; senão, a semana aguardada
  atualizado_em: string
}

export interface ProgramWeekConfig {
  semana: number // 1-4
  liberada: boolean
  atualizado_em: string
}

export interface UserExerciseVariation {
  id: string
  user_id: string
  exercise_id: string
  variacao_nivel: number // 1-4
  atualizado_em: string
}

export interface TrainingSession {
  id: string
  user_id: string
  data: string
  semana: number
  dia: number
  completa: boolean
  series_usadas: number | null
  descanso_usado: number | null
  alongou: boolean | null
  created_at: string
}

export interface SessionExercise {
  id: string
  session_id: string
  exercise_id: string
  variacao_nivel: number
  status: SessionExerciseStatus
  ordem: number
  created_at: string
}

export interface SessionFeedback {
  id: string
  session_id: string
  user_id: string
  comentario: string | null
  eixo_dificuldade: EixoDificuldade | null
  intensidade_percebida: number | null // 1-6
  ajuste_aceito: boolean
  ajuste_aplicado: Record<string, unknown> | null
  created_at: string
}
