// =====================================================================
// BodyMy — Regras do circuito adaptativo (fonte única de limites e ajustes)
// Sem promessas estéticas nem linguagem punitiva: os textos de aviso
// explicam o porquê fisiológico do limite, com tom acolhedor.
// =====================================================================
import type { FaixaEtaria } from '@/types/db'

// Produto que dá acesso ao circuito (entitlement). Cada programa é 1 produto.
export const CIRCUITO_PRODUCT_SLUG = 'ritual-do-tapetinho'

// Limites rígidos dos eixos.
export const SERIES_MIN = 2
export const SERIES_MAX = 6
export const DESCANSO_MIN = 20 // segundos
export const DESCANSO_MAX = 120 // segundos (2 min)
export const DESCANSO_STEP = 15 // segundos por ajuste
export const NIVEL_MIN = 1
export const NIVEL_MAX = 4

// Estrutura do programa.
export const SEMANA_ZERO_DIAS = 3
export const ALONGAMENTOS = 10
export const CIRCUITO_SEMANAS = 4
export const CIRCUITO_DIAS = 7
export const EXERCICIOS_POR_DIA = 5
export const TOTAL_EXERCICIOS = CIRCUITO_DIAS * EXERCICIOS_POR_DIA // 35

// Faixas etárias (ordem de exibição) e o ponto de partida de cada uma.
export const FAIXAS: { valor: FaixaEtaria; label: string }[] = [
  { valor: '30-35', label: '30 a 35 anos' },
  { valor: '36-40', label: '36 a 40 anos' },
  { valor: '41-45', label: '41 a 45 anos' },
  { valor: '46+', label: '46 anos ou mais' },
]

// Ponto de PARTIDA por faixa (só a entrada; depois os eixos andam sozinhos).
const PARTIDA: Record<FaixaEtaria, { series: number; descanso_seg: number }> = {
  '30-35': { series: 4, descanso_seg: 40 },
  '36-40': { series: 4, descanso_seg: 60 },
  '41-45': { series: 3, descanso_seg: 60 },
  '46+': { series: 3, descanso_seg: 40 },
}

export function isFaixa(v: unknown): v is FaixaEtaria {
  return v === '30-35' || v === '36-40' || v === '41-45' || v === '46+'
}

export function partidaPorFaixa(faixa: FaixaEtaria): { series: number; descanso_seg: number } {
  return PARTIDA[faixa]
}

export const clampSeries = (n: number) => Math.min(SERIES_MAX, Math.max(SERIES_MIN, Math.round(n)))
export const clampDescanso = (n: number) => Math.min(DESCANSO_MAX, Math.max(DESCANSO_MIN, Math.round(n)))
export const clampNivel = (n: number) => Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, Math.round(n)))

// Nível de entrada da variação conforme a semana (Parte 1 da spec).
// Semana 1 → v1, Semana 2 → v2, etc. Limitado a v4.
export const nivelEntradaSemana = (semana: number) => clampNivel(semana)

// Escala de intensidade percebida (1-6) → direção do ajuste.
export type Intensidade = 1 | 2 | 3 | 4 | 5 | 6
export const INTENSIDADES: { valor: Intensidade; label: string }[] = [
  { valor: 1, label: 'Muito leve' },
  { valor: 2, label: 'Leve' },
  { valor: 3, label: 'Moderado' },
  { valor: 4, label: 'Pouco intenso' },
  { valor: 5, label: 'Intenso' },
  { valor: 6, label: 'Muito intenso' },
]

// 1-3 → oferecer AVANÇAR; 4 → neutro; 5-6 → oferecer REDUZIR.
export type Direcao = 'avancar' | 'neutro' | 'reduzir'
export function direcaoPorIntensidade(nivel: number): Direcao {
  if (nivel <= 3) return 'avancar'
  if (nivel === 4) return 'neutro'
  return 'reduzir'
}

// Avisos dos limites de descanso (Parte 2 — obrigatórios).
export const AVISO_DESCANSO_MAX =
  'Um descanso muito longo esfria o corpo e compromete o progresso do treino. Por isso o máximo é 2 minutos.'
export const AVISO_DESCANSO_MIN =
  'Um descanso muito curto não deixa o corpo se recuperar e aumenta o risco de lesão. Por isso o mínimo é 20 segundos.'
