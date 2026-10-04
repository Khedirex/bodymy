// =====================================================================
// BodyMy — Ritual Noche Perfecta
//
// O ritual é feito de BLOCOS de 7 noites. Três deles formam o caminho em
// sequência (uma noite por dia); dois ficam disponíveis para quando ela
// precisar, fora da ordem:
//
//   Preparación      3 · prepara a reprogramação (os 3 primeiros dias)
//   La Reprogramación 7 · a reprogramação
//   Sueño Profundo    7 · o aprofundamento
//
// Os nomes acima são os que a ALUNA lê. Os slugs no banco continuam
// preparacion / modulo-1 / modulo-2: rótulo é texto de produto, não chave.
//   Refuerzo       7 · se o sono não melhorou
//   Reset profundo 7 · último recurso
//
// Os três primeiros formam a sequência: 17 noites, uma por dia.
//
// O conteúdo NÃO está mais no código: os áudios vivem no bucket privado e
// o catálogo no banco (audio_biblioteca, modulo = 'noche'). Trocar um áudio
// ou acrescentar um bloco é upload no painel, não deploy.
//
// Puro (sem server-only): usado no servidor e nos componentes.
// =====================================================================

export const NOCHE_PRODUCT_SLUG = 'ritual-noche-perfecta'
export const NOCHE_PROGRAM_SLUG = 'ritual-noche-perfecta'
export const NOCHE_NOME = 'Ritual Noche Perfecta'
export const NOCHE_MODULO = 'noche'

/** Guia em PDF: os blocos, como usar e as dúvidas mais comuns. */
export const NOCHE_GUIA_PDF = '/guias/noche/ritual-noche-perfecta-guia.pdf'

/**
 * Quantos áudios cada bloco deve ter. É ALVO de conferência no painel, não
 * regra: o módulo funciona com o que estiver no catálogo, e o número de
 * noites é o que existe — não o que esperamos.
 */
export const NOCHE_ALVO_PADRAO = 7

export interface NocheBloco {
  slug: string
  nome: string
  /** Uma linha, para a aluna entender para que serve. */
  resumo: string
  /**
   * `true` = faz parte da sequência noite a noite.
   * `false` = ela abre quando precisar, fora da ordem.
   */
  sequencial: boolean
  /** Quando usar — só para os blocos fora da sequência. */
  quando?: string
  /** Quantos áudios o bloco deve ter (conferência no painel). */
  alvo: number
}

export const NOCHE_BLOCOS: NocheBloco[] = [
  {
    slug: 'preparacion',
    nome: 'Preparación',
    resumo: 'Tres noches para preparar tu mente antes de empezar.',
    sequencial: true,
    alvo: 3,
  },
  {
    slug: 'modulo-1',
    nome: 'La Reprogramación',
    resumo: 'Siete noches en las que tu sueño empieza a cambiar.',
    sequencial: true,
    alvo: NOCHE_ALVO_PADRAO,
  },
  {
    slug: 'modulo-2',
    nome: 'Sueño Profundo',
    resumo: 'Siete noches para que el cambio se asiente.',
    sequencial: true,
    alvo: NOCHE_ALVO_PADRAO,
  },
  {
    slug: 'refuerzo',
    nome: 'Refuerzo',
    resumo: 'Siete audios de apoyo, para cuando el cambio tarda.',
    sequencial: false,
    quando: 'Si tu sueño todavía no mejoró',
    alvo: NOCHE_ALVO_PADRAO,
  },
  {
    slug: 'reset-profundo',
    nome: 'Reset Profundo',
    resumo: 'El trabajo más fuerte, para un sueño muy castigado.',
    sequencial: false,
    quando: 'Último recurso, si nada funcionó',
    alvo: NOCHE_ALVO_PADRAO,
  },
]

export const blocosSequenciais = () => NOCHE_BLOCOS.filter((b) => b.sequencial)
export const blocosDeApoio = () => NOCHE_BLOCOS.filter((b) => !b.sequencial)
export const blocoPorSlug = (slug: string | null): NocheBloco | null =>
  NOCHE_BLOCOS.find((b) => b.slug === slug) ?? null

/** Nível informado no primeiro acesso — define as repetições do começo. */
export type NocheNivel = 'leve' | 'moderada' | 'severa'

/** Noites iniciais em que o nível "severa" repete o áudio na mesma noite. */
export const NOCHE_NOCHES_REFORCO = 3

export function repeticoesDaNoche(nivel: NocheNivel | null, noche: number): 1 | 2 {
  return nivel === 'severa' && noche <= NOCHE_NOCHES_REFORCO ? 2 : 1
}

export const NOCHE_NIVEIS: { valor: NocheNivel; label: string; detalhe: string }[] = [
  { valor: 'leve', label: 'Leve', detalhe: 'Me cuesta dormir algunas noches.' },
  { valor: 'moderada', label: 'Moderada', detalhe: 'Casi todas las noches me cuesta, o despierto de madrugada.' },
  { valor: 'severa', label: 'Severa', detalhe: 'Hace mucho que no duermo bien.' },
]

/** Um áudio do ritual, já resolvido para a aluna. */
export interface NocheAudio {
  id: string
  titulo: string
  descricao: string | null
  bloco: string | null
  /** Posição na sequência (1..N). Null nos blocos de apoio. */
  noche: number | null
  duracaoSeg: number | null
  resgate: boolean
}

export function formatarDuracao(seg: number | null): string | null {
  if (!seg || seg <= 0) return null
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
