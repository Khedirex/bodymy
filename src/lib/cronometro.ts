// =====================================================================
// BodyMy — Máquina de fases do cronômetro guiado (pura e testável).
// Não conta ticks: o componente calcula o restante por timestamps reais.
// =====================================================================
import type { ExercicioTipo } from '@/types/db'
import { PREP_SEG, TRANSICAO_SEG } from '@/lib/training'

export type FaseTipo = 'prep' | 'exec' | 'exec_manual' | 'transicao' | 'descanso' | 'fim'
export type Lado = 'direito' | 'esquerdo'

export interface Fase {
  tipo: FaseTipo
  duracaoSeg: number // 0 para exec_manual e fim
  serie: number // 1-based (0 no 'fim')
  totalSeries: number
  lado?: Lado
  rotulo: string
  /** true = avança sozinho ao zerar; false = espera um toque (execução no ritmo dela). */
  auto: boolean
}

export interface CronometroInput {
  tipo: ExercicioTipo
  bilateral: boolean
  series: number
  tempoExecSeg: number
  descansoSeg: number
  permanenciaSeg: number
  prepSeg?: number
  transicaoSeg?: number
}

const ROTULO: Record<FaseTipo, string> = {
  prep: 'Prepare-se',
  exec: 'Execute',
  exec_manual: 'Execute no seu ritmo',
  transicao: 'Troque de lado',
  descanso: 'Descanse',
  fim: 'Muito bem!',
}

// Constrói a sequência de fases para um exercício, usando a config da aluna.
export function construirFases(i: CronometroInput): Fase[] {
  const prep = i.prepSeg ?? PREP_SEG
  const transicao = i.transicaoSeg ?? TRANSICAO_SEG
  const fases: Fase[] = []

  const prepFase = (serie: number, total: number): Fase => ({
    tipo: 'prep', duracaoSeg: prep, serie, totalSeries: total, rotulo: ROTULO.prep, auto: true,
  })
  const fimFase = (): Fase => ({ tipo: 'fim', duracaoSeg: 0, serie: 0, totalSeries: 0, rotulo: ROTULO.fim, auto: false })

  if (i.tipo === 'permanencia') {
    fases.push(prepFase(1, 1))
    fases.push({ tipo: 'exec', duracaoSeg: Math.max(1, i.permanenciaSeg || i.tempoExecSeg), serie: 1, totalSeries: 1, rotulo: ROTULO.exec, auto: true })
    fases.push(fimFase())
    return fases
  }

  const total = Math.max(1, i.series)
  for (let s = 1; s <= total; s++) {
    fases.push(prepFase(s, total))

    if (i.tipo === 'repeticao') {
      fases.push({ tipo: 'exec_manual', duracaoSeg: 0, serie: s, totalSeries: total, rotulo: ROTULO.exec_manual, auto: false })
    } else if (i.bilateral) {
      // tempo bilateral: direito → transição → esquerdo (conta como 1 série)
      fases.push({ tipo: 'exec', duracaoSeg: i.tempoExecSeg, serie: s, totalSeries: total, lado: 'direito', rotulo: ROTULO.exec, auto: true })
      fases.push({ tipo: 'transicao', duracaoSeg: transicao, serie: s, totalSeries: total, rotulo: ROTULO.transicao, auto: true })
      fases.push({ tipo: 'exec', duracaoSeg: i.tempoExecSeg, serie: s, totalSeries: total, lado: 'esquerdo', rotulo: ROTULO.exec, auto: true })
    } else {
      fases.push({ tipo: 'exec', duracaoSeg: i.tempoExecSeg, serie: s, totalSeries: total, rotulo: ROTULO.exec, auto: true })
    }

    // Descanso entre séries — nunca após a última.
    if (s < total) {
      fases.push({ tipo: 'descanso', duracaoSeg: i.descansoSeg, serie: s, totalSeries: total, rotulo: ROTULO.descanso, auto: true })
    }
  }
  fases.push(fimFase())
  return fases
}

// Índice da fase 'prep' de uma série (para o botão "Voltar série").
export function indicePrepDaSerie(fases: Fase[], serie: number): number {
  const idx = fases.findIndex((f) => f.tipo === 'prep' && f.serie === serie)
  return idx >= 0 ? idx : 0
}

// -------------------- Bloco de mobilidade --------------------
// Sequência contínua dos 10 alongamentos: 30s cada, sem descanso, avanço
// automático. Bilaterais (lados=2) = 30s direito + 30s esquerdo. Pescoço
// (lados=3) = 30s em cada direção (direita, esquerda, frente).
export interface AlongamentoInput {
  nome: string
  lados: number // 1 | 2 | 3
}
export interface FaseAlongamento {
  duracaoSeg: number
  nome: string
  posicao?: string // "lado direito" | "à esquerda" | ...
  indice: number // 1-based (qual alongamento)
  total: number // total de alongamentos
}

const POSICOES: Record<number, string[]> = {
  2: ['lado direito', 'lado esquerdo'],
  3: ['à direita', 'à esquerda', 'à frente'],
}

export function construirFasesAlongamento(alongamentos: AlongamentoInput[], seg: number): FaseAlongamento[] {
  const total = alongamentos.length
  const fases: FaseAlongamento[] = []
  alongamentos.forEach((a, i) => {
    const posicoes = POSICOES[a.lados]
    if (posicoes) {
      for (const p of posicoes) {
        fases.push({ duracaoSeg: seg, nome: a.nome, posicao: p, indice: i + 1, total })
      }
    } else {
      fases.push({ duracaoSeg: seg, nome: a.nome, indice: i + 1, total })
    }
  })
  return fases
}

// -------------------- Sinalização --------------------
export interface Sinal {
  vibrar: number[] // padrão para navigator.vibrate (ignorado no iOS)
  freq: number // Hz do tom suave
  durMs: number
}

// Sinal ao ENTRAR em cada fase. Padrões distintos p/ reconhecer sem olhar:
// execução = 1 vibração curta; descanso = 2; transição = 2 rápidas.
export function sinalDaFase(tipo: FaseTipo): Sinal | null {
  switch (tipo) {
    case 'prep':
      return { vibrar: [80], freq: 440, durMs: 120 }
    case 'exec':
    case 'exec_manual':
      return { vibrar: [200], freq: 660, durMs: 160 }
    case 'transicao':
      return { vibrar: [100, 60, 100], freq: 550, durMs: 120 }
    case 'descanso':
      return { vibrar: [120, 90, 120], freq: 392, durMs: 200 }
    case 'fim':
      return { vibrar: [200], freq: 523, durMs: 260 }
    default:
      return null
  }
}
