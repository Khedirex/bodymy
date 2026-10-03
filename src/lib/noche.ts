// =====================================================================
// BodyMy — Ritual Noche Perfecta
//
// O ritual é feito de BLOCOS de 7 noites. Três deles formam o caminho em
// sequência (uma noite por dia); dois ficam disponíveis para quando ela
// precisar, fora da ordem:
//
//   Preparación    7 · prepara a reprogramação
//   Módulo 1       7 · a reprogramação
//   Módulo 2       7 · o aprofundamento
//   Refuerzo       7 · se o sono não melhorou
//   Reset profundo 7 · último recurso
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

/** Quantos áudios cada bloco tem. Serve de alvo no painel, não de regra. */
export const NOCHE_POR_BLOCO = 7

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
}

export const NOCHE_BLOCOS: NocheBloco[] = [
  {
    slug: 'preparacion',
    nome: 'Preparación',
    resumo: 'Prepara tu mente y tu cuerpo para la reprogramación.',
    sequencial: true,
  },
  {
    slug: 'modulo-1',
    nome: 'Módulo 1',
    resumo: 'La reprogramación empieza aquí.',
    sequencial: true,
  },
  {
    slug: 'modulo-2',
    nome: 'Módulo 2',
    resumo: 'Profundiza lo que ya empezó a cambiar.',
    sequencial: true,
  },
  {
    slug: 'refuerzo',
    nome: 'Refuerzo',
    resumo: 'Siete noches más de apoyo, cuando el cambio tarda.',
    sequencial: false,
    quando: 'Si tu sueño todavía no mejoró',
  },
  {
    slug: 'reset-profundo',
    nome: 'Reset Profundo',
    resumo: 'El trabajo más fuerte, para un sueño muy castigado.',
    sequencial: false,
    quando: 'Último recurso, si nada funcionó',
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
  /** Só o conteúdo legado em public/ usa isto; o resto vem assinado. */
  urlPublica?: string
}

export function formatarDuracao(seg: number | null): string | null {
  if (!seg || seg <= 0) return null
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
