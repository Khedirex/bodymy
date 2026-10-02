// =====================================================================
// BodyMy — Ritual Noche Perfecta
//
// Reprogramación cerebral del sueño: 14 noches, 7 "Vibraciones Nocturnas"
// de ~7 minutos. O conteúdo fica no código (versionado); o banco guarda o
// produto, o programa e o progresso da aluna (noche_registros/noche_estado).
//
// Puro (sem server-only): usado no servidor e nos componentes.
// =====================================================================

export const NOCHE_PRODUCT_SLUG = 'ritual-noche-perfecta'
export const NOCHE_PROGRAM_SLUG = 'ritual-noche-perfecta'
export const NOCHE_NOME = 'Ritual Noche Perfecta'

export const NOCHE_TOTAL_NOCHES = 14
export const NOCHE_BLOCO = 7

/** Nível informado no primeiro acesso — define repetições nas noites 1–4. */
export type NocheNivel = 'leve' | 'moderada' | 'severa'

export type NocheAudioId = 'vn1' | 'vn2' | 'vn3' | 'vn4' | 'vn5' | 'vn6' | 'vn7'

export interface NocheAudio {
  id: NocheAudioId
  code: string
  nombre: string
  funcion: string
  duracionSeg: number
  archivo: string
}

// As 7 Vibraciones Nocturnas, na ordem do protocolo.
export const NOCHE_AUDIOS: NocheAudio[] = [
  { id: 'vn1', code: 'VN1', nombre: 'Apagado Mental', funcion: 'Apaga el ruido de una mente que no se desconecta.', duracionSeg: 420, archivo: '/audios/noche/vn1.mp3' },
  { id: 'vn2', code: 'VN2', nombre: 'Liberación Corporal', funcion: 'Suelta la tensión física acumulada del día.', duracionSeg: 428, archivo: '/audios/noche/vn2.mp3' },
  { id: 'vn3', code: 'VN3', nombre: 'Reconexión Pineal', funcion: 'Te reconecta con tu glándula natural del sueño.', duracionSeg: 425, archivo: '/audios/noche/vn3.mp3' },
  { id: 'vn4', code: 'VN4', nombre: 'Ondas Profundas', funcion: 'Profundiza tu sueño, no solo te ayuda a conciliarlo.', duracionSeg: 446, archivo: '/audios/noche/vn4.mp3' },
  { id: 'vn5', code: 'VN5', nombre: 'Ancla de Madrugada', funcion: 'Te ayuda a volver a dormir si despiertas. También es tu audio de rescate.', duracionSeg: 425, archivo: '/audios/noche/vn5.mp3' },
  { id: 'vn6', code: 'VN6', nombre: 'Sueño Continuo', funcion: 'Te lleva a noches sin interrupciones.', duracionSeg: 484, archivo: '/audios/noche/vn6.mp3' },
  { id: 'vn7', code: 'VN7', nombre: 'Sellado', funcion: 'Fija la nueva frecuencia de tu sueño.', duracionSeg: 484, archivo: '/audios/noche/vn7.mp3' },
]

/** O áudio de resgate, para quando ela acorda de madrugada. */
export const NOCHE_AUDIO_RESCATE: NocheAudioId = 'vn5'

export const audioPorId = (id: NocheAudioId): NocheAudio =>
  NOCHE_AUDIOS.find((a) => a.id === id) ?? NOCHE_AUDIOS[0]

/**
 * Qual áudio toca em cada noite. O ciclo de 7 se repete no segundo bloco:
 * noche 1 e 8 → VN1, noche 2 e 9 → VN2, e assim por diante.
 */
export function audioDaNoche(noche: number): NocheAudio {
  const indice = ((Math.max(1, noche) - 1) % NOCHE_BLOCO) % NOCHE_AUDIOS.length
  return NOCHE_AUDIOS[indice]
}

/** Nas noites 1–4 o nível "severa" repete o áudio na mesma noite. */
export function repeticoesDaNoche(nivel: NocheNivel | null, noche: number): 1 | 2 {
  return nivel === 'severa' && noche <= 4 ? 2 : 1
}

export const NOCHE_NIVEIS: { valor: NocheNivel; label: string; detalhe: string }[] = [
  { valor: 'leve', label: 'Leve', detalhe: 'Me cuesta dormir algunas noches.' },
  { valor: 'moderada', label: 'Moderada', detalhe: 'Casi todas las noches me cuesta, o despierto de madrugada.' },
  { valor: 'severa', label: 'Severa', detalhe: 'Hace mucho que no duermo bien.' },
]
