// =====================================================================
// BodyMy — Regras do circuito adaptativo (fonte única de limites e ajustes)
// Sem promessas estéticas nem linguagem punitiva: os textos de aviso
// explicam o porquê fisiológico do limite, com tom acolhedor.
// =====================================================================
import type { FaixaEtaria, EixoDificuldade } from '@/types/db'

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

// Cronômetro guiado (segundos).
export const PREP_SEG = 5 // preparação antes de cada execução
export const TRANSICAO_SEG = 3 // troca de lado nos bilaterais tipo 'tempo'
export const TEMPO_EXEC_MIN = 10
export const TEMPO_EXEC_MAX = 120
export const clampTempoExec = (n: number) =>
  Math.min(TEMPO_EXEC_MAX, Math.max(TEMPO_EXEC_MIN, Math.round(n)))

// Bloco de mobilidade: 10 alongamentos, 30s cada (bilaterais 30s/lado,
// pescoço 30s por posição), duração fixa para todas as faixas.
export const ALONGAMENTO_SEG = 30
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
// tempo_execucao_seg: duração da execução por série nos exercícios 'tempo'.
// (default 30s p/ todas as faixas — CONFIRMAR com o prompt-base de tempo.)
const PARTIDA: Record<FaixaEtaria, { series: number; descanso_seg: number; tempo_execucao_seg: number }> = {
  '30-35': { series: 4, descanso_seg: 40, tempo_execucao_seg: 30 },
  '36-40': { series: 4, descanso_seg: 60, tempo_execucao_seg: 30 },
  '41-45': { series: 3, descanso_seg: 60, tempo_execucao_seg: 30 },
  '46+': { series: 3, descanso_seg: 40, tempo_execucao_seg: 30 },
}

export function isFaixa(v: unknown): v is FaixaEtaria {
  return v === '30-35' || v === '36-40' || v === '41-45' || v === '46+'
}

export function partidaPorFaixa(
  faixa: FaixaEtaria,
): { series: number; descanso_seg: number; tempo_execucao_seg: number } {
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

// Resultado da proposta de ajuste com base no feedback final.
export type PropostaAjuste =
  | { tipo: 'neutro'; mensagem: string }
  | {
      tipo: 'ajuste'
      eixo: EixoDificuldade
      descricao: string
      // Alterações concretas a aplicar:
      series?: number
      descanso_seg?: number
      variacao_delta?: number // +1 sobe, -1 desce (aplicado a todos os exercícios)
    }
  | { tipo: 'manual'; aviso: string; mensagem: string }

export interface AjusteInput {
  series: number
  descanso_seg: number
  semana: number // 1-4 (limita a variação)
  eixo: EixoDificuldade
  direcao: Direcao
  // Estado das variações por exercício (níveis atuais) — para o eixo 'exercicio'.
  variacaoMin: number
  variacaoMax: number
}

// Núcleo puro do ajuste adaptativo (Parte 3). Quando o eixo escolhido está
// no limite, cai para 'manual' (campo de séries + descanso), que também é a
// alternativa exigida na Semana 1 / v1 e no caso "tudo no limite".
export function proporAjuste(i: AjusteInput): PropostaAjuste {
  if (i.direcao === 'neutro') {
    return {
      tipo: 'neutro',
      mensagem: 'Esse é o ponto ideal! Seu corpo está no desafio certo. Continue assim. 🤍',
    }
  }
  const maisDificil = i.direcao === 'avancar' // ela achou fácil → deixar mais desafiador

  if (i.eixo === 'descanso') {
    // Mais difícil = menos descanso; mais tranquilo = mais descanso.
    if (maisDificil) {
      const novo = i.descanso_seg - DESCANSO_STEP
      if (novo < DESCANSO_MIN) {
        return { tipo: 'manual', aviso: AVISO_DESCANSO_MIN, mensagem: 'Vamos ajustar do seu jeito, dentro do seguro.' }
      }
      return { tipo: 'ajuste', eixo: 'descanso', descanso_seg: novo, descricao: `Menos descanso: ${formatarDescanso(novo)} entre as séries.` }
    }
    const novo = i.descanso_seg + DESCANSO_STEP
    if (novo > DESCANSO_MAX) {
      return { tipo: 'manual', aviso: AVISO_DESCANSO_MAX, mensagem: 'Vamos ajustar do seu jeito, dentro do seguro.' }
    }
    return { tipo: 'ajuste', eixo: 'descanso', descanso_seg: novo, descricao: `Mais descanso: ${formatarDescanso(novo)} entre as séries.` }
  }

  if (i.eixo === 'series') {
    if (maisDificil) {
      const novo = i.series + 1
      if (novo > SERIES_MAX) {
        return { tipo: 'manual', aviso: `Você já está no máximo de ${SERIES_MAX} séries.`, mensagem: 'Que tal ajustar do seu jeito?' }
      }
      return { tipo: 'ajuste', eixo: 'series', series: novo, descricao: `Mais uma série: ${novo} no total.` }
    }
    const novo = i.series - 1
    if (novo < SERIES_MIN) {
      return { tipo: 'manual', aviso: `Você já está no mínimo de ${SERIES_MIN} séries.`, mensagem: 'Que tal ajustar do seu jeito?' }
    }
    return { tipo: 'ajuste', eixo: 'series', series: novo, descricao: `Uma série a menos: ${novo} no total.` }
  }

  // eixo 'exercicio' → troca a variação (limitada pela semana).
  if (i.semana <= 1) {
    return {
      tipo: 'manual',
      aviso: 'Na primeira semana só existe a variação inicial. Podemos ajustar séries e descanso.',
      mensagem: 'Vamos deixar do seu jeito.',
    }
  }
  if (maisDificil) {
    if (i.variacaoMax >= i.semana) {
      return {
        tipo: 'manual',
        aviso: 'Você já está na variação mais avançada disponível nesta semana. Podemos ajustar séries e descanso.',
        mensagem: 'Vamos deixar do seu jeito.',
      }
    }
    return { tipo: 'ajuste', eixo: 'exercicio', variacao_delta: 1, descricao: 'Exercícios um pouquinho mais desafiadores na próxima sessão.' }
  }
  if (i.variacaoMin <= 1) {
    return {
      tipo: 'manual',
      aviso: 'Você já está na variação mais tranquila (v1). Podemos ajustar séries e descanso.',
      mensagem: 'Vamos deixar do seu jeito.',
    }
  }
  return { tipo: 'ajuste', eixo: 'exercicio', variacao_delta: -1, descricao: 'Exercícios um pouco mais tranquilos na próxima sessão.' }
}

// "40s", "1min", "1min30s", "2min"
export function formatarDescanso(seg: number): string {
  if (seg < 60) return `${seg}s`
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return s === 0 ? `${m}min` : `${m}min${s}s`
}
