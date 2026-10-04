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
  /** Como a aluna escuta: lista livre ou sequência de dias. */
  formato: 'libre' | 'secuencia'
  /** Blocos, quando o conteúdo se divide. */
  blocos?: BlocoBiblioteca[]
  /** Nota de orientação no painel. */
  nota: string
}

export const BIBLIOTECAS: BibliotecaConfig[] = [
  {
    slug: 'madrugada',
    nome: 'Protocolo Reset Madrugada',
    resumo: 'Para cuando despiertas a las 3 y no vuelves a dormir',
    emoji: '🌑',
    productSlugs: ['protocolo-reset-madrugada'],
    formato: 'libre',
    nota: 'Audios de emergencia. Ella elige el que necesita, en el momento — sin orden ni avance.',
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
    formato: 'libre',
    blocos: [
      { slug: 'semana-1', nome: 'Semana 1', alvo: 7 },
      { slug: 'semana-2', nome: 'Semana 2', alvo: 7 },
      { slug: 'semana-3', nome: 'Semana 3', alvo: 7 },
    ],
    nota: '21 audios en tres semanas. Hoy se entregan como lista por semana; si quieres una noche por día con avance, como el ritual, dímelo.',
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
