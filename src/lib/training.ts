// =====================================================================
// BodyMy — Regras do circuito adaptativo (fonte única de limites e ajustes)
// Sem promessas estéticas nem linguagem punitiva: os textos de aviso
// explicam o porquê fisiológico do limite, com tom acolhedor.
// =====================================================================
import type { FaixaEtaria, EixoDificuldade } from '@/types/db'

// Produto/programa CANÔNICO (a fonte do conteúdo: circuito + aulas).
export const CIRCUITO_PRODUCT_SLUG = 'drenagem-tailandesa'
// Slug atual + anteriores do MESMO produto canônico. Usado para localizar o
// produto/programa e seu conteúdo (resiliente ao rename).
export const CIRCUITO_PRODUCT_SLUGS = ['drenagem-tailandesa', 'ritual-do-tapetinho']
// Produtos cujo entitlement LIBERA a mesma experiência (circuito + aulas).
// Inclui SKUs vendidos à parte que dão o mesmo acesso (ex.: Pilates Hormonal).
export const CIRCUITO_ACCESS_SLUGS = [...CIRCUITO_PRODUCT_SLUGS, 'pilates-hormonal', 'pilates-hormonal-reto']

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
  'Un descanso muy largo enfría el cuerpo y compromete el progreso del entrenamiento. Por eso el máximo es 2 minutos.'
export const AVISO_DESCANSO_MIN =
  'Un descanso muy corto no deja que el cuerpo se recupere y aumenta el riesgo de lesión. Por eso el mínimo es 20 segundos.'

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
      mensagem: '¡Ese es el punto ideal! Tu cuerpo está en el desafío justo. Sigue así. 🤍',
    }
  }
  const maisDificil = i.direcao === 'avancar' // ela achou fácil → deixar mais desafiador

  if (i.eixo === 'descanso') {
    // Mais difícil = menos descanso; mais tranquilo = mais descanso.
    if (maisDificil) {
      const novo = i.descanso_seg - DESCANSO_STEP
      if (novo < DESCANSO_MIN) {
        return { tipo: 'manual', aviso: AVISO_DESCANSO_MIN, mensagem: 'Vamos a ajustarlo a tu manera, dentro de lo seguro.' }
      }
      return { tipo: 'ajuste', eixo: 'descanso', descanso_seg: novo, descricao: `Menos descanso: ${formatarDescanso(novo)} entre las series.` }
    }
    const novo = i.descanso_seg + DESCANSO_STEP
    if (novo > DESCANSO_MAX) {
      return { tipo: 'manual', aviso: AVISO_DESCANSO_MAX, mensagem: 'Vamos a ajustarlo a tu manera, dentro de lo seguro.' }
    }
    return { tipo: 'ajuste', eixo: 'descanso', descanso_seg: novo, descricao: `Más descanso: ${formatarDescanso(novo)} entre las series.` }
  }

  if (i.eixo === 'series') {
    if (maisDificil) {
      const novo = i.series + 1
      if (novo > SERIES_MAX) {
        return { tipo: 'manual', aviso: `Ya estás en el máximo de ${SERIES_MAX} series.`, mensagem: '¿Qué tal ajustarlo a tu manera?' }
      }
      return { tipo: 'ajuste', eixo: 'series', series: novo, descricao: `Una serie más: ${novo} en total.` }
    }
    const novo = i.series - 1
    if (novo < SERIES_MIN) {
      return { tipo: 'manual', aviso: `Ya estás en el mínimo de ${SERIES_MIN} series.`, mensagem: '¿Qué tal ajustarlo a tu manera?' }
    }
    return { tipo: 'ajuste', eixo: 'series', series: novo, descricao: `Una serie menos: ${novo} en total.` }
  }

  // eixo 'exercicio' → troca a variação (limitada pela semana).
  if (i.semana <= 1) {
    return {
      tipo: 'manual',
      aviso: 'En la primera semana solo existe la variación inicial. Podemos ajustar series y descanso.',
      mensagem: 'Vamos a dejarlo a tu manera.',
    }
  }
  if (maisDificil) {
    if (i.variacaoMax >= i.semana) {
      return {
        tipo: 'manual',
        aviso: 'Ya estás en la variación más avanzada disponible esta semana. Podemos ajustar series y descanso.',
        mensagem: 'Vamos a dejarlo a tu manera.',
      }
    }
    return { tipo: 'ajuste', eixo: 'exercicio', variacao_delta: 1, descricao: 'Ejercicios un poquito más desafiantes en la próxima sesión.' }
  }
  if (i.variacaoMin <= 1) {
    return {
      tipo: 'manual',
      aviso: 'Ya estás en la variación más suave (v1). Podemos ajustar series y descanso.',
      mensagem: 'Vamos a dejarlo a tu manera.',
    }
  }
  return { tipo: 'ajuste', eixo: 'exercicio', variacao_delta: -1, descricao: 'Ejercicios un poco más suaves en la próxima sesión.' }
}

// "40s", "1min", "1min30s", "2min"
export function formatarDescanso(seg: number): string {
  if (seg < 60) return `${seg}s`
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return s === 0 ? `${m}min` : `${m}min${s}s`
}
