// =====================================================================
// BIBLIOTECAS DE ÁUDIO — o registro dos mini-apps feitos de áudio.
//
// Cada produto de áudio é uma linha aqui. Acrescentar um produto novo é
// acrescentar um item nesta lista: o painel ganha a aba de upload e a aluna
// ganha o módulo em /biblioteca/<slug>, com acesso pelo entitlement.
// Nenhum arquivo novo, nenhum deploy de rota.
//
// O Ritual Noche Perfecta NÃO está aqui: ele tem nível, marcação de noite e
// progresso próprios, então vive no módulo dele. As oraciones também ficam
// de fora porque já têm rota própria (/oraciones) — as duas aparecem no
// painel pelo mesmo catálogo, mas a tela da aluna é dedicada.
//
// Client-safe.
// =====================================================================

export interface BlocoBiblioteca {
  slug: string
  nome: string
  /** Quantos áudios o bloco deve ter (conferência no painel). */
  alvo: number
  /** Quando usar — aparece abaixo do nome, para a aluna. */
  quando?: string
}

export interface BibliotecaConfig {
  /** Valor da coluna `modulo` em audio_biblioteca. */
  slug: string
  nome: string
  resumo: string
  emoji: string
  /** Produtos que liberam este conteúdo (o primeiro é o padrão no upload). */
  productSlugs: string[]
  /**
   * Como a aluna escuta:
   * - 'libre'     → ela escolhe o que quiser, sem ordem nem avanço;
   * - 'secuencia' → uma noite por dia, na ordem, com progresso guardado.
   */
  formato: 'libre' | 'secuencia'
  /** Blocos, quando o conteúdo se divide. */
  blocos?: BlocoBiblioteca[]
  /** Nota de orientação no painel. */
  nota: string
  /** Guia em PDF do produto, quando existe (vai no módulo e no e-mail). */
  guiaPdf?: string
  /** Como chamar o PDF na tela e no e-mail. */
  guiaTitulo?: string
}

export const BIBLIOTECAS: BibliotecaConfig[] = [
  {
    slug: 'madrugada',
    nome: 'Protocolo Reset Madrugada',
    resumo: 'Para cuando despiertas a las 3 y no vuelves a dormir',
    emoji: '🌑',
    productSlugs: ['protocolo-reset-madrugada'],
    formato: 'libre',
    guiaPdf: '/guias/madrugada/protocolo-reset-madrugada.pdf',
    guiaTitulo: 'El protocolo en PDF',
    nota: 'Audios de emergencia. Ella elige el que necesita, en el momento — sin orden ni avance. El PDF del protocolo va junto, en el módulo y en el correo de acceso.',
  },
  {
    slug: 'dia-perfecto',
    nome: 'Ritual Día Perfecto',
    resumo: 'El complemento de la mañana, para sostener tus noches',
    emoji: '☀️',
    productSlugs: ['ritual-dia-perfecto'],
    formato: 'libre',
    nota: 'El lado diurno del ritual. Lista libre: ella escucha lo que le haga falta ese día.',
  },
  {
    slug: 'mantenimiento',
    nome: 'Ritual de Mantenimiento 21 Noches',
    resumo: '21 noches para que el sueño reconquistado no se pierda',
    emoji: '🔁',
    productSlugs: ['ritual-mantenimiento-21-noches'],
    formato: 'secuencia',
    blocos: [
      { slug: 'semana-1', nome: 'Semana 1', alvo: 7 },
      { slug: 'semana-2', nome: 'Semana 2', alvo: 7 },
      { slug: 'semana-3', nome: 'Semana 3', alvo: 7 },
    ],
    nota: '21 noches, una por día, en el orden de las tres semanas. El orden del upload define la secuencia — igual que en el ritual.',
  },
  {
    slug: 'receta',
    nome: 'Receta Natural Pre-Sueño',
    resumo: 'Lo que tomar antes de acostarte',
    emoji: '🍵',
    productSlugs: ['receta-natural-pre-sueno'],
    formato: 'libre',
    nota: 'Si la receta es un texto o un PDF en vez de audio, dímelo: esta biblioteca sirve para audio, y el PDF se entrega por otro camino.',
  },
]

export const bibliotecaPorSlug = (slug: string): BibliotecaConfig | undefined =>
  BIBLIOTECAS.find((b) => b.slug === slug)

/** Um item da biblioteca, já resolvido para a aluna. */
export interface ItemBiblioteca {
  id: string
  titulo: string
  descricao: string | null
  bloco: string | null
  ordem: number
  duracaoSeg: number | null
  liberado: boolean
}
