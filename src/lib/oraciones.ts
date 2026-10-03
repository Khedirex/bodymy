// =====================================================================
// BodyMy — Oración Milagrosa para Noches Bendecidas
//
// Biblioteca de áudio: o catálogo vive no BANCO (audio_biblioteca) e os
// arquivos num bucket PRIVADO do Storage. Nada de conteúdo no repositório —
// são 63 oraciones, e áudio versionado em git é peso que nunca mais sai.
//
// Puro (sem server-only): usado no servidor e nos componentes.
// =====================================================================

export const ORACIONES_MODULO = 'oraciones'

/** Produto que vem no bump: libera as primeiras oraciones. */
export const ORACIONES_PRODUCT_SLUG = 'oracion-noches-bendecidas'

/** Upsell: libera o resto da coleção. */
export const ORACIONES_UPSELL_SLUG = 'oraciones-coleccion-completa'

export const ORACIONES_NOME = 'Oración Milagrosa'

/** Um item da biblioteca, já resolvido para a aluna. */
export interface OracionItem {
  id: string
  titulo: string
  descricao: string | null
  ordem: number
  duracaoSeg: number | null
  /** Ela tem o produto que libera este áudio. */
  liberado: boolean
}

export function formatarDuracao(seg: number | null): string | null {
  if (!seg || seg <= 0) return null
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
