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
