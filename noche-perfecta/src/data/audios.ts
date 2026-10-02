import type { AudioId } from '../protocol/protocol'

// As 7 Vibraciones Nocturnas, na ordem do protocolo (textos do PDF).
// Para trocar um áudio, substitua o arquivo em public/audios/ mantendo o nome.
export interface AudioMeta {
  id: AudioId
  code: string // "VN1"
  nombre: string
  funcion: string
  duracionSeg: number
  archivo: string
  icono: string
}

export const AUDIOS: AudioMeta[] = [
  { id: 'vn1', code: 'VN1', nombre: 'Apagado Mental', funcion: 'Apaga el ruido de una mente que no se desconecta.', duracionSeg: 420, archivo: '/audios/vn1.mp3', icono: '/illustrations/vn1.webp' },
  { id: 'vn2', code: 'VN2', nombre: 'Liberación Corporal', funcion: 'Suelta la tensión física acumulada del día.', duracionSeg: 428, archivo: '/audios/vn2.mp3', icono: '/illustrations/vn2.webp' },
  { id: 'vn3', code: 'VN3', nombre: 'Reconexión Pineal', funcion: 'El audio clave: te reconecta con tu glándula natural del sueño.', duracionSeg: 425, archivo: '/audios/vn3.mp3', icono: '/illustrations/vn3.webp' },
  { id: 'vn4', code: 'VN4', nombre: 'Ondas Profundas', funcion: 'Profundiza tu sueño, no solo te ayuda a conciliarlo.', duracionSeg: 446, archivo: '/audios/vn4.mp3', icono: '/illustrations/vn4.webp' },
  { id: 'vn5', code: 'VN5', nombre: 'Ancla de Madrugada', funcion: 'Te ayuda a volver a dormir si despiertas. También es tu audio de rescate.', duracionSeg: 425, archivo: '/audios/vn5.mp3', icono: '/illustrations/vn5.webp' },
  { id: 'vn6', code: 'VN6', nombre: 'Sueño Continuo', funcion: 'Te lleva a noches sin interrupciones.', duracionSeg: 484, archivo: '/audios/vn6.mp3', icono: '/illustrations/vn6.webp' },
  { id: 'vn7', code: 'VN7', nombre: 'Sellado', funcion: 'Fija la nueva frecuencia de tu sueño.', duracionSeg: 484, archivo: '/audios/vn7.mp3', icono: '/illustrations/vn7.webp' },
]

export const audioById = (id: AudioId): AudioMeta => AUDIOS.find((a) => a.id === id)!
