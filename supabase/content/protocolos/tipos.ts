// =====================================================================
// BodyMy — Formato do conteúdo de cada PROTOCOLO (circuito por produto).
// Cada produto vendável aponta para um circuito (products.circuito) e o
// circuito tem o próprio catálogo: exercícios (com variações) + bloco de
// mobilidade. Fonte única do gerador scripts/gen-protocolos-migration.ts.
//
// Os textos das variações seguem os 5 blocos que a UI já sabe exibir:
// Preparación, Movimiento, Respiración, Qué vas a sentir, Atención.
// =====================================================================

export interface VariacaoConteudo {
  preparacao: string
  movimento: string
  respiracao: string
  sentir: string
  atencao: string
  /** Só para exercícios tipo 'permanencia': segundos segurando a posição. */
  duracao_seg?: number
}

export interface ExercicioProtocolo {
  dia: number // dia do ciclo semanal (1-7)
  ordem: number // ordem no dia (1-5)
  nome: string
  descricao: string // tema curto do dia
  tipo: 'tempo' | 'permanencia'
  bilateral: boolean
  /** variacoes[0] = v1 (semana 1), variacoes[1] = v2 (semana 2)… */
  variacoes: VariacaoConteudo[]
}

export interface AlongamentoProtocolo {
  ordem: number
  nome: string
  descricao: string
  lados: 1 | 2 | 3 // 1 simples, 2 bilateral (30s/lado), 3 três posições
}

export interface ProtocoloConteudo {
  circuito: string
  semanas: number
  alongamentos: AlongamentoProtocolo[]
  exercicios: ExercicioProtocolo[]
}
